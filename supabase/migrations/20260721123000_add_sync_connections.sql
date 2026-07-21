CREATE TABLE IF NOT EXISTS public.sync_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_root_folder_id TEXT NOT NULL DEFAULT '1jYFYbdJdJHT-f7BpzFX9t1mQLD6xwgbd',
  github_repo TEXT NOT NULL DEFAULT 'thenorm-br/faesde',
  github_branch TEXT NOT NULL DEFAULT 'main',
  public_base_path TEXT NOT NULL DEFAULT '/eadplataforma',
  local_public_path TEXT NOT NULL DEFAULT 'public/eadplataforma',
  max_github_file_mb INTEGER NOT NULL DEFAULT 25 CHECK (max_github_file_mb BETWEEN 1 AND 99),
  excluded_extensions TEXT[] NOT NULL DEFAULT ARRAY['mp4', 'mov', 'avi', 'mkv', 'zip', 'rar', '7z'],
  include_extensions TEXT[] NOT NULL DEFAULT ARRAY[
    'html', 'htm', 'css', 'js', 'json', 'xml', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'pdf', 'woff', 'woff2', 'ttf'
  ],
  sync_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_sync_interval_minutes INTEGER NOT NULL DEFAULT 60 CHECK (auto_sync_interval_minutes >= 5),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS sync_settings_singleton_idx ON public.sync_settings ((true));

CREATE TABLE IF NOT EXISTS public.sync_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE CHECK (provider IN ('google_drive', 'github', 'sql')),
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'pending', 'connected', 'error')),
  display_name TEXT NOT NULL,
  external_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  connected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  connected_by_email TEXT,
  connected_at TIMESTAMP WITH TIME ZONE,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL CHECK (mode IN ('full', 'drive_to_github', 'github_to_drive', 'site_upload', 'sql_export', 'sql_import')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'success', 'partial', 'failed')),
  source_provider TEXT,
  target_provider TEXT,
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_by_email TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  total_files INTEGER NOT NULL DEFAULT 0,
  synced_files INTEGER NOT NULL DEFAULT 0,
  skipped_files INTEGER NOT NULL DEFAULT 0,
  failed_files INTEGER NOT NULL DEFAULT 0,
  total_bytes BIGINT NOT NULL DEFAULT 0,
  cached_bytes BIGINT NOT NULL DEFAULT 0,
  large_files INTEGER NOT NULL DEFAULT 0,
  folders INTEGER NOT NULL DEFAULT 0,
  progress_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  commit_sha TEXT,
  drive_folder_id TEXT,
  github_repo TEXT,
  error_message TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sync_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  extension TEXT,
  mime_type TEXT,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  drive_file_id TEXT,
  drive_parent_id TEXT,
  drive_modified_at TIMESTAMP WITH TIME ZONE,
  github_path TEXT,
  github_sha TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  source TEXT NOT NULL DEFAULT 'drive' CHECK (source IN ('drive', 'github', 'site', 'manual')),
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'skipped', 'failed', 'conflict')),
  storage_target TEXT NOT NULL DEFAULT 'pending' CHECK (storage_target IN ('github', 'drive_proxy', 'both', 'ignored', 'pending')),
  is_large BOOLEAN NOT NULL DEFAULT false,
  checksum TEXT,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sync_sql_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'migration' CHECK (kind IN ('export', 'import', 'migration', 'seed')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'success', 'partial', 'failed')),
  table_names TEXT[],
  file_path TEXT,
  drive_file_id TEXT,
  github_path TEXT,
  checksum TEXT,
  sql_content TEXT,
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_by_email TEXT,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  applied_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sync_runs_status_idx ON public.sync_runs (status, started_at DESC);
CREATE INDEX IF NOT EXISTS sync_items_drive_file_id_idx ON public.sync_items (drive_file_id);
CREATE INDEX IF NOT EXISTS sync_items_sync_status_idx ON public.sync_items (sync_status);
CREATE INDEX IF NOT EXISTS sync_items_storage_target_idx ON public.sync_items (storage_target);
CREATE INDEX IF NOT EXISTS sync_sql_snapshots_status_idx ON public.sync_sql_snapshots (status, generated_at DESC);

CREATE TRIGGER update_sync_settings_updated_at
BEFORE UPDATE ON public.sync_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sync_connections_updated_at
BEFORE UPDATE ON public.sync_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sync_runs_updated_at
BEFORE UPDATE ON public.sync_runs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sync_items_updated_at
BEFORE UPDATE ON public.sync_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sync_sql_snapshots_updated_at
BEFORE UPDATE ON public.sync_sql_snapshots
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.sync_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_sql_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read sync settings"
ON public.sync_settings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert sync settings"
ON public.sync_settings FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sync settings"
ON public.sync_settings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read sync connections"
ON public.sync_connections FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert sync connections"
ON public.sync_connections FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sync connections"
ON public.sync_connections FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read sync runs"
ON public.sync_runs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert sync runs"
ON public.sync_runs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sync runs"
ON public.sync_runs FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read sync items"
ON public.sync_items FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert sync items"
ON public.sync_items FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sync items"
ON public.sync_items FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sync items"
ON public.sync_items FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read sync sql snapshots"
ON public.sync_sql_snapshots FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert sync sql snapshots"
ON public.sync_sql_snapshots FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update sync sql snapshots"
ON public.sync_sql_snapshots FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.sync_settings (
  drive_root_folder_id,
  github_repo,
  github_branch,
  public_base_path,
  local_public_path
)
SELECT
  '1jYFYbdJdJHT-f7BpzFX9t1mQLD6xwgbd',
  'thenorm-br/faesde',
  'main',
  '/eadplataforma',
  'public/eadplataforma'
WHERE NOT EXISTS (SELECT 1 FROM public.sync_settings);

INSERT INTO public.sync_connections (provider, display_name, status, metadata)
VALUES
  ('google_drive', 'Google Drive', 'pending', '{"requiredSecrets":["GOOGLE_SERVICE_ACCOUNT_JSON","GOOGLE_DRIVE_ROOT_FOLDER_ID"]}'::jsonb),
  ('github', 'GitHub', 'pending', '{"requiredSecrets":["GITHUB_TOKEN","GITHUB_REPO","GITHUB_BRANCH"]}'::jsonb),
  ('sql', 'SQL', 'pending', '{"requiredSecrets":["SUPABASE_SERVICE_ROLE_KEY"]}'::jsonb)
ON CONFLICT (provider) DO NOTHING;
