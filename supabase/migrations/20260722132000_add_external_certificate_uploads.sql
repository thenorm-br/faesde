ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'generated',
  ADD COLUMN IF NOT EXISTS external_file_path TEXT,
  ADD COLUMN IF NOT EXISTS external_file_name TEXT,
  ADD COLUMN IF NOT EXISTS external_file_size INTEGER,
  ADD COLUMN IF NOT EXISTS external_file_mime_type TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'certificates_source_type_check'
      AND conrelid = 'public.certificates'::regclass
  ) THEN
    ALTER TABLE public.certificates
      ADD CONSTRAINT certificates_source_type_check
      CHECK (source_type IN ('generated', 'external_pdf'));
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('certificate-files', 'certificate-files', true, 20971520, ARRAY['application/pdf']::text[])
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read access for certificate PDFs'
  ) THEN
    CREATE POLICY "Public read access for certificate PDFs"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'certificate-files');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can upload certificate PDFs'
  ) THEN
    CREATE POLICY "Admins can upload certificate PDFs"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'certificate-files' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can update certificate PDFs'
  ) THEN
    CREATE POLICY "Admins can update certificate PDFs"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'certificate-files' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can delete certificate PDFs'
  ) THEN
    CREATE POLICY "Admins can delete certificate PDFs"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'certificate-files' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;
