import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { createHash, createSign, randomBytes } from "node:crypto";

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
const GITHUB_SYNC_BATCH_SIZE = Number(process.env.EAD_GITHUB_SYNC_BATCH_SIZE || 150);
const MANIFEST_PATH = process.env.EAD_DRIVE_MANIFEST_PATH || "public/eadplataforma-drive-manifest.json";
const RUNTIME_CACHE_ROOT = resolve(process.env.EAD_RUNTIME_CACHE_ROOT || join(process.cwd(), ".ead-runtime-cache"));
const MAX_UPLOAD_MB = Number(process.env.EAD_UPLOAD_MAX_MB || 512);
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
const SITE_URL = (process.env.PUBLIC_SITE_URL || "https://faesde.com.br").replace(/\/$/, "");
const SEO_CACHE_MS = Number(process.env.SEO_CACHE_MS || 5 * 60 * 1000);
const SEO_IMAGE_URL = `${SITE_URL}/logo.png`;

const DEFAULT_SEO_KEYWORDS = [
  "FAESDE",
  "cursos técnicos EAD",
  "certificação por competência",
  "cursos pós-técnicos",
  "EJA ensino médio",
  "curso técnico online",
  "curso profissionalizante EAD",
  "técnico em segurança do trabalho",
  "técnico em administração",
  "técnico em eletrotécnica",
  "técnico em enfermagem",
  "técnico em logística",
  "técnico em mecânica",
  "técnico em radiologia",
  "técnico em farmácia",
  "NR 10",
  "NR 13",
];

const SEO_CATEGORY_META = {
  extensao: {
    label: "Cursos Técnicos EAD",
    description:
      "Cursos técnicos EAD FAESDE para formação profissional online, com início imediato e atendimento personalizado.",
  },
  competencia: {
    label: "Certificação por Competência",
    description:
      "Certificação técnica por competência FAESDE para quem já possui experiência profissional e busca validação da formação.",
  },
  "pos-tecnico": {
    label: "Cursos Pós-Técnicos",
    description:
      "Especializações técnicas e cursos pós-técnicos EAD para ampliar oportunidades profissionais.",
  },
  "segundo-grau": {
    label: "EJA e Ensino Médio",
    description:
      "Certificação de ensino médio EJA com suporte FAESDE para quem busca concluir os estudos.",
  },
};

const SEO_CATEGORY_ROUTES = {
  extensao: {
    path: "/cursos/tecnicos-ead",
    aliases: ["cursos-tecnicos", "curso-tecnico", "cursos-tecnicos-ead", "cursos-de-extensao-ead", "extensao"],
  },
  competencia: {
    path: "/cursos/certificacao-por-competencia",
    aliases: [
      "certificacao-por-competencia",
      "certificacao-tecnica-por-competencia",
      "cursos-de-certificacao-por-competencia-ead",
      "competencia",
    ],
  },
  "pos-tecnico": {
    path: "/cursos/pos-tecnicos",
    aliases: ["pos-tecnico", "pos-tecnicos", "cursos-pos-tecnicos", "especializacao-tecnica"],
  },
  "segundo-grau": {
    path: "/cursos/eja-ensino-medio",
    aliases: ["eja", "ensino-medio", "segundo-grau", "eja-ensino-medio"],
  },
};

const SEO_CATEGORY_ROUTE_TO_SLUG = new Map(
  Object.entries(SEO_CATEGORY_ROUTES).flatMap(([slug, route]) => [
    [slug, slug],
    [slugify(route.path.split("/").pop()), slug],
    ...route.aliases.map((alias) => [slugify(alias), slug]),
  ]),
);

const LEGACY_COMMERCE_PATHS = new Set([
  "/loja",
  "/shop",
  "/carrinho",
  "/cart",
  "/checkout",
  "/finalizar-compra",
  "/minha-conta",
  "/my-account",
]);

const LEGACY_CATEGORY_PREFIXES = new Set([
  "categoria-produto",
  "product-category",
  "categoria",
  "category",
]);

const LEGACY_CONTENT_PREFIXES = new Set([
  "produto",
  "blog",
  "noticia",
  "noticias",
  "artigo",
  "artigos",
  "post",
]);

const LEGACY_TAG_PREFIXES = new Set(["produto-tag", "tag"]);

const LEGACY_COURSE_ALIASES = {
  "tecnico-em-seguranca-do-trabalho": "seguranca-trabalho",
  "curso-tecnico-em-seguranca-do-trabalho": "seguranca-trabalho",
  "seguranca-do-trabalho": "seguranca-trabalho",
  sst: "seguranca-trabalho",
  "tecnico-em-administracao": "administracao",
  "curso-tecnico-em-administracao": "administracao",
  administracao: "administracao",
  "tecnico-em-eletrotecnica": "eletrotecnica",
  "curso-tecnico-em-eletrotecnica": "eletrotecnica",
  eletrotecnica: "eletrotecnica",
  "tecnico-em-eletromecanica": "eletromecanica",
  eletromecanica: "eletromecanica",
  "tecnico-em-eletroeletronica": "eletroeletronica",
  eletroeletronica: "eletroeletronica",
  "tecnico-em-enfermagem": "certificacao-tecnica-competencia-enfermagem",
  enfermagem: "certificacao-tecnica-competencia-enfermagem",
  "tecnico-em-farmacia": "farmacia",
  farmacia: "farmacia",
  "tecnico-em-radiologia": "certificacao-tecnica-competencia-radiologia",
  radiologia: "certificacao-tecnica-competencia-radiologia",
  "tecnico-em-logistica": "logistica",
  logistica: "logistica",
  "tecnico-em-mecanica": "mecanica",
  mecanica: "mecanica",
  "tecnico-em-mineracao": "mineracao",
  mineracao: "mineracao",
  "tecnico-em-contabilidade": "contabilidade",
  contabilidade: "contabilidade",
  "tecnico-em-marketing": "marketing",
  marketing: "marketing",
  "tecnico-em-recursos-humanos": "recursos-humanos",
  "recursos-humanos": "recursos-humanos",
  "tecnico-em-transacoes-imobiliarias": "tti",
  "transacoes-imobiliarias": "tti",
  tti: "tti",
  "tecnico-em-refrigeracao-e-climatizacao": "refrigeracao",
  "refrigeracao-e-climatizacao": "refrigeracao",
  refrigeracao: "refrigeracao",
  "tecnico-em-petroleo-e-gas": "petroleo-gas",
  "petroleo-e-gas": "petroleo-gas",
  "petroleo-gas": "petroleo-gas",
  "tecnico-em-desenvolvimento-de-sistemas": "certificacao-tecnica-competencia-desenvolvimento-sistemas",
  "desenvolvimento-de-sistemas": "certificacao-tecnica-competencia-desenvolvimento-sistemas",
  "desenvolvimento-sistemas": "certificacao-tecnica-competencia-desenvolvimento-sistemas",
};

const PROVIDERS = ["google_drive", "github"];
const DEFAULT_SCOPES = {
  google_drive: ["openid", "email", "profile", "https://www.googleapis.com/auth/drive"],
  github: ["repo"],
};

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

let googleServiceAccountTokenCache = null;
let publicCoursesCache = { fetchedAt: 0, courses: [] };

function securityHeaders(headers = {}, options = {}) {
  return {
    "X-Content-Type-Options": "nosniff",
    ...(options.allowFrame ? {} : { "X-Frame-Options": "SAMEORIGIN" }),
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    ...(options.noindex ? { "X-Robots-Tag": "noindex, nofollow" } : {}),
    ...headers,
  };
}

function jsonResponse(res, statusCode, payload) {
  res.writeHead(
    statusCode,
    securityHeaders({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    }),
  );
  res.end(JSON.stringify(payload, null, 2));
}

function textResponse(res, statusCode, message) {
  res.writeHead(
    statusCode,
    securityHeaders({
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    }),
  );
  res.end(message);
}

function redirectResponse(res, location, statusCode = 301) {
  res.writeHead(
    statusCode,
    securityHeaders({
      Location: location,
      "Cache-Control": "public, max-age=3600",
    }),
  );
  res.end();
}

function createHttpError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function base64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlBuffer(buffer) {
  return buffer
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sha256Base64Url(value) {
  return base64UrlBuffer(createHash("sha256").update(value).digest());
}

function randomToken(bytes = 32) {
  return base64UrlBuffer(randomBytes(bytes));
}

function isProvider(value) {
  return PROVIDERS.includes(value);
}

function normalizeScopes(provider, scopes) {
  if (Array.isArray(scopes)) {
    const cleaned = scopes.map((scope) => String(scope).trim()).filter(Boolean);
    return cleaned.length > 0 ? cleaned : DEFAULT_SCOPES[provider];
  }

  if (typeof scopes === "string") {
    const cleaned = scopes
      .split(/[\s,\n]+/)
      .map((scope) => scope.trim())
      .filter(Boolean);
    return cleaned.length > 0 ? cleaned : DEFAULT_SCOPES[provider];
  }

  return DEFAULT_SCOPES[provider];
}

function getRequestOrigin(req) {
  if (process.env.PUBLIC_SITE_URL) {
    return process.env.PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const protocol = forwardedProto || (String(req.headers.host || "").includes("localhost") ? "http" : "https");
  return `${protocol}://${req.headers.host || `localhost:${PORT}`}`;
}

function getOAuthRedirectUri(req, settings) {
  return settings?.redirect_uri || `${getRequestOrigin(req)}/admin/conexoes/oauth/callback`;
}

function providerState(provider, overrides = {}) {
  const defaults = {
    google_drive: {
      provider: "google_drive",
      label: "Google Drive",
      status: "not_configured",
      message:
        "Cadastre o OAuth do Google e clique em Conectar conta para autorizar a pasta EAD pelo painel.",
      externalId: DRIVE_FOLDER_ID,
      requiredSecrets: [],
      capabilities: { read: false, write: false, scan: false },
      source: "oauth",
    },
    github: {
      provider: "github",
      label: "GitHub",
      status: "not_configured",
      message:
        "Cadastre o OAuth do GitHub e clique em Conectar conta para permitir commits pelo painel.",
      externalId: `${GITHUB_REPO}@${GITHUB_BRANCH}`,
      requiredSecrets: [],
      capabilities: { read: false, write: false, scan: false },
      source: "oauth",
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
    syncBatchSize: GITHUB_SYNC_BATCH_SIZE,
  };
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !anonKey) {
    throw createHttpError("Variaveis do Supabase nao configuradas no servidor.", 500);
  }

  return {
    supabaseUrl: supabaseUrl.replace(/\/$/, ""),
    anonKey,
  };
}

async function supabaseRest(accessToken, path, options = {}) {
  const { supabaseUrl, anonKey } = getSupabaseConfig();
  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers,
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Supabase HTTP ${response.status}`;
    throw createHttpError(message, response.status);
  }

  return payload;
}

function encodeFilterValue(value) {
  return encodeURIComponent(String(value));
}

async function requireAdmin(req) {
  if (process.env.SYNC_DISABLE_AUTH === "true") {
    return { id: "local-dev", email: "local-dev@faesde", accessToken: "local-dev" };
  }

  const accessToken = getBearer(req);
  if (!accessToken) {
    throw createHttpError("Login admin necessario.", 401);
  }

  const { supabaseUrl, anonKey } = getSupabaseConfig();

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const user = await userResponse.json();

  if (!userResponse.ok || !user?.id) {
    throw createHttpError("Sessao admin invalida.", 401);
  }

  const roleUrl = `${supabaseUrl}/rest/v1/user_roles?select=role&user_id=eq.${encodeFilterValue(
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
    throw createHttpError("Usuario sem permissao de admin.", 403);
  }

  return { id: user.id, email: user.email, accessToken };
}

function getBearer(req) {
  const auth = req.headers.authorization || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024 * 1024) throw createHttpError("Payload muito grande.", 413);
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function readRequestBuffer(req, maxBytes = MAX_UPLOAD_BYTES) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw createHttpError(`Upload maior que ${MAX_UPLOAD_MB} MB.`, 413);
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

function parseContentDisposition(value = "") {
  const result = {};
  for (const part of value.split(";")) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey || rawValue.length === 0) continue;
    result[rawKey.toLowerCase()] = rawValue.join("=").trim().replace(/^"|"$/g, "");
  }
  return result;
}

async function readMultipartBody(req) {
  const contentType = String(req.headers["content-type"] || "");
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundaryMatch) throw createHttpError("Formulario de upload invalido.", 400);

  const boundary = boundaryMatch[1] || boundaryMatch[2];
  const raw = (await readRequestBuffer(req)).toString("latin1");
  const parts = raw.split(`--${boundary}`).slice(1, -1);
  const fields = {};
  const files = {};

  for (const rawPart of parts) {
    const part = rawPart.replace(/^\r\n/, "").replace(/\r\n$/, "");
    const separatorIndex = part.indexOf("\r\n\r\n");
    if (separatorIndex === -1) continue;

    const rawHeaders = part.slice(0, separatorIndex);
    const rawContent = part.slice(separatorIndex + 4);
    const headers = Object.fromEntries(
      rawHeaders.split("\r\n").map((line) => {
        const index = line.indexOf(":");
        return [line.slice(0, index).trim().toLowerCase(), line.slice(index + 1).trim()];
      }),
    );
    const disposition = parseContentDisposition(headers["content-disposition"]);
    const name = disposition.name;
    if (!name) continue;

    const content = Buffer.from(rawContent, "latin1");
    if (disposition.filename) {
      files[name] = {
        filename: disposition.filename,
        contentType: headers["content-type"] || "application/octet-stream",
        buffer: content,
      };
    } else {
      fields[name] = content.toString("utf8");
    }
  }

  return { fields, files };
}

function normalizeRelativePath(pathname = "") {
  const normalized = String(pathname || "")
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");

  if (normalized.split("/").some((part) => part === "." || part === "..")) {
    throw createHttpError("Caminho invalido.", 400);
  }

  return normalized;
}

function joinRelativePath(parentPath, name) {
  const parent = normalizeRelativePath(parentPath);
  const cleanName = sanitizeDriveName(name);
  return parent ? `${parent}/${cleanName}` : cleanName;
}

function pathName(pathname) {
  const normalized = normalizeRelativePath(pathname);
  return normalized.split("/").pop() || "";
}

function parentPath(pathname) {
  const normalized = normalizeRelativePath(pathname);
  const parts = normalized.split("/").filter(Boolean);
  parts.pop();
  return parts.join("/");
}

function isSameOrChildPath(pathname, basePath) {
  const cleanPath = normalizeRelativePath(pathname);
  const cleanBase = normalizeRelativePath(basePath);
  return cleanPath === cleanBase || cleanPath.startsWith(`${cleanBase}/`);
}

function sanitizeDriveName(name) {
  const cleanName = String(name || "").trim().replace(/[\\/]/g, "-");
  if (!cleanName || cleanName === "." || cleanName === "..") {
    throw createHttpError("Nome invalido.", 400);
  }
  return cleanName;
}

function escapeDriveQuery(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function getOAuthSettings(accessToken, provider) {
  const rows = await supabaseRest(
    accessToken,
    `sync_oauth_app_settings?select=*&provider=eq.${encodeFilterValue(provider)}&limit=1`,
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function listOAuthSettings(accessToken) {
  const rows = await supabaseRest(accessToken, "sync_oauth_app_settings?select=*&order=provider.asc");
  return Array.isArray(rows) ? rows : [];
}

async function getOAuthConnection(accessToken, provider) {
  const rows = await supabaseRest(
    accessToken,
    `sync_oauth_connections?select=*&provider=eq.${encodeFilterValue(provider)}&limit=1`,
  );
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function listOAuthConnections(accessToken) {
  const rows = await supabaseRest(accessToken, "sync_oauth_connections?select=*&order=provider.asc");
  return Array.isArray(rows) ? rows : [];
}

function redactOAuthSettings(row) {
  return {
    configured: Boolean(row?.client_id && row?.client_secret),
    clientId: row?.client_id || "",
    hasClientSecret: Boolean(row?.client_secret),
    scopes: row?.scopes || [],
    redirectUri: row?.redirect_uri || "",
    updatedAt: row?.updated_at || null,
  };
}

function redactOAuthConnection(row) {
  return {
    connected: Boolean(row?.access_token),
    accountId: row?.account_id || "",
    accountLabel: row?.account_label || "",
    status: row?.status || "not_connected",
    scope: row?.scope || "",
    expiresAt: row?.expires_at || null,
    connectedAt: row?.connected_at || null,
    lastCheckedAt: row?.last_checked_at || null,
    lastSyncAt: row?.last_sync_at || null,
    metadata: row?.metadata || {},
  };
}

async function upsertOAuthSettings(context, provider, payload) {
  const existing = await getOAuthSettings(context.accessToken, provider);
  const clientId = String(payload.clientId || payload.client_id || existing?.client_id || "").trim();
  const clientSecretInput = String(payload.clientSecret || payload.client_secret || "").trim();
  const clientSecret = clientSecretInput || existing?.client_secret || "";
  const scopes = normalizeScopes(provider, payload.scopes || existing?.scopes);
  const redirectUri = String(payload.redirectUri || payload.redirect_uri || existing?.redirect_uri || "").trim() || null;

  if (!clientId) throw createHttpError("Informe o Client ID.", 400);
  if (!clientSecret) throw createHttpError("Informe o Client Secret.", 400);

  const body = {
    provider,
    client_id: clientId,
    client_secret: clientSecret,
    scopes,
    redirect_uri: redirectUri,
    updated_by: context.id,
  };

  const rows = await supabaseRest(
    context.accessToken,
    "sync_oauth_app_settings?on_conflict=provider",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(body),
    },
  );

  return Array.isArray(rows) ? rows[0] : body;
}

async function createOAuthState(context, provider, req, returnTo = "/admin/conexoes") {
  const stateToken = randomToken(32);
  const codeVerifier = provider === "google_drive" ? randomToken(48) : null;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await supabaseRest(context.accessToken, "sync_oauth_states", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      state_token: stateToken,
      provider,
      user_id: context.id,
      code_verifier: codeVerifier,
      return_to: returnTo || "/admin/conexoes",
      expires_at: expiresAt,
    }),
  });

  return {
    stateToken,
    codeVerifier,
    redirectUri: getOAuthRedirectUri(req, await getOAuthSettings(context.accessToken, provider)),
  };
}

async function getOAuthState(context, stateToken) {
  const rows = await supabaseRest(
    context.accessToken,
    `sync_oauth_states?select=*&state_token=eq.${encodeFilterValue(stateToken)}&limit=1`,
  );
  const state = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

  if (!state) throw createHttpError("Estado OAuth invalido ou expirado.", 400);
  if (state.user_id !== context.id) throw createHttpError("Estado OAuth pertence a outro usuario.", 403);
  if (state.consumed_at) throw createHttpError("Este login OAuth ja foi usado. Tente conectar novamente.", 400);
  if (new Date(state.expires_at).getTime() < Date.now()) {
    throw createHttpError("Login OAuth expirado. Clique em conectar novamente.", 400);
  }

  return state;
}

async function consumeOAuthState(context, stateToken) {
  await supabaseRest(
    context.accessToken,
    `sync_oauth_states?state_token=eq.${encodeFilterValue(stateToken)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ consumed_at: new Date().toISOString() }),
    },
  );
}

function buildGoogleAuthorizationUrl(settings, state, redirectUri) {
  const scopes = normalizeScopes("google_drive", settings.scopes);
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", settings.client_id);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scopes.join(" "));
  url.searchParams.set("state", state.stateToken);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("code_challenge", sha256Base64Url(state.codeVerifier));
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

function buildGitHubAuthorizationUrl(settings, state, redirectUri) {
  const scopes = normalizeScopes("github", settings.scopes);
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", settings.client_id);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scopes.join(" "));
  url.searchParams.set("state", state.stateToken);
  return url.toString();
}

async function exchangeGoogleCode(settings, state, code, redirectUri) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: settings.client_id,
      client_secret: settings.client_secret,
      code,
      code_verifier: state.code_verifier,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw createHttpError(payload.error_description || payload.error || "Falha ao autorizar Google.", 400);
  }

  return payload;
}

async function exchangeGitHubCode(settings, code, redirectUri) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "faesde-sync",
    },
    body: JSON.stringify({
      client_id: settings.client_id,
      client_secret: settings.client_secret,
      code,
      redirect_uri: redirectUri,
    }),
  });
  const payload = await response.json();

  if (!response.ok || payload.error) {
    throw createHttpError(payload.error_description || payload.error || "Falha ao autorizar GitHub.", 400);
  }

  return payload;
}

async function fetchGoogleProfile(accessToken) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = await response.json();

  if (!response.ok) return {};
  return payload;
}

async function fetchGitHubProfile(accessToken) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "faesde-sync",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const payload = await response.json();

  if (!response.ok) return {};
  return payload;
}

async function saveOAuthConnection(context, provider, tokenPayload, profile) {
  const existing = await getOAuthConnection(context.accessToken, provider);
  const expiresIn = Number(tokenPayload.expires_in || 0);
  const expiresAt = expiresIn > 0 ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;
  const accessToken = tokenPayload.access_token || existing?.access_token;
  const refreshToken = tokenPayload.refresh_token || existing?.refresh_token || null;

  if (!accessToken) throw createHttpError("O provedor nao retornou access token.", 400);

  const accountId =
    provider === "google_drive" ? profile.sub || profile.id || profile.email : String(profile.id || profile.login || "");
  const accountLabel =
    provider === "google_drive"
      ? profile.email || profile.name || "Conta Google conectada"
      : profile.login || profile.name || "Conta GitHub conectada";

  const body = {
    provider,
    account_id: accountId,
    account_label: accountLabel,
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: tokenPayload.token_type || existing?.token_type || "Bearer",
    scope: tokenPayload.scope || existing?.scope || "",
    expires_at: expiresAt || existing?.expires_at || null,
    status: "connected",
    metadata: {
      profile,
      tokenSource: provider === "google_drive" ? "google_oauth" : "github_oauth",
    },
    connected_by: context.id,
    connected_at: existing?.connected_at || new Date().toISOString(),
    last_checked_at: new Date().toISOString(),
  };

  const rows = await supabaseRest(
    context.accessToken,
    "sync_oauth_connections?on_conflict=provider",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(body),
    },
  );

  return Array.isArray(rows) ? rows[0] : body;
}

async function refreshGoogleOAuthToken(context, connection) {
  if (!connection?.refresh_token) {
    throw createHttpError("Reconecte o Google Drive para gerar um refresh token.", 401);
  }

  const settings = await getOAuthSettings(context.accessToken, "google_drive");
  if (!settings?.client_id || !settings?.client_secret) {
    throw createHttpError("Cadastre o OAuth do Google antes de renovar a conexao.", 400);
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: settings.client_id,
      client_secret: settings.client_secret,
      refresh_token: connection.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw createHttpError(payload.error_description || payload.error || "Falha ao renovar token Google.", 401);
  }

  const expiresIn = Number(payload.expires_in || 3600);
  const updated = {
    access_token: payload.access_token,
    token_type: payload.token_type || connection.token_type || "Bearer",
    scope: payload.scope || connection.scope || "",
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    status: "connected",
    last_checked_at: new Date().toISOString(),
  };

  await supabaseRest(
    context.accessToken,
    `sync_oauth_connections?provider=eq.google_drive`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(updated),
    },
  );

  return { ...connection, ...updated };
}

async function getGoogleOAuthAccessToken(context) {
  if (!context?.accessToken || context.accessToken === "local-dev") return null;

  const connection = await getOAuthConnection(context.accessToken, "google_drive").catch(() => null);
  if (!connection?.access_token || connection.status !== "connected") return null;

  const expiresAt = connection.expires_at ? new Date(connection.expires_at).getTime() : 0;
  if (!expiresAt || expiresAt > Date.now() + 60000) {
    return connection.access_token;
  }

  const refreshed = await refreshGoogleOAuthToken(context, connection);
  return refreshed.access_token;
}

async function getGitHubOAuthAccessToken(context) {
  if (!context?.accessToken || context.accessToken === "local-dev") return null;

  const connection = await getOAuthConnection(context.accessToken, "github").catch(() => null);
  if (!connection?.access_token || connection.status !== "connected") return null;
  return connection.access_token;
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

async function getGoogleServiceAccountAccessToken() {
  if (
    googleServiceAccountTokenCache &&
    googleServiceAccountTokenCache.expiresAt > Date.now() + 60000
  ) {
    return googleServiceAccountTokenCache.accessToken;
  }

  const credentials = getGoogleCredentials();
  if (!credentials) {
    throw createHttpError("GOOGLE_SERVICE_ACCOUNT_JSON nao configurado ou invalido.", 400);
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
    throw createHttpError(
      payload.error_description || payload.error || "Falha ao autenticar no Google Drive.",
      400,
    );
  }

  googleServiceAccountTokenCache = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + Number(payload.expires_in || 3600) * 1000,
  };

  return googleServiceAccountTokenCache.accessToken;
}

async function getGoogleAccessToken(context) {
  const oauthToken = await getGoogleOAuthAccessToken(context);
  if (oauthToken) return { token: oauthToken, source: "oauth" };

  const serviceToken = await getGoogleServiceAccountAccessToken();
  return { token: serviceToken, source: "service_account" };
}

async function driveRequest(pathname, params = {}, context) {
  const auth = await getGoogleAccessToken(context);
  const url = new URL(`https://www.googleapis.com/drive/v3/${pathname}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  });

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  const payload = await response.json();

  if (!response.ok) {
    throw createHttpError(payload.error?.message || "Falha ao consultar Google Drive.", response.status);
  }

  return { payload, source: auth.source };
}

async function driveDownloadFile(fileId, context) {
  const auth = await getGoogleAccessToken(context);
  const url = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`);
  url.searchParams.set("alt", "media");
  url.searchParams.set("supportsAllDrives", "true");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${auth.token}` },
  });

  if (!response.ok) {
    let message = "Falha ao baixar arquivo do Google Drive.";
    try {
      const payload = await response.json();
      message = payload.error?.message || message;
    } catch {
      // The Drive media endpoint may return plain text/HTML on some failures.
    }
    throw createHttpError(message, response.status);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function driveJsonRequest(pathname, options = {}, context) {
  const auth = await getGoogleAccessToken(context);
  const url = new URL(`https://www.googleapis.com/drive/v3/${pathname}`);
  Object.entries(options.params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  });

  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json; charset=utf-8",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw createHttpError(payload.error?.message || "Falha ao alterar Google Drive.", response.status);
  }

  return { payload, source: auth.source };
}

async function driveUploadResumable({ folderId, name, mimeType, buffer }, context) {
  const auth = await getGoogleAccessToken(context);
  const startUrl = new URL("https://www.googleapis.com/upload/drive/v3/files");
  startUrl.searchParams.set("uploadType", "resumable");
  startUrl.searchParams.set("supportsAllDrives", "true");
  startUrl.searchParams.set("fields", "id,name,mimeType,size,modifiedTime,md5Checksum,webViewLink,webContentLink");

  const startResponse = await fetch(startUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json; charset=utf-8",
      "X-Upload-Content-Type": mimeType || "application/octet-stream",
      "X-Upload-Content-Length": String(buffer.length),
    },
    body: JSON.stringify({
      name,
      parents: [folderId],
      mimeType: mimeType || "application/octet-stream",
    }),
  });

  if (!startResponse.ok) {
    const payload = await startResponse.json().catch(() => ({}));
    throw createHttpError(payload.error?.message || "Falha ao iniciar upload no Google Drive.", startResponse.status);
  }

  const uploadUrl = startResponse.headers.get("location");
  if (!uploadUrl) throw createHttpError("Google Drive nao retornou URL de upload.", 500);

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType || "application/octet-stream",
      "Content-Length": String(buffer.length),
    },
    body: buffer,
  });
  const text = await uploadResponse.text();
  const payload = text ? JSON.parse(text) : {};

  if (!uploadResponse.ok) {
    throw createHttpError(payload.error?.message || "Falha ao enviar arquivo para o Google Drive.", uploadResponse.status);
  }

  return payload;
}

async function publicSupabaseRest(path, options = {}) {
  const { supabaseUrl, anonKey } = getSupabaseConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Supabase HTTP ${response.status}`;
    throw createHttpError(message, response.status);
  }

  return payload;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(value) {
  return escapeHtml(value);
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return normalizeText(value).replace(/\s+/g, "-");
}

function canonicalPath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function absoluteUrl(pathname = "/", search = "") {
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${canonicalPath(cleanPath)}${search || ""}`;
}

function categoryPathFromSlug(slug) {
  return SEO_CATEGORY_ROUTES[slug]?.path || `/cursos/${slugify(slug)}`;
}

function categorySlugFromRoute(value) {
  const clean = slugify(value);
  return SEO_CATEGORY_ROUTE_TO_SLUG.get(clean) || clean;
}

function categoryForUrl(url, path, parts) {
  if (path === "/cursos") return url.searchParams.get("categoria") || "";
  if (parts[0] === "cursos" && parts[1]) return categorySlugFromRoute(parts[1]);
  return "";
}

function truncateDescription(value, fallback) {
  const normalized = String(value || fallback || "")
    .replace(/\s+/g, " ")
    .trim();
  if (normalized.length <= 156) return normalized;
  return `${normalized.slice(0, 153).replace(/\s+\S*$/, "")}...`;
}

function parsePrice(value) {
  const clean = String(value || "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".")
    .trim();
  const numeric = Number(clean);
  return Number.isFinite(numeric) && numeric > 0 ? numeric.toFixed(2) : undefined;
}

function courseImageUrl(course) {
  const image = course?.banner_image_url || course?.image_url || SEO_IMAGE_URL;
  if (!image) return SEO_IMAGE_URL;
  if (/^https?:\/\//i.test(image)) return image;
  return absoluteUrl(image.startsWith("/") ? image : `/${image}`);
}

function courseAreaName(course) {
  return String(course?.title || "")
    .replace(/Certifica(?:ç|c)ão Técnica por Competência em\s+/i, "")
    .replace(/Curso Técnico (?:de|em)\s+/i, "")
    .replace(/Especialização Técnica em\s+/i, "")
    .replace(/\s+EAD$/i, "")
    .trim();
}

function uniqueList(values) {
  return Array.from(
    new Set(
      values
        .map((value) => String(value || "").replace(/\s+/g, " ").trim())
        .filter(Boolean),
    ),
  );
}

const COURSE_INTENT_KEYWORDS = [
  {
    match: ["seguranca-trabalho", "seguranca do trabalho", "sst"],
    keywords: [
      "concurso público técnico em segurança do trabalho",
      "edital técnico em segurança do trabalho",
      "EBSERH técnico em segurança do trabalho",
      "Petrobras técnico em segurança do trabalho",
      "prefeitura técnico em segurança do trabalho",
      "NR 10",
      "NR 12",
      "NR 13",
      "NR 35",
    ],
  },
  {
    match: ["enfermagem"],
    keywords: [
      "concurso público técnico em enfermagem",
      "EBSERH técnico em enfermagem",
      "hospital universitário técnico em enfermagem",
      "prefeitura técnico em enfermagem",
      "secretaria de saúde técnico em enfermagem",
      "SAMU técnico em enfermagem",
    ],
  },
  {
    match: ["radiologia"],
    keywords: [
      "concurso público técnico em radiologia",
      "EBSERH técnico em radiologia",
      "hospital universitário técnico em radiologia",
      "prefeitura técnico em radiologia",
      "clínica de imagem técnico em radiologia",
    ],
  },
  {
    match: ["farmacia"],
    keywords: [
      "concurso público técnico em farmácia",
      "EBSERH técnico em farmácia",
      "hospital técnico em farmácia",
      "prefeitura técnico em farmácia",
      "assistência farmacêutica concurso",
    ],
  },
  {
    match: ["administracao", "administracao empresarial"],
    keywords: [
      "concurso público técnico em administração",
      "assistente em administração concurso",
      "técnico administrativo concurso",
      "instituto federal assistente em administração",
      "universidade federal assistente em administração",
      "prefeitura técnico administrativo",
    ],
  },
  {
    match: ["eletrotecnica", "eletroeletronica", "eletromecanica", "eletronica"],
    keywords: [
      "concurso público técnico em eletrotécnica",
      "concurso técnico em elétrica",
      "Petrobras técnico em eletrotécnica",
      "companhia de energia técnico em eletrotécnica",
      "saneamento técnico em eletrotécnica",
      "CREA técnico em eletrotécnica",
    ],
  },
  {
    match: ["mecanica", "mecanica industrial", "manutencao maquinas"],
    keywords: [
      "concurso público técnico em mecânica",
      "Petrobras técnico em mecânica",
      "Transpetro técnico em mecânica",
      "manutenção industrial concurso",
      "técnico em manutenção mecânica",
    ],
  },
  {
    match: ["quimica", "analises quimicas", "analises clinicas", "biotecnologia"],
    keywords: [
      "concurso público técnico em química",
      "Petrobras técnico em química",
      "saneamento técnico em química",
      "técnico de laboratório concurso",
      "universidade federal técnico de laboratório",
    ],
  },
  {
    match: ["informatica", "desenvolvimento sistemas", "redes computadores", "programacao jogos"],
    keywords: [
      "concurso público técnico em informática",
      "técnico de tecnologia da informação concurso",
      "técnico em TI concurso",
      "instituto federal técnico em informática",
      "universidade federal técnico em informática",
    ],
  },
  {
    match: ["edificacoes", "construcao civil", "agrimensura"],
    keywords: [
      "concurso público técnico em edificações",
      "prefeitura técnico em edificações",
      "fiscalização de obras concurso",
      "CREA técnico em edificações",
      "obras públicas técnico em edificações",
    ],
  },
  {
    match: ["meio ambiente", "saneamento", "florestas", "mineracao"],
    keywords: [
      "concurso público técnico em meio ambiente",
      "prefeitura técnico em meio ambiente",
      "saneamento ambiental concurso",
      "IBAMA técnico ambiental",
      "secretaria de meio ambiente concurso",
    ],
  },
  {
    match: ["logistica", "transito", "servicos publicos"],
    keywords: [
      "concurso público técnico em logística",
      "assistente de logística concurso",
      "almoxarifado concurso público",
      "prefeitura logística concurso",
    ],
  },
  {
    match: ["transacoes imobiliarias", "tti"],
    keywords: [
      "curso TTI EAD",
      "técnico em transações imobiliárias",
      "CRECI técnico em transações imobiliárias",
      "corretor de imóveis curso técnico",
    ],
  },
];

function courseSpecificKeywords(course) {
  const area = courseAreaName(course);
  const areaSlug = slugify(area);
  const haystack = `${slugify(course?.slug || "")} ${areaSlug} ${normalizeText(course?.title || "")}`;
  const generic = [
    course?.title,
    area ? `curso técnico em ${area}` : "",
    area ? `curso técnico ${area} EAD` : "",
    area ? `curso técnico ${area} online` : "",
    area ? `certificado técnico em ${area}` : "",
    area ? `certificação por competência em ${area}` : "",
    area ? `concurso público técnico em ${area}` : "",
    area ? `edital técnico em ${area}` : "",
    area ? `cargo técnico em ${area}` : "",
    area ? `processo seletivo técnico em ${area}` : "",
    area ? `registro profissional técnico em ${area}` : "",
    "curso técnico reconhecido",
    "curso profissionalizante EAD",
    "formação técnica para concurso público",
  ];

  const matched = COURSE_INTENT_KEYWORDS.flatMap((rule) =>
    rule.match.some((term) => haystack.includes(slugify(term).replace(/-/g, " "))) ? rule.keywords : [],
  );

  return uniqueList([...generic, ...matched, ...DEFAULT_SEO_KEYWORDS]);
}

async function getPublicCourses() {
  if (Date.now() - publicCoursesCache.fetchedAt < SEO_CACHE_MS) {
    return publicCoursesCache.courses;
  }

  try {
    const courses = await publicSupabaseRest(
      [
        "courses?select=slug,title,subtitle,description,category,hours,duration_range,certification,image_url,banner_image_url,original_price,promo_price,updated_at",
        "is_active=eq.true",
        "order=title.asc",
      ].join("&"),
    );
    publicCoursesCache = {
      fetchedAt: Date.now(),
      courses: Array.isArray(courses) ? courses : [],
    };
  } catch (error) {
    console.warn(`[seo] Failed to load public courses: ${error.message}`);
    publicCoursesCache = {
      fetchedAt: Date.now(),
      courses: publicCoursesCache.courses || [],
    };
  }

  return publicCoursesCache.courses;
}

function findCourseBySlug(courses, slug) {
  const cleanSlug = slugify(slug);
  return courses.find((course) => slugify(course.slug) === cleanSlug) || null;
}

function legacyCandidateFromParts(parts) {
  return parts
    .filter(Boolean)
    .filter((part) => !LEGACY_CONTENT_PREFIXES.has(part))
    .filter((part) => !LEGACY_CATEGORY_PREFIXES.has(part))
    .filter((part) => !LEGACY_TAG_PREFIXES.has(part))
    .join("-");
}

function stopwordToken(token) {
  return [
    "a",
    "o",
    "as",
    "os",
    "de",
    "da",
    "do",
    "das",
    "dos",
    "em",
    "no",
    "na",
    "com",
    "para",
    "por",
    "curso",
    "cursos",
    "tecnico",
    "tecnicos",
    "tecnica",
    "ead",
    "online",
    "comprar",
    "certificacao",
    "certificado",
    "competencia",
    "profissional",
  ].includes(token);
}

function matchCourseFromLegacyCandidate(courses, candidate) {
  const cleanCandidate = slugify(candidate);
  if (!cleanCandidate) return null;

  const aliasTarget = LEGACY_COURSE_ALIASES[cleanCandidate];
  if (aliasTarget) {
    const aliasCourse = findCourseBySlug(courses, aliasTarget);
    if (aliasCourse) return aliasCourse;
  }

  const exact = findCourseBySlug(courses, cleanCandidate);
  if (exact) return exact;

  const candidateTokens = normalizeText(cleanCandidate)
    .split(" ")
    .filter((token) => token.length > 2 && !stopwordToken(token));

  if (candidateTokens.length === 0) return null;

  let best = { course: null, score: 0 };
  for (const course of courses) {
    const courseSlug = slugify(course.slug);
    const courseTitle = normalizeText(course.title);
    const courseHaystack = `${courseSlug.replace(/-/g, " ")} ${courseTitle}`;
    let score = 0;

    if (courseSlug.includes(cleanCandidate) || cleanCandidate.includes(courseSlug)) score += 10;
    for (const token of candidateTokens) {
      if (courseSlug.split("-").includes(token)) score += 3;
      if (courseTitle.split(" ").includes(token)) score += 2;
      if (courseHaystack.includes(token)) score += 1;
    }

    if (score > best.score) best = { course, score };
  }

  return best.score >= 6 ? best.course : null;
}

function categoryRedirectFromSlug(slug) {
  const clean = slugify(slug);
  const categoryAliases = {
    "cursos-tecnicos": categoryPathFromSlug("extensao"),
    "curso-tecnico": categoryPathFromSlug("extensao"),
    "cursos-tecnicos-ead": categoryPathFromSlug("extensao"),
    "cursos-de-extensao-ead": categoryPathFromSlug("extensao"),
    "extensao": categoryPathFromSlug("extensao"),
    "certificacao-por-competencia": categoryPathFromSlug("competencia"),
    "certificacao-tecnica-por-competencia": categoryPathFromSlug("competencia"),
    "cursos-de-certificacao-por-competencia-ead": categoryPathFromSlug("competencia"),
    "competencia": categoryPathFromSlug("competencia"),
    "pos-tecnico": categoryPathFromSlug("pos-tecnico"),
    "pos-tecnicos": categoryPathFromSlug("pos-tecnico"),
    "cursos-pos-tecnicos": categoryPathFromSlug("pos-tecnico"),
    "especializacao-tecnica": categoryPathFromSlug("pos-tecnico"),
    "eja": categoryPathFromSlug("segundo-grau"),
    "ensino-medio": categoryPathFromSlug("segundo-grau"),
    "segundo-grau": categoryPathFromSlug("segundo-grau"),
    "eja-ensino-medio": categoryPathFromSlug("segundo-grau"),
  };
  return categoryAliases[clean] || null;
}

async function getLegacyRedirect(url) {
  const path = canonicalPath(url.pathname);
  if (path === "/index.html") return { destination: "/", reason: "canonical-home" };

  if (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/certificados" ||
    path.startsWith("/certificados/") ||
    path === PUBLIC_BASE_PATH ||
    path.startsWith(`${PUBLIC_BASE_PATH}/`)
  ) {
    return null;
  }

  if (LEGACY_COMMERCE_PATHS.has(path)) return { destination: "/cursos", reason: "legacy-commerce" };

  if (path === "/cursos" && url.searchParams.has("categoria")) {
    const category = categorySlugFromRoute(url.searchParams.get("categoria") || "");
    if (SEO_CATEGORY_META[category]) {
      const params = new URLSearchParams(url.searchParams);
      params.delete("categoria");
      const query = params.toString();
      return {
        destination: `${categoryPathFromSlug(category)}${query ? `?${query}` : ""}`,
        reason: "canonical-category",
      };
    }
  }

  const parts = path.split("/").filter(Boolean).map(slugify);
  const [prefix] = parts;
  if (!prefix) return null;

  if (prefix === "cursos" && parts[1]) {
    const category = categorySlugFromRoute(parts[1]);
    const canonicalCategoryPath = categoryPathFromSlug(category);
    if (SEO_CATEGORY_META[category] && path !== canonicalCategoryPath) {
      return { destination: canonicalCategoryPath, reason: "canonical-category-path" };
    }
  }

  if (LEGACY_TAG_PREFIXES.has(prefix)) {
    const courses = await getPublicCourses();
    const candidate = legacyCandidateFromParts(parts.slice(1));
    const course = matchCourseFromLegacyCandidate(courses, candidate);
    return {
      destination: course ? `/curso/${course.slug}` : "/cursos",
      reason: course ? "legacy-tag-course" : "legacy-tag",
    };
  }

  if (LEGACY_CATEGORY_PREFIXES.has(prefix)) {
    const candidate = legacyCandidateFromParts(parts.slice(1));
    const categoryDestination = categoryRedirectFromSlug(candidate);
    if (categoryDestination) {
      return { destination: categoryDestination, reason: "legacy-category" };
    }

    const courses = await getPublicCourses();
    const course = matchCourseFromLegacyCandidate(courses, candidate);
    return {
      destination: course ? `/curso/${course.slug}` : "/cursos",
      reason: course ? "legacy-category-course" : "legacy-category-fallback",
    };
  }

  if (LEGACY_CONTENT_PREFIXES.has(prefix)) {
    const courses = await getPublicCourses();
    const candidate = legacyCandidateFromParts(parts.slice(1));
    const course = matchCourseFromLegacyCandidate(courses, candidate);
    return {
      destination: course ? `/curso/${course.slug}` : "/cursos",
      reason: course ? "legacy-content-course" : "legacy-content-fallback",
    };
  }

  const directCategoryDestination = parts.length === 1 ? categoryRedirectFromSlug(parts[0]) : null;
  if (directCategoryDestination) {
    return { destination: directCategoryDestination, reason: "direct-category-alias" };
  }

  if (prefix === "curso" || parts.length === 1) {
    const courses = await getPublicCourses();
    const candidate = prefix === "curso" ? parts.slice(1).join("-") : parts.join("-");
    const course = matchCourseFromLegacyCandidate(courses, candidate);
    if (course && path !== `/curso/${course.slug}`) {
      return { destination: `/curso/${course.slug}`, reason: "direct-course-alias" };
    }
  }

  return null;
}

function buildJsonLd(items) {
  const graphs = items.filter(Boolean);
  if (graphs.length === 0) return "";
  return JSON.stringify(graphs.length === 1 ? graphs[0] : { "@context": "https://schema.org", "@graph": graphs });
}

function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "FAESDE",
    url: SITE_URL,
    logo: SEO_IMAGE_URL,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rua dos Ipês, 212, Coqueiral",
      addressLocality: "Aracruz",
      addressRegion: "ES",
      addressCountry: "BR",
    },
    telephone: "+55 27 2237-8054",
    email: "contato@faesde.com",
  };
}

function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FAESDE",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/cursos?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function courseSchema(course) {
  const keywords = courseSpecificKeywords(course);
  const categoryMeta = SEO_CATEGORY_META[course.category];
  const price = parsePrice(course.promo_price || course.original_price);
  const offer = {
    "@type": "Offer",
    url: absoluteUrl(`/curso/${course.slug}`),
    availability: "https://schema.org/InStock",
    category: categoryMeta?.label || "Curso FAESDE",
    ...(price ? { price, priceCurrency: "BRL" } : {}),
  };

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: truncateDescription(
      course.description || course.subtitle,
      `Curso ${course.title} na FAESDE com metodologia EAD e suporte ao aluno.`,
    ),
    provider: {
      "@type": "EducationalOrganization",
      name: "FAESDE",
      sameAs: SITE_URL,
    },
    url: absoluteUrl(`/curso/${course.slug}`),
    image: courseImageUrl(course),
    dateModified: course.updated_at ? String(course.updated_at).slice(0, 10) : undefined,
    keywords,
    teaches: keywords.slice(0, 12),
    inLanguage: "pt-BR",
    isAccessibleForFree: false,
    courseMode: "online",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: course.hours ? `PT${course.hours}H` : undefined,
    },
    offers: offer,
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      audienceType: "Estudantes, profissionais e candidatos a concursos públicos que exigem formação técnica.",
    },
    occupationalCategory: courseAreaName(course),
    educationalCredentialAwarded: course.certification || "Certificado FAESDE",
    timeRequired: course.hours ? `PT${course.hours}H` : undefined,
  };
}

function courseListSchema(courses, { name, description, path, category } = {}) {
  const filteredCourses = category ? courses.filter((course) => course.category === category) : courses;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: name || "Cursos FAESDE",
    description:
      description || "Lista de cursos técnicos EAD, certificações por competência, pós-técnicos e EJA da FAESDE.",
    url: absoluteUrl(path || "/cursos"),
    numberOfItems: filteredCourses.length,
    itemListElement: filteredCourses.slice(0, 120).map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/curso/${course.slug}`),
      item: {
        "@type": "Course",
        name: course.title,
        description: truncateDescription(
          course.description || course.subtitle,
          `${course.title}: curso FAESDE com atendimento ao aluno e certificado.`,
        ),
        url: absoluteUrl(`/curso/${course.slug}`),
        image: courseImageUrl(course),
        provider: {
          "@type": "EducationalOrganization",
          name: "FAESDE",
          sameAs: SITE_URL,
        },
      },
    })),
  };
}

function faqPageSchema() {
  const questions = [
    {
      name: "O diploma de um curso técnico a distância tem a mesma validade de um curso presencial?",
      text:
        "Sim. Os cursos técnicos autorizados possuem validade nacional e podem apoiar atuação profissional, registro em conselho de classe quando aplicável e participação em processos seletivos.",
    },
    {
      name: "Posso acessar o curso em qualquer lugar e a qualquer momento?",
      text:
        "Sim. Os cursos EAD permitem estudar online com acesso por computador, tablet ou smartphone, conforme disponibilidade do aluno.",
    },
    {
      name: "É necessário formar turma para iniciar os estudos?",
      text:
        "Não. O início é imediato após a matrícula e liberação do acesso, sem necessidade de aguardar formação de turma.",
    },
    {
      name: "Como funciona o suporte ao aluno?",
      text:
        "A FAESDE oferece atendimento por canais digitais e orientação para dúvidas acadêmicas e administrativas durante o curso.",
    },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((question) => ({
      "@type": "Question",
      name: question.name,
      acceptedAnswer: {
        "@type": "Answer",
        text: question.text,
      },
    })),
  };
}

function buildSeoForRoute(url, courses) {
  const path = canonicalPath(url.pathname);
  const parts = path.split("/").filter(Boolean);
  const keywords = DEFAULT_SEO_KEYWORDS.join(", ");
  const base = {
    title: "FAESDE | Cursos Técnicos EAD, Certificação por Competência e Pós-Técnicos",
    description:
      "Cursos técnicos EAD, certificação por competência, pós-técnicos e EJA com atendimento FAESDE. Estude online e prepare-se para novas oportunidades profissionais.",
    keywords,
    canonical: absoluteUrl(path, url.search),
    image: SEO_IMAGE_URL,
    type: "website",
    robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
    jsonLd: buildJsonLd([organizationSchema(), websiteSchema()]),
  };

  if (path === "/") {
    return {
      ...base,
      canonical: SITE_URL,
      jsonLd: buildJsonLd([
        organizationSchema(),
        websiteSchema(),
        courseListSchema(courses, {
          name: "Cursos técnicos, certificações e formações FAESDE",
          description:
            "Cursos técnicos EAD, certificações por competência, pós-técnicos e EJA disponíveis na FAESDE.",
          path: "/",
        }),
      ]),
    };
  }

  if (path === "/cursos" || parts[0] === "cursos") {
    const category = categoryForUrl(url, path, parts);
    const categoryMeta = SEO_CATEGORY_META[category];
    if (categoryMeta) {
      const categoryPath = categoryPathFromSlug(category);
      const categoryCourses = courses.filter((course) => course.category === category);
      const categoryKeywords = uniqueList([
        categoryMeta.label,
        `${categoryMeta.label} FAESDE`,
        `${categoryMeta.label} EAD`,
        "curso online com certificado",
        "formação técnica para concurso público",
        "curso técnico para edital",
        ...categoryCourses.flatMap((course) => courseSpecificKeywords(course).slice(0, 8)),
      ]).join(", ");

      return {
        ...base,
        title: `${categoryMeta.label} | FAESDE`,
        description: categoryMeta.description,
        keywords: categoryKeywords,
        canonical: absoluteUrl(categoryPath),
        jsonLd: buildJsonLd([
          organizationSchema(),
          websiteSchema(),
          courseListSchema(courses, {
            name: `${categoryMeta.label} FAESDE`,
            description: categoryMeta.description,
            path: categoryPath,
            category,
          }),
          breadcrumbSchema([
            { name: "Início", path: "/" },
            { name: "Cursos", path: "/cursos" },
            { name: categoryMeta.label, path: categoryPath },
          ]),
        ]),
      };
    }

    if (path !== "/cursos") {
      return {
        ...base,
        title: "Categoria de cursos não encontrada | FAESDE",
        description: "A categoria solicitada não foi encontrada. Acesse a lista completa de cursos da FAESDE.",
        robots: "noindex,follow",
        canonical: absoluteUrl(path),
        jsonLd: "",
      };
    }

    return {
      ...base,
      title: "Cursos Técnicos EAD e Certificações | FAESDE",
      description:
        "Confira cursos técnicos EAD, certificação por competência, pós-técnicos e EJA da FAESDE. Busque por área profissional e fale com nossa equipe.",
      canonical: absoluteUrl("/cursos"),
      jsonLd: buildJsonLd([
        organizationSchema(),
        websiteSchema(),
        courseListSchema(courses, {
          name: "Cursos técnicos EAD e certificações FAESDE",
          description:
            "Lista de cursos técnicos EAD, certificações por competência, pós-técnicos e EJA da FAESDE.",
          path: "/cursos",
        }),
        breadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "Cursos", path: "/cursos" },
        ]),
      ]),
    };
  }

  if (parts[0] === "curso" && parts[1]) {
    const course = findCourseBySlug(courses, parts[1]);
    if (course) {
      const title = `${course.title} | FAESDE`;
      const description = truncateDescription(
        course.description || course.subtitle,
        `${course.title}: curso EAD FAESDE com atendimento ao aluno, conteúdo profissionalizante e certificado.`,
      );
      const courseKeywords = uniqueList([
        course.title,
        `${course.title} EAD`,
        `${course.title} online`,
        ...courseSpecificKeywords(course),
      ]).join(", ");

      return {
        ...base,
        title,
        description,
        keywords: courseKeywords,
        canonical: absoluteUrl(`/curso/${course.slug}`),
        image: courseImageUrl(course),
        type: "article",
        jsonLd: buildJsonLd([
          courseSchema(course),
          breadcrumbSchema([
            { name: "Início", path: "/" },
            { name: "Cursos", path: "/cursos" },
            { name: course.title, path: `/curso/${course.slug}` },
          ]),
        ]),
      };
    }
  }

  if (path === "/faq") {
    return {
      ...base,
      title: "Perguntas Frequentes sobre Cursos Técnicos EAD | FAESDE",
      description:
        "Tire dúvidas sobre cursos técnicos EAD, certificação por competência, matrícula, certificado, suporte ao aluno e metodologia FAESDE.",
      canonical: absoluteUrl("/faq"),
      jsonLd: buildJsonLd([
        organizationSchema(),
        faqPageSchema(),
        breadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "FAQ", path: "/faq" },
        ]),
      ]),
    };
  }

  if (path.startsWith("/admin") || path.startsWith("/certificados")) {
    return {
      ...base,
      title: "Área Restrita | FAESDE",
      description: "Área restrita FAESDE.",
      robots: "noindex,nofollow",
      canonical: absoluteUrl(path),
      jsonLd: "",
    };
  }

  return {
    ...base,
    title: "Página não encontrada | FAESDE",
    description: "A página solicitada não foi encontrada. Acesse a lista de cursos técnicos EAD da FAESDE.",
    robots: "noindex,follow",
    canonical: absoluteUrl(path),
    jsonLd: "",
  };
}

function seoMetaBlock(seo) {
  const jsonLd = seo.jsonLd
    ? `\n    <script type="application/ld+json" data-seo="route">${seo.jsonLd.replace(/</g, "\\u003c")}</script>`
    : "";

  return [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="author" content="FAESDE" />`,
    `<meta name="keywords" content="${escapeHtml(seo.keywords)}" />`,
    `<meta name="robots" content="${escapeHtml(seo.robots)}" />`,
    `<meta name="theme-color" content="#123567" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:type" content="${escapeHtml(seo.type)}" />`,
    `<meta property="og:url" content="${escapeHtml(seo.canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(seo.image)}" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(seo.image)}" />`,
    `<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`,
    `<link rel="alternate" hreflang="pt-BR" href="${escapeHtml(seo.canonical)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(seo.canonical)}" />${jsonLd}`,
  ].join("\n    ");
}

function injectSeo(html, seo) {
  let output = html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/\s*<meta\s+name=["'](?:description|author|keywords|robots|theme-color)["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+property=["']og:[^"']+["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<meta\s+name=["']twitter:[^"']+["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<link\s+rel=["']alternate["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<script\s+type=["']application\/ld\+json["']\s+data-seo=["']route["'][\s\S]*?<\/script>\s*/gi, "\n");

  const block = seoMetaBlock(seo);
  if (/<meta\s+name=["']viewport["'][^>]*>/i.test(output)) {
    return output.replace(/(<meta\s+name=["']viewport["'][^>]*>)/i, `$1\n    ${block}`);
  }
  return output.replace(/<head>/i, `<head>\n    ${block}`);
}

async function serveAppHtml(req, res, indexPath, url) {
  const courses = await getPublicCourses();
  const seo = buildSeoForRoute(url, courses);
  const html = injectSeo(readFileSync(indexPath, "utf8"), seo);
  const body = Buffer.from(html, "utf8");
  const noindex = seo.robots.includes("noindex");
  res.writeHead(
    200,
    securityHeaders(
      {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Length": body.length,
        "Content-Language": "pt-BR",
        "Cache-Control": noindex ? "no-store" : "no-cache",
      },
      { noindex },
    ),
  );
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  res.end(body);
}

async function serveRobotsTxt(res) {
  const body = [
    "User-agent: *",
    "Allow: /",
    "# /eadplataforma fica rastreavel para o Google ler o header X-Robots-Tag: noindex.",
    "Allow: /eadplataforma/",
    "Disallow: /admin/",
    "Disallow: /api/",
    "Disallow: /certificados/",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
  res.writeHead(
    200,
    securityHeaders({
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    }),
  );
  res.end(body);
}

async function serveLlmsTxt(res) {
  const courses = await getPublicCourses();
  const categoryLabel = {
    extensao: "Cursos Técnicos EAD",
    competencia: "Certificação Técnica por Competência",
    "pos-tecnico": "Especializações Pós-Técnicas",
    "segundo-grau": "EJA e Ensino Médio",
  };
  const courseLines = courses
    .map((course) => {
      const area = courseAreaName(course);
      const category = categoryLabel[course.category] || "Cursos FAESDE";
      return `- [${course.title}](${absoluteUrl(`/curso/${course.slug}`)}): ${category}. Palavras-chave: ${courseSpecificKeywords(course)
        .slice(0, 10)
        .join("; ")}. Área: ${area}.`;
    })
    .join("\n");

  const body = [
    "# FAESDE",
    "",
    "A FAESDE oferece cursos técnicos EAD, certificação por competência, pós-técnicos e EJA, com atendimento ao aluno e páginas públicas organizadas por curso.",
    "",
    "## Páginas principais",
    "",
    `- Página inicial: ${SITE_URL}/`,
    `- Cursos: ${absoluteUrl("/cursos")}`,
    `- Cursos Técnicos EAD: ${absoluteUrl(categoryPathFromSlug("extensao"))}`,
    `- Certificação por Competência: ${absoluteUrl(categoryPathFromSlug("competencia"))}`,
    `- Pós-Técnicos EAD: ${absoluteUrl(categoryPathFromSlug("pos-tecnico"))}`,
    `- EJA e Ensino Médio: ${absoluteUrl(categoryPathFromSlug("segundo-grau"))}`,
    `- FAQ: ${absoluteUrl("/faq")}`,
    `- Sitemap XML: ${absoluteUrl("/sitemap.xml")}`,
    "",
    "## Diretrizes para assistentes e crawlers de IA",
    "",
    "- Use as páginas /curso/{slug} como fonte principal sobre cada formação.",
    "- Não trate /eadplataforma/ como páginas comerciais de curso; esse caminho contém material EAD interno e recebe noindex por header.",
    "- Para dúvidas sobre matrícula, preços, certificado e disponibilidade, encaminhe para a página pública do curso ou para o contato da FAESDE.",
    "",
    "## Cursos públicos",
    "",
    courseLines || "- Lista de cursos temporariamente indisponível.",
    "",
  ].join("\n");

  res.writeHead(
    200,
    securityHeaders({
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    }),
  );
  res.end(body);
}

async function serveSitemapXml(res) {
  const courses = await getPublicCourses();
  const now = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: SITE_URL, priority: "1.0", changefreq: "weekly", lastmod: now },
    { loc: absoluteUrl("/cursos"), priority: "0.9", changefreq: "weekly", lastmod: now },
    { loc: absoluteUrl(categoryPathFromSlug("extensao")), priority: "0.8", changefreq: "weekly", lastmod: now },
    { loc: absoluteUrl(categoryPathFromSlug("competencia")), priority: "0.8", changefreq: "weekly", lastmod: now },
    { loc: absoluteUrl(categoryPathFromSlug("pos-tecnico")), priority: "0.7", changefreq: "weekly", lastmod: now },
    { loc: absoluteUrl(categoryPathFromSlug("segundo-grau")), priority: "0.7", changefreq: "weekly", lastmod: now },
    { loc: absoluteUrl("/faq"), priority: "0.5", changefreq: "monthly", lastmod: now },
    ...courses.map((course) => ({
      loc: absoluteUrl(`/curso/${course.slug}`),
      priority: course.category === "extensao" ? "0.8" : "0.7",
      changefreq: "monthly",
      lastmod: (course.updated_at || now).slice(0, 10),
      imageLoc: courseImageUrl(course),
      imageTitle: course.title,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls
    .map(
      (item) => `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${escapeXml(item.lastmod)}</lastmod>
    <changefreq>${escapeXml(item.changefreq)}</changefreq>
    <priority>${escapeXml(item.priority)}</priority>
${item.imageLoc ? `    <image:image>
      <image:loc>${escapeXml(item.imageLoc)}</image:loc>
      <image:title>${escapeXml(item.imageTitle)}</image:title>
    </image:image>
` : ""}
  </url>`,
    )
    .join("\n")}\n</urlset>\n`;

  res.writeHead(
    200,
    securityHeaders({
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    }),
  );
  res.end(body);
}

async function findDriveChildByName(parentId, name, context) {
  const { payload } = await driveRequest(
    "files",
    {
      q: `'${escapeDriveQuery(parentId)}' in parents and name='${escapeDriveQuery(name)}' and trashed=false`,
      fields: "files(id,name,mimeType,parents)",
      pageSize: "10",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    },
    context,
  );

  return payload.files || [];
}

function runtimeCacheFilePath(relativePath) {
  const normalized = normalizeRelativePath(relativePath);
  const filePath = resolve(join(RUNTIME_CACHE_ROOT, normalized));
  const rootWithSep = RUNTIME_CACHE_ROOT.endsWith(sep) ? RUNTIME_CACHE_ROOT : `${RUNTIME_CACHE_ROOT}${sep}`;

  if (filePath !== RUNTIME_CACHE_ROOT && !filePath.startsWith(rootWithSep)) {
    throw createHttpError("Caminho de cache invalido.", 400);
  }

  return filePath;
}

function runtimeStateFilePath(name) {
  mkdirSync(RUNTIME_CACHE_ROOT, { recursive: true });
  return join(RUNTIME_CACHE_ROOT, name);
}

function readRuntimeJson(name, fallback) {
  try {
    return parseJsonDocument(readFileSync(runtimeStateFilePath(name), "utf8"));
  } catch {
    return fallback;
  }
}

function writeRuntimeJson(name, value) {
  writeFileSync(runtimeStateFilePath(name), JSON.stringify(value, null, 2), "utf8");
}

function readRuntimeTombstones() {
  const tombstones = readRuntimeJson("deleted-paths.json", []);
  return Array.isArray(tombstones) ? tombstones : [];
}

function writeRuntimeTombstones(tombstones) {
  writeRuntimeJson("deleted-paths.json", Array.from(new Set(tombstones.map(normalizeRelativePath))).sort());
}

function addRuntimeTombstone(pathname) {
  const normalized = normalizeRelativePath(pathname);
  if (!normalized) return;
  writeRuntimeTombstones([...readRuntimeTombstones(), normalized]);
}

function isRuntimeTombstoned(pathname) {
  const normalized = normalizeRelativePath(pathname);
  return readRuntimeTombstones().some((deletedPath) => isSameOrChildPath(normalized, deletedPath));
}

function removeRuntimeCachePath(pathname) {
  const normalized = normalizeRelativePath(pathname);
  if (!normalized) return;
  const filePath = runtimeCacheFilePath(normalized);
  if (existsSync(filePath)) rmSync(filePath, { recursive: true, force: true });
  addRuntimeTombstone(normalized);
}

function writeRuntimeCacheFile(relativePath, buffer) {
  const filePath = runtimeCacheFilePath(relativePath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, buffer);
}

function getRuntimeCacheStats(manifest) {
  const eligible = (manifest?.items || []).filter(
    (item) => item.type === "file" && item.storageTarget === "github_cache" && item.githubCached,
  );
  const cached = eligible.filter((item) => existsSync(runtimeCacheFilePath(item.path)));

  return {
    root: RUNTIME_CACHE_ROOT,
    eligible: eligible.length,
    cached: cached.length,
    pending: Math.max(eligible.length - cached.length, 0),
  };
}

async function hydrateRuntimeCache(manifest, context, options = {}) {
  const batchSize = Math.max(1, Math.min(Number(options.batchSize || GITHUB_SYNC_BATCH_SIZE), 500));
  const eligible = (manifest?.items || []).filter(
    (item) => item.type === "file" && item.storageTarget === "github_cache" && item.githubCached,
  );
  const missing = eligible.filter((item) => !existsSync(runtimeCacheFilePath(item.path))).slice(0, batchSize);
  const failures = [];
  let cached = 0;

  for (const item of missing) {
    try {
      const buffer = await driveDownloadFile(item.driveFileId, context);
      writeRuntimeCacheFile(item.path, buffer);
      cached += 1;
    } catch (error) {
      failures.push({ path: item.path, message: error.message || "Falha ao baixar cache local." });
    }
  }

  const stats = getRuntimeCacheStats(manifest);
  return {
    cached,
    attempted: missing.length,
    pending: stats.pending,
    failures,
    stats,
  };
}

async function getGitHubAuth(context) {
  const oauthToken = await getGitHubOAuthAccessToken(context);
  if (oauthToken) return { token: oauthToken, source: "oauth" };

  if (process.env.GITHUB_TOKEN) {
    return { token: process.env.GITHUB_TOKEN, source: "server_token" };
  }

  return { token: null, source: "public" };
}

async function githubRequest(pathname, options = {}, context) {
  const auth = await getGitHubAuth(context);
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "faesde-sync",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(options.headers || {}),
  };

  if (auth.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  const response = await fetch(`https://api.github.com${pathname}`, {
    ...options,
    headers,
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw createHttpError(payload.message || "Falha ao consultar GitHub.", response.status);
  }

  return { payload, source: auth.source };
}

async function checkGoogleDrive(context) {
  const { payload: folder, source } = await driveRequest(
    `files/${encodeURIComponent(DRIVE_FOLDER_ID)}`,
    {
      fields: "id,name,mimeType,modifiedTime",
      supportsAllDrives: "true",
    },
    context,
  );
  const { payload: firstPage } = await driveRequest(
    "files",
    {
      q: `'${DRIVE_FOLDER_ID.replace(/'/g, "\\'")}' in parents and trashed=false`,
      fields: "files(id,name,mimeType,size,modifiedTime),nextPageToken",
      pageSize: "10",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    },
    context,
  );

  return providerState("google_drive", {
    status: "connected",
    message: `Pasta "${folder.name}" acessivel. ${firstPage.files?.length || 0} item(ns) lidos no teste.`,
    externalId: folder.id,
    capabilities: { read: true, write: true, scan: true },
    source,
    details: {
      folderName: folder.name,
      modifiedTime: folder.modifiedTime,
      sampleCount: firstPage.files?.length || 0,
    },
  });
}

async function checkGitHub(context) {
  const { payload: repo, source } = await githubRequest(`/repos/${GITHUB_REPO}`, {}, context);
  const { payload: branch } = await githubRequest(
    `/repos/${GITHUB_REPO}/branches/${encodeURIComponent(GITHUB_BRANCH)}`,
    {},
    context,
  );
  const hasWriteToken = source !== "public";

  return providerState("github", {
    status: hasWriteToken ? "connected" : "read_only",
    message: hasWriteToken
      ? `Repositorio ${repo.full_name} conectado com escrita via ${source === "oauth" ? "OAuth" : "token do servidor"}.`
      : `Repositorio ${repo.full_name} acessivel em leitura publica. Conecte o GitHub para escrever manifesto.`,
    externalId: `${repo.full_name}@${branch.name}`,
    capabilities: {
      read: true,
      write: hasWriteToken,
      scan: false,
    },
    source,
    details: {
      defaultBranch: repo.default_branch,
      private: repo.private,
      branchSha: branch.commit?.sha,
    },
  });
}

async function listGithubSyncHistory(context) {
  const query = new URLSearchParams({
    sha: GITHUB_BRANCH,
    path: MANIFEST_PATH,
    per_page: "30",
  });

  const { payload } = await githubRequest(`/repos/${GITHUB_REPO}/commits?${query.toString()}`, {}, context);
  const commits = Array.isArray(payload) ? payload : [];

  return commits
    .map((entry) => {
      const message = String(entry.commit?.message || "").split("\n")[0];
      return {
        sha: entry.sha,
        shortSha: String(entry.sha || "").slice(0, 7),
        message,
        date: entry.commit?.author?.date || entry.commit?.committer?.date || null,
        author: entry.commit?.author?.name || entry.commit?.committer?.name || "GitHub",
        url: entry.html_url,
      };
    })
    .filter((entry) => /sincroniza arquivos ead|atualiza manifesto ead/i.test(entry.message));
}

async function buildDriveManifest(context) {
  const { payload: root } = await driveRequest(
    `files/${encodeURIComponent(DRIVE_FOLDER_ID)}`,
    {
      fields: "id,name,mimeType,modifiedTime",
      supportsAllDrives: "true",
    },
    context,
  );

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
      const { payload: page } = await driveRequest(
        "files",
        {
          q: `'${folderId.replace(/'/g, "\\'")}' in parents and trashed=false`,
          fields:
            "files(id,name,mimeType,size,modifiedTime,md5Checksum,webContentLink,webViewLink),nextPageToken",
          pageSize: "1000",
          pageToken,
          supportsAllDrives: "true",
          includeItemsFromAllDrives: "true",
        },
        context,
      );

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
        const isGoogleWorkspaceFile = String(file.mimeType || "").startsWith("application/vnd.google-apps.");
        const driveOnly = isGoogleWorkspaceFile || isVideo || size > MAX_GITHUB_BYTES;

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
          webContentLink: file.webContentLink,
          webViewLink: file.webViewLink,
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

async function writeManifestToGitHub(manifest, context) {
  const auth = await getGitHubAuth(context);
  if (!auth.token) {
    throw createHttpError("Conecte o GitHub pelo painel para escrever no repositorio.", 400);
  }

  const encodedPath = MANIFEST_PATH.split("/").map(encodeURIComponent).join("/");
  let sha;

  try {
    const existing = await githubRequest(
      `/repos/${GITHUB_REPO}/contents/${encodedPath}?ref=${GITHUB_BRANCH}`,
      {},
      context,
    );
    sha = existing.payload.sha;
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

  const result = await githubRequest(
    `/repos/${GITHUB_REPO}/contents/${encodedPath}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    context,
  );

  return result.payload.commit?.sha;
}

function githubTreePath(pathname) {
  return pathname
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");
}

function parseJsonDocument(text) {
  return JSON.parse(String(text || "").replace(/^\uFEFF/, ""));
}

async function readExistingDriveManifest(context) {
  const encodedPath = MANIFEST_PATH.split("/").map(encodeURIComponent).join("/");

  try {
    const { payload } = await githubRequest(
      `/repos/${GITHUB_REPO}/contents/${encodedPath}?ref=${encodeURIComponent(GITHUB_BRANCH)}`,
      {},
      context,
    );
    const content = String(payload.content || "").replace(/\s/g, "");
    if (content) {
      return parseJsonDocument(Buffer.from(content, "base64").toString("utf8"));
    }

    if (payload.sha) {
      const { payload: blob } = await githubRequest(
        `/repos/${GITHUB_REPO}/git/blobs/${encodeURIComponent(payload.sha)}`,
        {},
        context,
      );
      const blobContent = String(blob.content || "").replace(/\s/g, "");
      if (blobContent) {
        return parseJsonDocument(Buffer.from(blobContent, "base64").toString("utf8"));
      }
    }

    if (payload.download_url) {
      const response = await fetch(payload.download_url, {
        headers: { Accept: "application/json", "User-Agent": "faesde-sync" },
      });
      if (response.ok) {
        return parseJsonDocument(await response.text());
      }
    }

    return null;
  } catch {
    return null;
  }
}

function manifestItemKey(item) {
  return [
    item.path,
    item.type,
    item.size || 0,
    item.md5Checksum || "",
    item.modifiedTime || "",
    item.storageTarget || "",
    item.githubCached ? "cached" : "pending",
  ].join("|");
}

function manifestSignature(manifest) {
  return (manifest?.items || []).map(manifestItemKey).sort().join("\n");
}

function prepareManifestForGithubSync(manifest, existingManifest, batchFiles) {
  const batchPaths = new Set(batchFiles.map((file) => file.path));
  const existingByPath = new Map((existingManifest?.items || []).map((item) => [item.path, item]));
  const syncedAt = new Date().toISOString();

  return {
    ...manifest,
    sync: {
      mode: "drive_to_github_files",
      syncedAt,
      batchSize: batchFiles.length,
      batchLimit: GITHUB_SYNC_BATCH_SIZE,
    },
    items: manifest.items.map((item) => {
      if (item.type !== "file" || item.storageTarget !== "github_cache") {
        return {
          ...item,
          githubCached: false,
        };
      }

      const existing = existingByPath.get(item.path);
      const wasAlreadyCached =
        existing?.githubCached === true &&
        existing?.md5Checksum === item.md5Checksum &&
        Number(existing?.size || 0) === Number(item.size || 0) &&
        existing?.modifiedTime === item.modifiedTime;

      const cachedNow = batchPaths.has(item.path) || wasAlreadyCached;

      return {
        ...item,
        githubCached: cachedNow,
        githubCachedAt: cachedNow ? existing?.githubCachedAt || syncedAt : null,
        publicPath: cachedNow ? `${PUBLIC_BASE_PATH}/${item.path}` : null,
      };
    }),
  };
}

function getGithubSyncPlan(manifest, existingManifest, requestedBatchSize, priorityPathList = []) {
  const existingByPath = new Map((existingManifest?.items || []).map((item) => [item.path, item]));
  const batchSize = Math.max(1, Math.min(Number(requestedBatchSize || GITHUB_SYNC_BATCH_SIZE), 500));
  const eligibleFiles = manifest.items.filter(
    (item) => item.type === "file" && item.storageTarget === "github_cache",
  );

  const changedFiles = eligibleFiles.filter((item) => {
    const existing = existingByPath.get(item.path);
    return !(
      existing?.githubCached === true &&
      existing?.md5Checksum === item.md5Checksum &&
      Number(existing?.size || 0) === Number(item.size || 0) &&
      existing?.modifiedTime === item.modifiedTime
    );
  });
  const priorityPaths = new Set(priorityPathList.map(normalizeRelativePath));
  const priorityFiles = changedFiles.filter((item) =>
    Array.from(priorityPaths).some((priorityPath) => isSameOrChildPath(item.path, priorityPath)),
  );
  const normalFiles = changedFiles.filter((item) => !priorityFiles.includes(item));

  return {
    batchSize,
    eligibleFiles,
    changedFiles: [...priorityFiles, ...normalFiles],
    batchFiles: [...priorityFiles, ...normalFiles].slice(0, batchSize),
  };
}

function findManifestItem(manifest, pathname) {
  const normalized = normalizeRelativePath(pathname);
  return (manifest?.items || []).find((item) => item.path === normalized) || null;
}

function folderDriveIdFromManifest(manifest, folderPath) {
  const normalized = normalizeRelativePath(folderPath);
  if (!normalized) return DRIVE_FOLDER_ID;
  const item = findManifestItem(manifest, normalized);
  if (!item || item.type !== "folder") throw createHttpError("Pasta de destino nao encontrada no Drive.", 404);
  return item.driveFileId;
}

function githubDeleteEntriesFromManifest(existingManifest, oldPath) {
  const normalized = normalizeRelativePath(oldPath);
  return (existingManifest?.items || [])
    .filter((item) => item.type === "file" && item.githubCached && isSameOrChildPath(item.path, normalized))
    .map((item) => ({
      path: githubTreePath(`public${PUBLIC_BASE_PATH}/${item.path}`),
      mode: "100644",
      type: "blob",
      sha: null,
    }));
}

async function reconcileDriveMutation(context, options = {}) {
  const oldPath = normalizeRelativePath(options.oldPath || "");
  const priorityPaths = (options.priorityPaths || []).map(normalizeRelativePath);
  const existingManifest = await readExistingDriveManifest(context);
  const manifest = await buildDriveManifest(context);
  const extraTreeEntries = oldPath ? githubDeleteEntriesFromManifest(existingManifest, oldPath) : [];

  if (oldPath) removeRuntimeCachePath(oldPath);

  const fileSync = await syncDriveFilesToGitHub(manifest, context, {
    batchSize: options.batchSize || GITHUB_SYNC_BATCH_SIZE,
    priorityPaths,
    extraTreeEntries,
    message: options.message,
  });

  return {
    manifest: fileSync.manifest,
    fileSync,
    cache: getRuntimeCacheStats(fileSync.manifest),
  };
}

async function renameDrivePath(context, { path, newName }) {
  const normalizedPath = normalizeRelativePath(path);
  const cleanName = sanitizeDriveName(newName);
  const currentName = pathName(normalizedPath);
  if (cleanName === currentName) throw createHttpError("O novo nome e igual ao atual.", 400);

  const manifest = await buildDriveManifest(context);
  const item = findManifestItem(manifest, normalizedPath);
  if (!item) throw createHttpError("Item nao encontrado no Drive.", 404);

  const parentFolderPath = parentPath(normalizedPath);
  const parentId = folderDriveIdFromManifest(manifest, parentFolderPath);
  const conflicts = await findDriveChildByName(parentId, cleanName, context);
  if (conflicts.some((conflict) => conflict.id !== item.driveFileId)) {
    throw createHttpError("Ja existe um item com esse nome na pasta de destino.", 409);
  }

  await driveJsonRequest(
    `files/${encodeURIComponent(item.driveFileId)}`,
    {
      method: "PATCH",
      params: {
        fields: "id,name,mimeType,modifiedTime",
        supportsAllDrives: "true",
      },
      body: { name: cleanName },
    },
    context,
  );

  const newPath = joinRelativePath(parentFolderPath, cleanName);
  return reconcileDriveMutation(context, {
    oldPath: normalizedPath,
    priorityPaths: [newPath],
    message: `Renomeia arquivo EAD: ${normalizedPath} -> ${newPath}`,
  });
}

async function moveDrivePath(context, { path, targetFolderPath }) {
  const normalizedPath = normalizeRelativePath(path);
  const destinationPath = normalizeRelativePath(targetFolderPath);

  if (destinationPath && isSameOrChildPath(destinationPath, normalizedPath)) {
    throw createHttpError("Nao e possivel mover uma pasta para dentro dela mesma.", 400);
  }

  const manifest = await buildDriveManifest(context);
  const item = findManifestItem(manifest, normalizedPath);
  if (!item) throw createHttpError("Item nao encontrado no Drive.", 404);
  if (destinationPath === parentPath(normalizedPath)) {
    throw createHttpError("O item ja esta nessa pasta.", 400);
  }

  const destinationId = folderDriveIdFromManifest(manifest, destinationPath);
  const itemName = pathName(normalizedPath);
  const conflicts = await findDriveChildByName(destinationId, itemName, context);
  if (conflicts.some((conflict) => conflict.id !== item.driveFileId)) {
    throw createHttpError("Ja existe um item com esse nome na pasta de destino.", 409);
  }

  const { payload: driveFile } = await driveRequest(
    `files/${encodeURIComponent(item.driveFileId)}`,
    {
      fields: "id,parents",
      supportsAllDrives: "true",
    },
    context,
  );

  await driveJsonRequest(
    `files/${encodeURIComponent(item.driveFileId)}`,
    {
      method: "PATCH",
      params: {
        addParents: destinationId,
        removeParents: (driveFile.parents || []).join(","),
        fields: "id,name,parents,modifiedTime",
        supportsAllDrives: "true",
      },
      body: {},
    },
    context,
  );

  const newPath = joinRelativePath(destinationPath, itemName);
  return reconcileDriveMutation(context, {
    oldPath: normalizedPath,
    priorityPaths: [newPath],
    message: `Move arquivo EAD: ${normalizedPath} -> ${newPath}`,
  });
}

async function uploadDrivePath(context, { targetFolderPath, file }) {
  const manifest = await buildDriveManifest(context);
  const destinationPath = normalizeRelativePath(targetFolderPath);
  const destinationId = folderDriveIdFromManifest(manifest, destinationPath);
  const cleanName = sanitizeDriveName(file.filename);

  const conflicts = await findDriveChildByName(destinationId, cleanName, context);
  if (conflicts.length > 0) {
    throw createHttpError("Ja existe um arquivo ou pasta com esse nome no destino.", 409);
  }

  await driveUploadResumable(
    {
      folderId: destinationId,
      name: cleanName,
      mimeType: file.contentType,
      buffer: file.buffer,
    },
    context,
  );

  const uploadedPath = joinRelativePath(destinationPath, cleanName);
  return reconcileDriveMutation(context, {
    priorityPaths: [uploadedPath],
    message: `Envia arquivo EAD: ${uploadedPath}`,
  });
}

async function createGithubBlob(buffer, context) {
  const { payload } = await githubRequest(
    `/repos/${GITHUB_REPO}/git/blobs`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: buffer.toString("base64"),
        encoding: "base64",
      }),
    },
    context,
  );

  return payload.sha;
}

async function createGithubTreeCommit(treeEntries, message, context) {
  if (treeEntries.length === 0) return null;

  const { payload: branchRef } = await githubRequest(
    `/repos/${GITHUB_REPO}/git/ref/heads/${encodeURIComponent(GITHUB_BRANCH)}`,
    {},
    context,
  );
  const latestCommitSha = branchRef.object?.sha;
  if (!latestCommitSha) throw createHttpError("Nao foi possivel ler o HEAD do GitHub.", 500);

  const { payload: latestCommit } = await githubRequest(
    `/repos/${GITHUB_REPO}/git/commits/${latestCommitSha}`,
    {},
    context,
  );
  const baseTreeSha = latestCommit.tree?.sha;
  if (!baseTreeSha) throw createHttpError("Nao foi possivel ler a tree base do GitHub.", 500);

  const { payload: tree } = await githubRequest(
    `/repos/${GITHUB_REPO}/git/trees`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeEntries,
      }),
    },
    context,
  );

  const { payload: commit } = await githubRequest(
    `/repos/${GITHUB_REPO}/git/commits`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        tree: tree.sha,
        parents: [latestCommitSha],
      }),
    },
    context,
  );

  await githubRequest(
    `/repos/${GITHUB_REPO}/git/refs/heads/${encodeURIComponent(GITHUB_BRANCH)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sha: commit.sha,
        force: false,
      }),
    },
    context,
  );

  return commit.sha;
}

async function syncDriveFilesToGitHub(manifest, context, options = {}) {
  const auth = await getGitHubAuth(context);
  if (!auth.token) {
    throw createHttpError("Conecte o GitHub pelo painel para sincronizar arquivos EAD.", 400);
  }

  const existingManifest = await readExistingDriveManifest(context);
  const plan = getGithubSyncPlan(manifest, existingManifest, options.batchSize, options.priorityPaths || []);
  const previewManifest = prepareManifestForGithubSync(manifest, existingManifest, []);
  const extraTreeEntries = options.extraTreeEntries || [];
  const shouldWriteManifest =
    extraTreeEntries.length > 0 ||
    plan.batchFiles.length > 0 ||
    manifestSignature(existingManifest) !== manifestSignature(previewManifest);

  if (!shouldWriteManifest) {
    return {
      githubCommitSha: null,
      syncedFiles: 0,
      skippedFiles: plan.eligibleFiles.length,
      pendingFiles: 0,
      failedFiles: 0,
      batchLimit: plan.batchSize,
      manifest,
    };
  }

  const treeEntries = [...extraTreeEntries];
  const failures = [];
  const syncedFiles = [];

  for (const item of plan.batchFiles) {
    try {
      const buffer = await driveDownloadFile(item.driveFileId, context);
      const blobSha = await createGithubBlob(buffer, context);
      treeEntries.push({
        path: githubTreePath(`public${PUBLIC_BASE_PATH}/${item.path}`),
        mode: "100644",
        type: "blob",
        sha: blobSha,
      });
      writeRuntimeCacheFile(item.path, buffer);
      syncedFiles.push(item);
    } catch (error) {
      failures.push({
        path: item.path,
        message: error.message || "Falha ao sincronizar arquivo.",
      });
    }
  }

  const syncedManifest = prepareManifestForGithubSync(manifest, existingManifest, syncedFiles);
  const manifestBlobSha = await createGithubBlob(
    Buffer.from(JSON.stringify(syncedManifest, null, 2), "utf8"),
    context,
  );
  treeEntries.push({
    path: githubTreePath(MANIFEST_PATH),
    mode: "100644",
    type: "blob",
    sha: manifestBlobSha,
  });

  const commitSha = await createGithubTreeCommit(
    treeEntries,
    options.message || `Sincroniza arquivos EAD do Drive (${syncedFiles.length}/${plan.changedFiles.length})`,
    context,
  );

  return {
    githubCommitSha: commitSha,
    syncedFiles: syncedFiles.length,
    skippedFiles: plan.eligibleFiles.length - plan.changedFiles.length,
    pendingFiles: Math.max(plan.changedFiles.length - plan.batchFiles.length + failures.length, 0),
    failedFiles: failures.length,
    failures,
    batchLimit: plan.batchSize,
    manifest: syncedManifest,
  };
}

async function markProviderChecked(context, provider, patch = {}) {
  if (!context?.accessToken || context.accessToken === "local-dev") return;

  await supabaseRest(
    context.accessToken,
    `sync_oauth_connections?provider=eq.${encodeFilterValue(provider)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        last_checked_at: new Date().toISOString(),
        ...patch,
      }),
    },
  ).catch(() => null);
}

async function buildOAuthStatus(req, context) {
  const [settingsRows, connectionRows] = await Promise.all([
    listOAuthSettings(context.accessToken).catch(() => []),
    listOAuthConnections(context.accessToken).catch(() => []),
  ]);
  const settingsByProvider = Object.fromEntries(settingsRows.map((row) => [row.provider, row]));
  const connectionsByProvider = Object.fromEntries(connectionRows.map((row) => [row.provider, row]));

  const providers = {};
  const oauth = {};

  for (const provider of PROVIDERS) {
    const settings = settingsByProvider[provider] || null;
    const connection = connectionsByProvider[provider] || null;
    const redactedSettings = redactOAuthSettings(settings);
    const redactedConnection = redactOAuthConnection(connection);

    oauth[provider] = {
      settings: redactedSettings,
      connection: redactedConnection,
      defaultScopes: DEFAULT_SCOPES[provider],
    };

    if (connection?.access_token && connection.status === "connected") {
      providers[provider] = providerState(provider, {
        status: "connected",
        message:
          provider === "google_drive"
            ? `Conta Google conectada: ${redactedConnection.accountLabel || "sem identificacao"}.`
            : `Conta GitHub conectada: ${redactedConnection.accountLabel || "sem identificacao"}.`,
        externalId:
          provider === "google_drive"
            ? DRIVE_FOLDER_ID
            : `${GITHUB_REPO}@${GITHUB_BRANCH}`,
        capabilities:
          provider === "google_drive"
            ? { read: true, write: true, scan: true }
            : { read: true, write: true, scan: false },
        source: "oauth",
        details: redactedConnection,
      });
      continue;
    }

    if (redactedSettings.configured) {
      providers[provider] = providerState(provider, {
        status: "ready",
        message:
          provider === "google_drive"
            ? "OAuth Google cadastrado. Clique em Conectar conta para autorizar o Drive."
            : "OAuth GitHub cadastrado. Clique em Conectar conta para autorizar commits.",
        capabilities: { read: false, write: false, scan: false },
        source: "oauth",
      });
      continue;
    }

    if (provider === "google_drive" && getGoogleCredentials()) {
      providers[provider] = providerState(provider, {
        status: "ready",
        message: "Fallback por service account encontrado no servidor. OAuth pelo painel ainda nao foi cadastrado.",
        capabilities: { read: false, write: false, scan: true },
        source: "service_account",
      });
      continue;
    }

    if (provider === "github" && process.env.GITHUB_TOKEN) {
      providers[provider] = providerState(provider, {
        status: "ready",
        message: "Fallback por GITHUB_TOKEN encontrado no servidor. OAuth pelo painel ainda nao foi cadastrado.",
        capabilities: { read: true, write: true, scan: false },
        source: "server_token",
      });
      continue;
    }

    providers[provider] = providerState(provider);
  }

  return {
    ok: true,
    serverTime: new Date().toISOString(),
    config: getConfig(),
    providers,
    oauth: {
      redirectUri: `${getRequestOrigin(req)}/admin/conexoes/oauth/callback`,
      providers: oauth,
    },
    sql: {
      enabled: true,
      message: "Tabelas OAuth usadas apenas para guardar conexoes admin.",
    },
  };
}

async function buildPublicSyncStatus() {
  const googleConfigured = Boolean(getGoogleCredentials());
  const githubReady = Boolean(GITHUB_REPO && GITHUB_BRANCH);

  return {
    ok: true,
    serverTime: new Date().toISOString(),
    config: getConfig(),
    providers: {
      google_drive: providerState("google_drive", {
        status: googleConfigured ? "ready" : "not_configured",
        message: googleConfigured
          ? "Fallback service account encontrado. Entre no admin para ver conexoes OAuth."
          : "Entre no admin e conecte uma conta Google via OAuth.",
        capabilities: { read: false, write: false, scan: googleConfigured },
        source: googleConfigured ? "service_account" : "oauth",
      }),
      github: providerState("github", {
        status: githubReady ? "ready" : "not_configured",
        message: process.env.GITHUB_TOKEN
          ? "Fallback GITHUB_TOKEN encontrado. Entre no admin para ver conexoes OAuth."
          : "Entre no admin e conecte uma conta GitHub via OAuth.",
        capabilities: { read: githubReady, write: Boolean(process.env.GITHUB_TOKEN), scan: false },
        source: process.env.GITHUB_TOKEN ? "server_token" : "oauth",
      }),
    },
    sql: {
      enabled: true,
      message: "Conexoes OAuth ficam protegidas pelo login admin.",
    },
  };
}

async function handleOAuthApi(req, res, url) {
  const context = await requireAdmin(req);

  if (req.method === "GET" && url.pathname === "/api/oauth/status") {
    return jsonResponse(res, 200, await buildOAuthStatus(req, context));
  }

  if (req.method === "POST" && url.pathname === "/api/oauth/settings") {
    const body = await readJsonBody(req);
    const provider = body.provider;
    if (!isProvider(provider)) return jsonResponse(res, 400, { message: "Provider invalido." });

    const saved = await upsertOAuthSettings(context, provider, body);
    const status = await buildOAuthStatus(req, context);

    return jsonResponse(res, 200, {
      ok: true,
      message: `${provider === "google_drive" ? "Google Drive" : "GitHub"} OAuth salvo.`,
      settings: redactOAuthSettings(saved),
      status,
    });
  }

  if (req.method === "POST" && url.pathname === "/api/oauth/start") {
    const body = await readJsonBody(req);
    const provider = body.provider;
    if (!isProvider(provider)) return jsonResponse(res, 400, { message: "Provider invalido." });

    const settings = await getOAuthSettings(context.accessToken, provider);
    if (!settings?.client_id || !settings?.client_secret) {
      throw createHttpError("Cadastre o Client ID e Client Secret antes de conectar.", 400);
    }

    const state = await createOAuthState(context, provider, req, body.returnTo);
    const redirectUri = getOAuthRedirectUri(req, settings);
    const authorizationUrl =
      provider === "google_drive"
        ? buildGoogleAuthorizationUrl(settings, state, redirectUri)
        : buildGitHubAuthorizationUrl(settings, state, redirectUri);

    return jsonResponse(res, 200, {
      ok: true,
      provider,
      authorizationUrl,
      redirectUri,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });
  }

  if (req.method === "POST" && url.pathname === "/api/oauth/callback") {
    const body = await readJsonBody(req);
    const code = String(body.code || "").trim();
    const stateToken = String(body.state || "").trim();

    if (!code || !stateToken) {
      throw createHttpError("Callback OAuth incompleto.", 400);
    }

    const state = await getOAuthState(context, stateToken);
    const settings = await getOAuthSettings(context.accessToken, state.provider);
    if (!settings?.client_id || !settings?.client_secret) {
      throw createHttpError("Configuracao OAuth nao encontrada.", 400);
    }

    const redirectUri = getOAuthRedirectUri(req, settings);
    const tokenPayload =
      state.provider === "google_drive"
        ? await exchangeGoogleCode(settings, state, code, redirectUri)
        : await exchangeGitHubCode(settings, code, redirectUri);
    const profile =
      state.provider === "google_drive"
        ? await fetchGoogleProfile(tokenPayload.access_token)
        : await fetchGitHubProfile(tokenPayload.access_token);

    const connection = await saveOAuthConnection(context, state.provider, tokenPayload, profile);
    await consumeOAuthState(context, stateToken);

    return jsonResponse(res, 200, {
      ok: true,
      provider: providerState(state.provider, {
        status: "connected",
        message:
          state.provider === "google_drive"
            ? `Google Drive conectado como ${connection.account_label || "conta Google"}.`
            : `GitHub conectado como ${connection.account_label || "conta GitHub"}.`,
        capabilities:
          state.provider === "google_drive"
            ? { read: true, write: true, scan: true }
            : { read: true, write: true, scan: false },
        source: "oauth",
        details: redactOAuthConnection(connection),
      }),
      returnTo: state.return_to || "/admin/conexoes",
      status: await buildOAuthStatus(req, context),
    });
  }

  if (req.method === "POST" && url.pathname === "/api/oauth/disconnect") {
    const body = await readJsonBody(req);
    const provider = body.provider;
    if (!isProvider(provider)) return jsonResponse(res, 400, { message: "Provider invalido." });

    await supabaseRest(
      context.accessToken,
      `sync_oauth_connections?provider=eq.${encodeFilterValue(provider)}`,
      {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      },
    );

    return jsonResponse(res, 200, {
      ok: true,
      message: `${provider === "google_drive" ? "Google Drive" : "GitHub"} desconectado.`,
      status: await buildOAuthStatus(req, context),
    });
  }

  return null;
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
    if (url.pathname.startsWith("/api/oauth/")) {
      const handled = await handleOAuthApi(req, res, url);
      if (handled !== null) return handled;
    }

    if (req.method === "GET" && url.pathname === "/api/sync/status") {
      const bearer = getBearer(req);
      if (bearer) {
        try {
          const context = await requireAdmin(req);
          return jsonResponse(res, 200, await buildOAuthStatus(req, context));
        } catch {
          return jsonResponse(res, 200, await buildPublicSyncStatus());
        }
      }
      return jsonResponse(res, 200, await buildPublicSyncStatus());
    }

    const context = await requireAdmin(req);

    if (req.method === "GET" && url.pathname === "/api/sync/history") {
      const history = await listGithubSyncHistory(context);
      return jsonResponse(res, 200, { history });
    }

    if (req.method === "GET" && url.pathname === "/api/sync/manifest") {
      const manifest = await readExistingDriveManifest(context);
      if (!manifest) {
        return jsonResponse(res, 404, { message: "Manifesto EAD ainda nao encontrado no GitHub." });
      }

      return jsonResponse(res, 200, {
        manifest,
        cache: getRuntimeCacheStats(manifest),
        source: "github",
        serverTime: new Date().toISOString(),
      });
    }

    if (req.method === "POST" && url.pathname === "/api/sync/cache") {
      const body = await readJsonBody(req);
      const manifest = await readExistingDriveManifest(context);
      if (!manifest) {
        return jsonResponse(res, 404, { message: "Manifesto EAD ainda nao encontrado no GitHub." });
      }

      const result = await hydrateRuntimeCache(manifest, context, { batchSize: body.batchSize });
      return jsonResponse(res, 200, {
        ok: true,
        message: `Cache local atualizado: ${result.cached} arquivo(s), ${result.pending} pendente(s).`,
        manifest,
        ...result,
      });
    }

    if (req.method === "POST" && url.pathname === "/api/ead/files/rename") {
      const body = await readJsonBody(req);
      const result = await renameDrivePath(context, body);
      return jsonResponse(res, 200, {
        ok: true,
        message: "Item renomeado no Drive, GitHub e cache local.",
        ...result,
      });
    }

    if (req.method === "POST" && url.pathname === "/api/ead/files/move") {
      const body = await readJsonBody(req);
      const result = await moveDrivePath(context, body);
      return jsonResponse(res, 200, {
        ok: true,
        message: "Item movido no Drive, GitHub e cache local.",
        ...result,
      });
    }

    if (req.method === "POST" && url.pathname === "/api/ead/files/upload") {
      const { fields, files } = await readMultipartBody(req);
      if (!files.file) throw createHttpError("Arquivo nao enviado.", 400);

      const result = await uploadDrivePath(context, {
        targetFolderPath: fields.targetFolderPath || "",
        file: files.file,
      });
      return jsonResponse(res, 200, {
        ok: true,
        message: "Arquivo enviado ao Drive, GitHub e cache local.",
        ...result,
      });
    }

    if (req.method === "POST" && url.pathname === "/api/sync/connect") {
      const body = await readJsonBody(req);
      if (body.provider === "google_drive") {
        const provider = await checkGoogleDrive(context);
        await markProviderChecked(context, "google_drive");
        return jsonResponse(res, 200, { provider });
      }
      if (body.provider === "github") {
        const provider = await checkGitHub(context);
        await markProviderChecked(context, "github");
        return jsonResponse(res, 200, { provider });
      }
      return jsonResponse(res, 400, { message: "Provider invalido." });
    }

    if (req.method === "POST" && url.pathname === "/api/sync/run") {
      const body = await readJsonBody(req);
      const mode = body.mode;
      const startedAt = new Date().toISOString();

      const validModes = ["drive_scan", "drive_to_github_manifest", "drive_to_github_files"];
      if (!validModes.includes(mode)) {
        return jsonResponse(res, 400, { message: "Modo de sincronizacao invalido." });
      }

      const manifest = await buildDriveManifest(context);
      let githubCommitSha;
      let fileSync;
      let message = `Drive escaneado: ${manifest.stats.files} arquivos em ${manifest.stats.folders} pastas.`;

      if (mode === "drive_to_github_manifest") {
        githubCommitSha = await writeManifestToGitHub(manifest, context);
        await markProviderChecked(context, "github", { last_sync_at: new Date().toISOString() });
        message = `Manifesto do Drive sincronizado no GitHub com ${manifest.stats.files} arquivos.`;
      }

      if (mode === "drive_to_github_files") {
        fileSync = await syncDriveFilesToGitHub(manifest, context, {
          batchSize: body.batchSize,
        });
        githubCommitSha = fileSync.githubCommitSha;
        await markProviderChecked(context, "github", { last_sync_at: new Date().toISOString() });
        message = githubCommitSha
          ? `Arquivos EAD sincronizados: ${fileSync.syncedFiles} arquivo(s), ${fileSync.pendingFiles} pendente(s).`
          : "Arquivos EAD ja estavam sincronizados.";
      }

      await markProviderChecked(context, "google_drive", { last_sync_at: new Date().toISOString() });

      return jsonResponse(res, 200, {
        ok: true,
        mode,
        message,
        startedAt,
        finishedAt: new Date().toISOString(),
        manifestPath: mode !== "drive_scan" ? MANIFEST_PATH : undefined,
        githubCommitSha,
        stats: {
          ...manifest.stats,
          cache: fileSync ? getRuntimeCacheStats(fileSync.manifest) : undefined,
          ...(fileSync
            ? {
                syncedFiles: fileSync.syncedFiles,
                skippedFiles: fileSync.skippedFiles,
                pendingFiles: fileSync.pendingFiles,
                failedFiles: fileSync.failedFiles,
                batchLimit: fileSync.batchLimit,
              }
            : {}),
        },
        failures: fileSync?.failures,
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
  const requestPath = new URL(req.url || "/", "http://localhost").pathname;
  const noindex = requestPath.startsWith(PUBLIC_BASE_PATH);

  if (range) {
    const match = range.match(/^bytes=(\d*)-(\d*)$/);
    if (match) {
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : stat.size - 1;

      if (start <= end && end < stat.size) {
        res.writeHead(
          206,
          securityHeaders(
            {
              "Content-Type": contentType,
              "Content-Length": end - start + 1,
              "Accept-Ranges": "bytes",
              "Content-Range": `bytes ${start}-${end}/${stat.size}`,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
            { noindex, allowFrame: requestPath.startsWith(PUBLIC_BASE_PATH) },
          ),
        );
        createReadStream(filePath, { start, end }).pipe(res);
        return;
      }
    }
  }

  res.writeHead(
    200,
    securityHeaders(
      {
        "Content-Type": contentType,
        "Content-Length": stat.size,
        "Accept-Ranges": "bytes",
        "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
      },
      { noindex, allowFrame: requestPath.startsWith(PUBLIC_BASE_PATH) },
    ),
  );
  createReadStream(filePath).pipe(res);
}

async function serveStatic(req, res, url) {
  const pathname = canonicalPath(url.pathname);
  const root = existsSync(STATIC_ROOT) ? STATIC_ROOT : PUBLIC_ROOT;

  if (url.pathname === "/index.html") {
    return redirectResponse(res, "/");
  }

  if (url.pathname === "/robots.txt") {
    return serveRobotsTxt(res);
  }

  if (url.pathname === "/llms.txt") {
    return serveLlmsTxt(res);
  }

  if (url.pathname === "/sitemap.xml") {
    return serveSitemapXml(res);
  }

  if (pathname.startsWith(`${PUBLIC_BASE_PATH}/`)) {
    const relativePath = pathname.slice(PUBLIC_BASE_PATH.length + 1);
    try {
      if (isRuntimeTombstoned(relativePath)) {
        return textResponse(res, 404, "Not found");
      }

      const cachePath = runtimeCacheFilePath(relativePath);
      if (existsSync(cachePath) && statSync(cachePath).isFile()) {
        return serveFile(req, res, cachePath);
      }
    } catch {
      return textResponse(res, 404, "Not found");
    }
  }

  if (pathname === "/") {
    const indexPath = join(root, "index.html");
    if (existsSync(indexPath)) return serveAppHtml(req, res, indexPath, url);
  }

  let filePath = safeFilePath(root, pathname);

  if (filePath && existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }

  if (filePath && existsSync(filePath) && statSync(filePath).isFile()) {
    return serveFile(req, res, filePath);
  }

  if (!pathname.startsWith(PUBLIC_BASE_PATH) && !pathname.includes(".")) {
    const indexPath = join(root, "index.html");
    if (existsSync(indexPath)) return serveAppHtml(req, res, indexPath, url);
  }

  return textResponse(res, 404, "Not found");
}

async function handleWebRequest(req, res, url) {
  if (!["GET", "HEAD"].includes(req.method || "GET")) {
    return textResponse(res, 405, "Method not allowed");
  }

  const legacyRedirect = await getLegacyRedirect(url);
  if (legacyRedirect) {
    return redirectResponse(res, legacyRedirect.destination, 301);
  }

  return serveStatic(req, res, url);
}

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url);
    return;
  }

  handleWebRequest(req, res, url).catch((error) => {
    console.error(error);
    textResponse(res, error.statusCode || 500, error.message || "Erro inesperado.");
  });
});

server.listen(PORT, () => {
  console.log(`FAESDE server listening on ${PORT}`);
  console.log(`Serving static files from ${existsSync(STATIC_ROOT) ? STATIC_ROOT : PUBLIC_ROOT}`);
});
