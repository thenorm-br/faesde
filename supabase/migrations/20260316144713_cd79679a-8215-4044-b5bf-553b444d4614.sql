-- Criar tabela para mapeamento de usernames para admins
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL UNIQUE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can read admin_settings"
    ON public.admin_settings
    FOR SELECT
    TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage admin_settings"
    ON public.admin_settings
    FOR ALL
    TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Inserir mapeamento username "admin" -> usuário atual
INSERT INTO public.admin_settings (username, user_id)
SELECT 'admin', user_id
FROM public.user_roles
WHERE role = 'admin'::app_role
LIMIT 1
ON CONFLICT (username) DO NOTHING;

-- Função para buscar email por username
CREATE OR REPLACE FUNCTION public.get_email_by_username(_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT u.email
    FROM auth.users u
    JOIN public.admin_settings a ON u.id = a.user_id
    WHERE a.username = _username;
$$;