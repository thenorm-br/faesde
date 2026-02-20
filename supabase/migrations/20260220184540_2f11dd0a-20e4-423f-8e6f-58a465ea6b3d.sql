
-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  about_course TEXT,
  category TEXT NOT NULL DEFAULT 'tecnico',
  original_price TEXT,
  promo_price TEXT,
  installment TEXT,
  hours INTEGER,
  duration_range TEXT,
  certification TEXT,
  rating NUMERIC DEFAULT 5.0,
  image_url TEXT,
  banner_image_url TEXT,
  youtube_video_id TEXT,
  registration_portaria TEXT,
  registration_parecer TEXT,
  registration_approved_date TEXT,
  registration_register_with TEXT,
  how_it_works TEXT[],
  profession TEXT,
  market TEXT,
  methodology_materials TEXT[],
  methodology_services TEXT[],
  methodology_response_time TEXT,
  requirements TEXT[],
  tutoring TEXT,
  tutor_attributes TEXT[],
  modules JSONB,
  access_items JSONB,
  faq JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Courses RLS: anyone can read active courses
CREATE POLICY "Anyone can read active courses"
ON public.courses FOR SELECT
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

-- Courses RLS: admins can insert
CREATE POLICY "Admins can insert courses"
ON public.courses FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Courses RLS: admins can update
CREATE POLICY "Admins can update courses"
ON public.courses FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Courses RLS: admins can delete
CREATE POLICY "Admins can delete courses"
ON public.courses FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- User roles RLS: only admins can read
CREATE POLICY "Admins can read roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
