
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE CHECK (code ~ '^[0-9]{24}$'),
  student_name TEXT NOT NULL,
  cpf TEXT,
  course_name TEXT NOT NULL,
  course_slug TEXT,
  content TEXT,
  hours INTEGER NOT NULL DEFAULT 0,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  book_number TEXT,
  page_number TEXT,
  institution TEXT DEFAULT 'FAESDE',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.certificates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active certificates"
  ON public.certificates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all certificates"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert certificates"
  ON public.certificates FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update certificates"
  ON public.certificates FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete certificates"
  ON public.certificates FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER certificates_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_certificates_code ON public.certificates(code);
