-- Create audit log table for course edits
CREATE TABLE public.course_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL,
  changed_fields JSONB,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_course_audit_log_course_id ON public.course_audit_log(course_id);
CREATE INDEX idx_course_audit_log_created_at ON public.course_audit_log(created_at DESC);

ALTER TABLE public.course_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit logs"
ON public.course_audit_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert audit logs"
ON public.course_audit_log
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));