
INSERT INTO storage.buckets (id, name, public) VALUES ('course-images', 'course-images', true);

CREATE POLICY "Public read access for course images"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-images');

CREATE POLICY "Admins can upload course images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update course images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'course-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete course images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-images' AND has_role(auth.uid(), 'admin'::app_role));
