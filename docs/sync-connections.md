# FAESDE Drive/GitHub sync

The admin route `/admin/conexoes` connects Google Drive and GitHub through OAuth.

SQL redundancy is still postponed. The migration in this stage only stores OAuth app settings, temporary OAuth states, and connected admin accounts.

## Runtime

Production must run the Node server:

```bash
npm run start
```

The server serves `dist/` and exposes the sync API under `/api/*`.

## OAuth flow

1. Open `/admin/conexoes`.
2. Go to `Configurar OAuth`.
3. Copy the callback URL shown by the panel.
4. Create or update OAuth apps in Google/GitHub using that callback URL.
5. Save `Client ID` and `Client Secret` in the admin panel.
6. Click `Conectar conta` and authorize the provider account.

The callback returns to `/admin/conexoes/oauth/callback`. The React admin page sends the received `code` and `state` to the Node server together with the Supabase admin session. This lets the server exchange the code without exposing secrets in the browser bundle.

## Database tables

`supabase/migrations/20260721201500_add_sync_oauth_connections.sql` creates:

- `sync_oauth_app_settings`: OAuth app client IDs/secrets and scopes.
- `sync_oauth_states`: short-lived state tokens for CSRF protection.
- `sync_oauth_connections`: connected account tokens and metadata.

All tables use RLS and require `public.has_role(auth.uid(), 'admin')`.

## API endpoints

- `GET /api/health`
  - Public health check for the Node server.

- `GET /api/oauth/status`
  - Requires Supabase admin session bearer token.
  - Returns redacted OAuth settings, connected account labels, and sync provider states.

- `POST /api/oauth/settings`
  - Requires Supabase admin session bearer token.
  - Body: `{ "provider": "google_drive" | "github", "clientId": "...", "clientSecret": "...", "scopes": "...", "redirectUri": "..." }`
  - Saves OAuth app settings in Supabase.

- `POST /api/oauth/start`
  - Requires Supabase admin session bearer token.
  - Body: `{ "provider": "google_drive" | "github" }`
  - Creates a short-lived OAuth state and returns an authorization URL.

- `POST /api/oauth/callback`
  - Requires Supabase admin session bearer token.
  - Body: `{ "code": "...", "state": "..." }`
  - Exchanges the code and saves the connected account.

- `POST /api/oauth/disconnect`
  - Requires Supabase admin session bearer token.
  - Body: `{ "provider": "google_drive" | "github" }`
  - Deletes the connected account token.

- `GET /api/sync/status`
  - Public fallback status. If an admin bearer token is present, returns the richer OAuth-aware status.

- `POST /api/sync/connect`
  - Requires Supabase admin session bearer token.
  - Body: `{ "provider": "google_drive" | "github" }`
  - Validates the connected provider account or server fallback.

- `POST /api/sync/run`
  - Requires Supabase admin session bearer token.
  - Body: `{ "mode": "drive_scan" | "drive_to_github_manifest" | "drive_to_github_files" }`
  - `drive_scan` reads Drive and returns counts.
  - `drive_to_github_manifest` writes `public/eadplataforma-drive-manifest.json` to GitHub.
  - `drive_to_github_files` downloads GitHub-eligible Drive files and commits them under `public/eadplataforma/`, also updating the manifest.

## Optional server fallbacks

The OAuth panel is the preferred path. These environment variables are still supported as fallback only:

- `GOOGLE_SERVICE_ACCOUNT_JSON` or `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`
- `GOOGLE_DRIVE_ROOT_FOLDER_ID`
- `GITHUB_TOKEN`
- `GITHUB_REPO`
- `GITHUB_BRANCH`
- `EAD_GITHUB_MAX_FILE_MB`
- `GOOGLE_DRIVE_SCAN_LIMIT`
- `EAD_GITHUB_SYNC_BATCH_SIZE`

## Storage strategy

- Google Drive remains the source of truth for EAD content and heavy media.
- GitHub stores cache-friendly files and the Drive manifest.
- Public EAD URLs remain under `/eadplataforma/...` so SCORM/HTML relative paths continue working.
