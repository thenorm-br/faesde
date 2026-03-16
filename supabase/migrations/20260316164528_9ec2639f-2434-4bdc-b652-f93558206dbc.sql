
CREATE TABLE public.promotional_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  theme_style text NOT NULL DEFAULT 'padrao',
  discount_percentage integer NOT NULL DEFAULT 0,
  coupon_code text,
  is_active boolean NOT NULL DEFAULT false,
  scheduled_months integer[] DEFAULT '{}',
  banner_title text,
  banner_subtitle text,
  banner_emoji text,
  banner_cta_text text DEFAULT 'Quero me matricular',
  banner_cta_emoji text,
  exit_popup_title text,
  exit_popup_subtitle text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promotional_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active themes" ON public.promotional_themes
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage themes" ON public.promotional_themes
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.promotional_themes (name, slug, theme_style, discount_percentage, coupon_code, is_active, scheduled_months, banner_title, banner_subtitle, banner_emoji, banner_cta_text, banner_cta_emoji, exit_popup_title, exit_popup_subtitle) VALUES
('Tema Padrão', 'padrao', 'padrao', 0, NULL, false, '{}', 'CURSOS TÉCNICOS', 'Invista no seu futuro profissional', NULL, 'Quero me matricular', NULL, 'Não perca essa oportunidade!', 'Transforme sua carreira com nossos cursos técnicos'),
('Tema de Natal', 'natal', 'natal', 30, 'FAESDE30', false, '{11,12}', 'CURSOS TÉCNICOS', 'Presente de Natal para sua carreira', '🎄', 'Quero me matricular', '🎅', 'Espere! 🎄🎅', 'Aproveite o desconto de Natal!'),
('Tema de Carnaval', 'carnaval', 'carnaval', 30, 'FAESDE30', true, '{1,2,3}', 'CURSOS TÉCNICOS', 'Invista no seu futuro', '🎭', 'Quero me matricular', '🎉', 'Espere! 🎭🎉', 'Não perca a oportunidade de transformar sua carreira!');
