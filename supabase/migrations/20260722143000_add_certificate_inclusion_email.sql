CREATE TABLE IF NOT EXISTS public.email_smtp_settings (
  id TEXT PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  host TEXT NOT NULL DEFAULT '',
  port INTEGER NOT NULL DEFAULT 587,
  secure BOOLEAN NOT NULL DEFAULT false,
  username TEXT,
  password TEXT,
  from_name TEXT NOT NULL DEFAULT 'FAESDE',
  from_email TEXT,
  recipient_email TEXT NOT NULL DEFAULT 'secretaria@faesde.com',
  reply_to TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.certificate_inclusion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  certificate_received TEXT NOT NULL,
  course_name TEXT NOT NULL,
  completion_period TEXT NOT NULL,
  message TEXT NOT NULL,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  email_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_smtp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_inclusion_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read email smtp settings" ON public.email_smtp_settings;
CREATE POLICY "Admins can read email smtp settings"
ON public.email_smtp_settings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage email smtp settings" ON public.email_smtp_settings;
CREATE POLICY "Admins can manage email smtp settings"
ON public.email_smtp_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can request certificate inclusion" ON public.certificate_inclusion_requests;
CREATE POLICY "Anyone can request certificate inclusion"
ON public.certificate_inclusion_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read certificate inclusion requests" ON public.certificate_inclusion_requests;
CREATE POLICY "Admins can read certificate inclusion requests"
ON public.certificate_inclusion_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update certificate inclusion requests" ON public.certificate_inclusion_requests;
CREATE POLICY "Admins can update certificate inclusion requests"
ON public.certificate_inclusion_requests FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS update_email_smtp_settings_updated_at ON public.email_smtp_settings;
CREATE TRIGGER update_email_smtp_settings_updated_at
BEFORE UPDATE ON public.email_smtp_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_certificate_inclusion_requests_created_at
ON public.certificate_inclusion_requests(created_at DESC);
