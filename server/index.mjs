import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { createSign } from "node:crypto";

const PORT = Number(process.env.PORT || 3000);
const STATIC_ROOT = resolve(process.env.STATIC_ROOT || join(process.cwd(), "dist"));
const PUBLIC_ROOT = resolve(process.env.PUBLIC_ROOT || join(process.cwd(), "public"));
const DRIVE_FOLDER_ID =
  process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || "1jYFYbdJdJHT-f7BpzFX9t1mQLD6xwgbd";
const GITHUB_REPO = process.env.GITHUB_REPO || "thenorm-br/faesde";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const PUBLIC_BASE_PATH = process.env.EAD_PUBLIC_BASE_PATH || "/eadplataforma";
const MAX_GITHUB_FILE_MB = Number(process.env.EAD_GITHUB_MAX_FILE_MB || 25);
const MAX_GITHUB_BYTES = MAX_GITHUB_FILE_MB * 1024 * 1024;
const DRIVE_SCAN_LIMIT = Number(process.env.GOOGLE_DRIVE_SCAN_LIMIT || 5000);
const MANIFEST_PATH = process.env.EAD_DRIVE_MANIFEST_PATH || "public/eadplataforma-drive-manifest.json";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

let googleTokenCache = null;

function jsonResponse(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload, null, 2));
}

function textResponse(res, statusCode, message) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(message);
}

function base64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function providerState(provider, overrides = {}) {
  const defaults = {
    google_drive: {
      provider: "google_drive",
      label: "Google Drive",
      status: "not_configured",
      message: "Configure GOOGLE_SERVICE_ACCOUNT_JSON no Coolify e compartilhe a pasta com o e-mail da service account.",
      externalId: DRIVE_FOLDER_ID,
      requiredSecrets: ["GOOGLE_SERVICE_ACCOUNT_JSON", "GOOGLE_DRIVE_ROOT_FOLDER_ID"],
      capabilities: { read: false, write: false, scan: false },
    },
    github: {
      provider: "github",
      label: "GitHub",
      status: "ready",
      message: "Repositorio configurado. Para escrita automatica, configure GITHUB_TOKEN no Coolify.",
      externalId: `${GITHUB_REPO}@${GITHUB_BRANCH}`,
      requiredSecrets: ["GITHUB_TOKEN"],
      capabilities: { read: true, write: Boolean(process.env.GITHUB_TOKEN), scan: false },
    },
  };

  return {
    ...defaults[provider],
    ...overrides,
    lastCheckedAt: new Date().toISOString(),
  };
}

function getConfig() {
  return {
    driveRootFolderId: DRIVE_FOLDER_ID,
    githubRepo: GITHUB_REPO,
    githubBranch: GITHUB_BRANCH,
    publicBasePath: PUBLIC_BASE_PATH,
    maxGithubFileMb: MAX_GITHUB_FILE_MB,
    scanLimit: DRIVE_SCAN_LIMIT,
  };
}

function getGoogleCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
  const value = raw || (base64 ? Buffer.from(base64, "base64").toString("utf8") : "");

  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    if (!parsed.client_email || !parsed.private_key) return null;
    return {
      clientEmail: parsed.client_email,
      privateKey: String(parsed.private_key).replace(/\\n/g, "\n"),
    };
  } catch {
    return null;
  }
}

async function getGoogleAccessToken() {
  if (googleTokenCache && googleTokenCache.expiresAt > Date.now() + 60000) {
    return googleTokenCache.accessToken;
  }

  const credentials = getGoogleCredentials();
  if (!credentials) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON nao configurado ou invalido.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(
    JSON.stringify({
      iss: credentials.clientEmail,
      scope: "https://www.googleapis.com/auth/drive",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const signature = signer
    .sign(credentials.privateKey, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || "Falha ao autenticar no Google Drive.");
  }

  googleTokenCache = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + Number(payload.expires_in || 3600) * 1000,
  };

  return googleTokenCache.accessToken;
}

async function driveRequest(pathname, params = {}) {
  const token = await getGoogleAccessToken();
  const url = new URL(`https://www.googleapis.com/drive/v3/${pathname}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  });

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message || "Falha ao consultar Google Drive.");
  }

  return payload;
}

async function githubRequest(pathname, options = {}) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "faesde-sync",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(options.headers || {}),
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com${pathname}`, {
    ...options,
    headers,
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(payload.message || "Falha ao consultar GitHub.");
  }

  return payload;
}

function getBearer(req) {
  const auth = req.headers.authorization || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

async function requireAdmin(req) {
  if (process.env.SYNC_DISABLE_AUTH === "true") {
    return { id: "local-dev", email: "local-dev@faesde" };
  }

  const accessToken = getBearer(req);
  if (!accessToken) {
    const error = new Error("Login admin necessario.");
    error.statusCode = 401;
    throw error;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !anonKey) {
    const error = new Error("Variaveis do Supabase nao configuradas no servidor.");
    error.statusCode = 500;
    throw error;
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const user = await userResponse.json();

  if (!userResponse.ok || !user?.id) {
    const error = new Error("Sessao admin invalida.");
    error.statusCode = 401;
    throw error;
  }

  const roleUrl = `${supabaseUrl}/rest/v1/user_roles?select=role&user_id=eq.${encodeURIComponent(
    user.id,
  )}&role=eq.admin`;
  const roleResponse = await fetch(roleUrl, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const roles = roleResponse.ok ? await roleResponse.json() : [];

  if (!Array.isArray(roles) || roles.length === 0) {
    const error = new Error("Usuario sem permissao de admin.");
    error.statusCode = 403;
    throw error;
  }

  return { id: user.id, email: user.email };
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024 * 1024) throw new Error("Payload muito grande.");
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function checkGoogleDrive() {
  if (!getGoogleCredentials()) {
    return providerState("google_drive");
  }

  const folder = await driveRequest(`files/${encodeURIComponent(DRIVE_FOLDER_ID)}`, {
    fields: "id,name,mimeType,modifiedTime",
    supportsAllDrives: "true",
  });
  const firstPage = await driveRequest("files", {
    q: `'${DRIVE_FOLDER_ID.replace(/'/g, "\\'")}' in parents and trashed=false`,
    fields: "files(id,name,mimeType,size,modifiedTime),nextPageToken",
    pageSize: "10",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
  });

  return providerState("google_drive", {
    status: "connected",
    message: `Pasta "${folder.name}" acessivel. ${firstPage.files?.length || 0} item(ns) lidos no teste.`,
    externalId: folder.id,
    capabilities: { read: true, write: true, scan: true },
    details: {
      folderName: folder.name,
      modifiedTime: folder.modifiedTime,
      sampleCount: firstPage.files?.length || 0,
    },
  });
}

async function checkGitHub() {
  const repo = await githubRequest(`/repos/${GITHUB_REPO}`);
  const branch = await githubRequest(`/repos/${GITHUB_REPO}/branches/${encodeURIComponent(GITHUB_BRANCH)}`);
  const hasToken = Boolean(process.env.GITHUB_TOKEN);

  return providerState("github", {
    status: hasToken ? "connected" : "read_only",
    message: hasToken
      ? `Repositorio ${repo.full_name} conectado com escrita server-side.`
      : `Repositorio ${repo.full_name} acessivel em leitura publica. Configure GITHUB_TOKEN para escrever manifesto.`,
    externalId: `${repo.full_name}@${branch.name}`,
    requiredSecrets: hasToken ? [] : ["GITHUB_TOKEN"],
    capabilities: {
      read: true,
      write: hasToken,
      scan: false,
    },
    details: {
      defaultBranch: repo.default_branch,
      private: repo.private,
      branchSha: branch.commit?.sha,
    },
  });
}

async function buildDriveManifest() {
  if (!getGoogleCredentials()) {
    throw new Error("Configure GOOGLE_SERVICE_ACCOUNT_JSON para escanear o Drive.");
  }

  const root = await driveRequest(`files/${encodeURIComponent(DRIVE_FOLDER_ID)}`, {
    fields: "id,name,mimeType,modifiedTime",
    supportsAllDrives: "true",
  });

  const stats = {
    folders: 0,
    files: 0,
    bytes: 0,
    githubEligibleFiles: 0,
    driveOnlyFiles: 0,
    htmlFiles: 0,
    videos: 0,
    truncated: false,
  };
  const items = [];

  async function walk(folderId, folderPath) {
    if (items.length >= DRIVE_SCAN_LIMIT) {
      stats.truncated = true;
      return;
    }

    let pageToken;
    do {
      const page = await driveRequest("files", {
        q: `'${folderId.replace(/'/g, "\\'")}' in parents and trashed=false`,
        fields:
          "files(id,name,mimeType,size,modifiedTime,md5Checksum,webContentLink),nextPageToken",
        pageSize: "1000",
        pageToken,
        supportsAllDrives: "true",
        includeItemsFromAllDrives: "true",
      });

      for (const file of page.files || []) {
        if (items.length >= DRIVE_SCAN_LIMIT) {
          stats.truncated = true;
          return;
        }

        const relativePath = folderPath ? `${folderPath}/${file.name}` : file.name;
        const isFolder = file.mimeType === "application/vnd.google-apps.folder";

        if (isFolder) {
          stats.folders += 1;
          items.push({
            type: "folder",
            path: relativePath,
            driveFileId: file.id,
            modifiedTime: file.modifiedTime,
          });
          await walk(file.id, relativePath);
          continue;
        }

        const size = Number(file.size || 0);
        const ext = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
        const isVideo = ["mp4", "webm", "mov", "avi", "mkv"].includes(ext);
        const driveOnly = isVideo || size > MAX_GITHUB_BYTES;

        stats.files += 1;
        stats.bytes += size;
        stats.githubEligibleFiles += driveOnly ? 0 : 1;
        stats.driveOnlyFiles += driveOnly ? 1 : 0;
        stats.htmlFiles += ["html", "htm"].includes(ext) ? 1 : 0;
        stats.videos += isVideo ? 1 : 0;

        items.push({
          type: "file",
          path: relativePath,
          driveFileId: file.id,
          mimeType: file.mimeType,
          size,
          extension: ext,
          modifiedTime: file.modifiedTime,
          md5Checksum: file.md5Checksum,
          storageTarget: driveOnly ? "drive_proxy" : "github_cache",
        });
      }

      pageToken = page.nextPageToken;
    } while (pageToken);
  }

  await walk(root.id, "");

  return {
    generatedAt: new Date().toISOString(),
    source: {
      provider: "google_drive",
      rootFolderId: root.id,
      rootFolderName: root.name,
      rootModifiedTime: root.modifiedTime,
    },
    github: {
      repo: GITHUB_REPO,
      branch: GITHUB_BRANCH,
      maxFileMb: MAX_GITHUB_FILE_MB,
      manifestPath: MANIFEST_PATH,
    },
    publicBasePath: PUBLIC_BASE_PATH,
    stats,
    items,
  };
}

async function writeManifestToGitHub(manifest) {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("Configure GITHUB_TOKEN no Coolify para escrever no GitHub.");
  }

  const encodedPath = MANIFEST_PATH.split("/").map(encodeURIComponent).join("/");
  let sha;

  try {
    const existing = await githubRequest(`/repos/${GITHUB_REPO}/contents/${encodedPath}?ref=${GITHUB_BRANCH}`);
    sha = existing.sha;
  } catch {
    sha = undefined;
  }

  const content = Buffer.from(JSON.stringify(manifest, null, 2), "utf8").toString("base64");
  const payload = {
    message: "Atualiza manifesto EAD do Drive",
    content,
    branch: GITHUB_BRANCH,
    ...(sha ? { sha } : {}),
  };

  const result = await githubRequest(`/repos/${GITHUB_REPO}/contents/${encodedPath}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return result.commit?.sha;
}

async function handleApi(req, res, url) {
  if (url.pathname === "/api/health") {
    return jsonResponse(res, 200, {
      ok: true,
      serverTime: new Date().toISOString(),
      staticRoot: STATIC_ROOT,
    });
  }

  try {
    if (req.method === "GET" && url.pathname === "/api/sync/status") {
      const githubReady = Boolean(GITHUB_REPO && GITHUB_BRANCH);
      const googleConfigured = Boolean(getGoogleCredentials());

      return jsonResponse(res, 200, {
        ok: true,
        serverTime: new Date().toISOString(),
        config: getConfig(),
        providers: {
          google_drive: providerState("google_drive", {
            status: googleConfigured ? "ready" : "not_configured",
            message: googleConfigured
              ? "Service account encontrada. Clique em Validar conexao para testar a pasta."
              : "Configure GOOGLE_SERVICE_ACCOUNT_JSON no Coolify e compartilhe a pasta com a service account.",
            capabilities: { read: false, write: false, scan: googleConfigured },
          }),
          github: providerState("github", {
            status: githubReady ? "ready" : "not_configured",
            message: process.env.GITHUB_TOKEN
              ? "Token GitHub configurado. Clique em Validar conexao para testar escrita/leitura."
              : "Repositorio configurado. Sem GITHUB_TOKEN, o teste fica em leitura publica.",
            requiredSecrets: process.env.GITHUB_TOKEN ? [] : ["GITHUB_TOKEN"],
          }),
        },
        sql: {
          enabled: false,
          message: "SQL ficou para uma etapa futura de redundancia.",
        },
      });
    }

    await requireAdmin(req);

    if (req.method === "POST" && url.pathname === "/api/sync/connect") {
      const body = await readJsonBody(req);
      if (body.provider === "google_drive") {
        return jsonResponse(res, 200, { provider: await checkGoogleDrive() });
      }
      if (body.provider === "github") {
        return jsonResponse(res, 200, { provider: await checkGitHub() });
      }
      return jsonResponse(res, 400, { message: "Provider invalido." });
    }

    if (req.method === "POST" && url.pathname === "/api/sync/run") {
      const body = await readJsonBody(req);
      const mode = body.mode;
      const startedAt = new Date().toISOString();

      if (mode !== "drive_scan" && mode !== "drive_to_github_manifest") {
        return jsonResponse(res, 400, { message: "Modo de sincronizacao invalido." });
      }

      const manifest = await buildDriveManifest();
      let githubCommitSha;
      let message = `Drive escaneado: ${manifest.stats.files} arquivos em ${manifest.stats.folders} pastas.`;

      if (mode === "drive_to_github_manifest") {
        githubCommitSha = await writeManifestToGitHub(manifest);
        message = `Manifesto do Drive sincronizado no GitHub com ${manifest.stats.files} arquivos.`;
      }

      return jsonResponse(res, 200, {
        ok: true,
        mode,
        message,
        startedAt,
        finishedAt: new Date().toISOString(),
        manifestPath: mode === "drive_to_github_manifest" ? MANIFEST_PATH : undefined,
        githubCommitSha,
        stats: manifest.stats,
      });
    }

    return jsonResponse(res, 404, { message: "Endpoint nao encontrado." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return jsonResponse(res, statusCode, {
      ok: false,
      message: error.message || "Erro inesperado.",
    });
  }
}

function safeFilePath(root, requestPath) {
  const decoded = decodeURIComponent(requestPath);
  const normalized = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const filePath = resolve(join(root, normalized));
  const rootWithSep = root.endsWith(sep) ? root : `${root}${sep}`;

  if (filePath !== root && !filePath.startsWith(rootWithSep)) {
    return null;
  }

  return filePath;
}

function serveFile(req, res, filePath) {
  const stat = statSync(filePath);
  const ext = extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const range = req.headers.range;

  if (range) {
    const match = range.match(/^bytes=(\d*)-(\d*)$/);
    if (match) {
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : stat.size - 1;

      if (start <= end && end < stat.size) {
        res.writeHead(206, {
          "Content-Type": contentType,
          "Content-Length": end - start + 1,
          "Accept-Ranges": "bytes",
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        });
        createReadStream(filePath, { start, end }).pipe(res);
        return;
      }
    }
  }

  res.writeHead(200, {
    "Content-Type": contentType,
    "Content-Length": stat.size,
    "Accept-Ranges": "bytes",
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
  });
  createReadStream(filePath).pipe(res);
}

function serveStatic(req, res, url) {
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const root = existsSync(STATIC_ROOT) ? STATIC_ROOT : PUBLIC_ROOT;
  let filePath = safeFilePath(root, pathname);

  if (filePath && existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }

  if (filePath && existsSync(filePath) && statSync(filePath).isFile()) {
    return serveFile(req, res, filePath);
  }

  if (!pathname.startsWith(PUBLIC_BASE_PATH) && !pathname.includes(".")) {
    const indexPath = join(root, "index.html");
    if (existsSync(indexPath)) return serveFile(req, res, indexPath);
  }

  return textResponse(res, 404, "Not found");
}

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url);
    return;
  }

  serveStatic(req, res, url);
});

server.listen(PORT, () => {
  console.log(`FAESDE server listening on ${PORT}`);
  console.log(`Serving static files from ${existsSync(STATIC_ROOT) ? STATIC_ROOT : PUBLIC_ROOT}`);
});
