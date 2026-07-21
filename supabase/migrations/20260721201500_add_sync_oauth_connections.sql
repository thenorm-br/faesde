-- Store OAuth app settings and connected accounts for the EAD sync panel.
-- Tokens are admin-only through RLS. A server-side encryption secret can be added later.

CREATE TABLE IF NOT EXISTS public.sync_oauth_app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE CHECK (provider IN ('google_drive', 'github')),
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  redirect_uri TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sync_oauth_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE CHECK (provider IN ('google_drive', 'github')),
  account_id TEXT,
  account_label TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT,
  scope TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'connected',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  connected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_checked_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sync_oauth_states (
  state_token TEXT PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('google_drive', 'github')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_verifier TEXT,
  return_to TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  consumed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sync_oauth_app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_oauth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_oauth_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read sync oauth app settings" ON public.sync_oauth_app_settings;
CREATE POLICY "Admins can read sync oauth app settings"
ON public.sync_oauth_app_settings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage sync oauth app settings" ON public.sync_oauth_app_settings;
CREATE POLICY "Admins can manage sync oauth app settings"
ON public.sync_oauth_app_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can read sync oauth connections" ON public.sync_oauth_connections;
CREATE POLICY "Admins can read sync oauth connections"
ON public.sync_oauth_connections FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage sync oauth connections" ON public.sync_oauth_connections;
CREATE POLICY "Admins can manage sync oauth connections"
ON public.sync_oauth_connections FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can read sync oauth states" ON public.sync_oauth_states;
CREATE POLICY "Admins can read sync oauth states"
ON public.sync_oauth_states FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage sync oauth states" ON public.sync_oauth_states;
CREATE POLICY "Admins can manage sync oauth states"
ON public.sync_oauth_states FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS update_sync_oauth_app_settings_updated_at ON public.sync_oauth_app_settings;
CREATE TRIGGER update_sync_oauth_app_settings_updated_at
BEFORE UPDATE ON public.sync_oauth_app_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sync_oauth_connections_updated_at ON public.sync_oauth_connections;
CREATE TRIGGER update_sync_oauth_connections_updated_at
BEFORE UPDATE ON public.sync_oauth_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_sync_oauth_states_user_provider
ON public.sync_oauth_states(user_id, provider, expires_at DESC);
