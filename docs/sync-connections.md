# FAESDE sync connections

The admin route `/admin/conexoes` is the control panel for Drive, GitHub, SQL, and EADPlataforma sync status.

## Required backend secrets

Do not expose these values in React, Vite, or any public bundle.

- `GOOGLE_SERVICE_ACCOUNT_JSON`: Google service account JSON with access to the Drive folder.
- `GOOGLE_DRIVE_ROOT_FOLDER_ID`: root Drive folder id for EAD content.
- `GITHUB_TOKEN`: GitHub token with repo content write access.
- `GITHUB_REPO`: repository in `owner/name` format, for example `thenorm-br/faesde`.
- `GITHUB_BRANCH`: branch used by Coolify, normally `main`.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key for SQL export/import and sync item updates.

## Expected API endpoints

The admin page already calls these endpoints. They should be implemented server-side in the Coolify app or a secure API service.

- `POST /api/sync/connect`
  - Body: `{ "provider": "google_drive" | "github" | "sql" }`
  - Purpose: validate credentials and update `sync_connections`.

- `POST /api/sync/run`
  - Body: `{ "mode": "full" | "drive_to_github" | "github_to_drive" | "sql_export" | "sql_import", "runId": "uuid" }`
  - Purpose: execute or resume a sync run and update `sync_runs` plus `sync_items`.

## Storage strategy

- Google Drive is the source of truth for EAD content and heavy media.
- GitHub stores small, cache-friendly files for faster Coolify deployments.
- Large files and videos stay in Drive and should be delivered by a backend proxy with range support.
- Public EAD URLs must remain under `/eadplataforma/...` so SCORM/HTML relative paths continue working.

## SQL strategy

- Schema changes stay in `supabase/migrations`.
- SQL snapshots created in the admin page are stored in `sync_sql_snapshots`.
- Arbitrary SQL must not be executed from the browser. It should be validated and applied only by a secure backend/migration process.
