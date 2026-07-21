# FAESDE Drive/GitHub sync

The admin route `/admin/conexoes` validates the Google Drive and GitHub connections through server-side API endpoints.

SQL redundancy is intentionally postponed. Do not add database sync logic here until that second stage is approved.

## Runtime

Production must run the Node server:

```bash
npm run start
```

The server serves `dist/` and exposes the sync API under `/api/sync/*`.

## Required backend secrets

Never expose these values in React, Vite, or any public bundle.

- `GOOGLE_SERVICE_ACCOUNT_JSON`: Google service account JSON with access to the Drive folder.
- `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`: optional alternative to the JSON string above.
- `GOOGLE_DRIVE_ROOT_FOLDER_ID`: root Drive folder id for EAD content.
- `GITHUB_TOKEN`: GitHub token with repository content write access.
- `GITHUB_REPO`: repository in `owner/name` format, default `thenorm-br/faesde`.
- `GITHUB_BRANCH`: branch used by Coolify, default `main`.
- `EAD_GITHUB_MAX_FILE_MB`: max size for GitHub-cacheable files, default `25`.
- `GOOGLE_DRIVE_SCAN_LIMIT`: max Drive items per scan, default `5000`.

## API endpoints

- `GET /api/health`
  - Public health check for the Node server.

- `GET /api/sync/status`
  - Requires Supabase admin session bearer token.
  - Returns configured providers and required secret names.

- `POST /api/sync/connect`
  - Requires Supabase admin session bearer token.
  - Body: `{ "provider": "google_drive" | "github" }`
  - Validates the provider against Google Drive or GitHub.

- `POST /api/sync/run`
  - Requires Supabase admin session bearer token.
  - Body: `{ "mode": "drive_scan" | "drive_to_github_manifest" }`
  - `drive_scan` reads Drive and returns counts.
  - `drive_to_github_manifest` writes `public/eadplataforma-drive-manifest.json` to GitHub.

## Storage strategy

- Google Drive remains the source of truth for EAD content and heavy media.
- GitHub stores cache-friendly files and the Drive manifest.
- Public EAD URLs remain under `/eadplataforma/...` so SCORM/HTML relative paths continue working.
