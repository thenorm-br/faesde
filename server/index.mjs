import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
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
const MANIFEST_PATH = process.env.EAD_DRIVE_MANIFEST_PATH || "public/eadplataforma-drive-manifest.json";

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

      if (mode !== "drive_scan" && mode !== "drive_to_github_manifest") {
        return jsonResponse(res, 400, { message: "Modo de sincronizacao invalido." });
      }

      const manifest = await buildDriveManifest(context);
      let githubCommitSha;
      let message = `Drive escaneado: ${manifest.stats.files} arquivos em ${manifest.stats.folders} pastas.`;

      if (mode === "drive_to_github_manifest") {
        githubCommitSha = await writeManifestToGitHub(manifest, context);
        await markProviderChecked(context, "github", { last_sync_at: new Date().toISOString() });
        message = `Manifesto do Drive sincronizado no GitHub com ${manifest.stats.files} arquivos.`;
      }

      await markProviderChecked(context, "google_drive", { last_sync_at: new Date().toISOString() });

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
