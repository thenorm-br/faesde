ALTER TABLE public.certificate_inclusion_requests
  ADD COLUMN IF NOT EXISTS document_path TEXT,
  ADD COLUMN IF NOT EXISTS document_name TEXT,
  ADD COLUMN IF NOT EXISTS document_size INTEGER,
  ADD COLUMN IF NOT EXISTS document_mime_type TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificate-request-files',
  'certificate-request-files',
  false,
  20971520,
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Anyone can upload certificate request PDFs" ON storage.objects;
CREATE POLICY "Anyone can upload certificate request PDFs"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'certificate-request-files'
  AND storage.extension(name) = 'pdf'
);

DROP POLICY IF EXISTS "Admins can read certificate request PDFs" ON storage.objects;
CREATE POLICY "Admins can read certificate request PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'certificate-request-files'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admins can delete certificate request PDFs" ON storage.objects;
CREATE POLICY "Admins can delete certificate request PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'certificate-request-files'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);
