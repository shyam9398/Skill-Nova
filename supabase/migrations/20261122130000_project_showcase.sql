-- ============================================================================
-- Migration: SkillNova Project Showcase Management
-- Description: Creates projects table, indexes, RLS policies, and storage bucket
-- Date: 2026-11-22
-- ============================================================================

-- 1. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  project_url TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes for efficient filtering and sorting
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Public visitors can only view published projects
DROP POLICY IF EXISTS "Public visitors can only view published projects" ON public.projects;
CREATE POLICY "Public visitors can only view published projects"
  ON public.projects
  FOR SELECT
  TO public
  USING (status = 'published');

-- 5. RLS Policy: Admins and sub-admins can view all projects (draft and published)
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
CREATE POLICY "Admins can view all projects"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'sub_admin')
    )
    OR auth.role() = 'service_role'
  );

-- 6. RLS Policy: Admins can insert projects
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
CREATE POLICY "Admins can insert projects"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'sub_admin')
    )
    OR auth.role() = 'service_role'
  );

-- 7. RLS Policy: Admins can update projects
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
CREATE POLICY "Admins can update projects"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'sub_admin')
    )
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'sub_admin')
    )
    OR auth.role() = 'service_role'
  );

-- 8. RLS Policy: Admins can delete projects
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
CREATE POLICY "Admins can delete projects"
  ON public.projects
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'sub_admin')
    )
    OR auth.role() = 'service_role'
  );

-- 9. Storage bucket for project images (if storage schema exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('project-showcase', 'project-showcase', true)
    ON CONFLICT (id) DO NOTHING;

    -- Public read policy for storage
    DROP POLICY IF EXISTS "Public read project showcase images" ON storage.objects;
    CREATE POLICY "Public read project showcase images"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'project-showcase');

    -- Admin write policy for storage
    DROP POLICY IF EXISTS "Admins can upload project showcase images" ON storage.objects;
    CREATE POLICY "Admins can upload project showcase images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'project-showcase'
        AND (
          EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('admin', 'sub_admin')
          )
          OR auth.role() = 'service_role'
        )
      );

    DROP POLICY IF EXISTS "Admins can delete project showcase images" ON storage.objects;
    CREATE POLICY "Admins can delete project showcase images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'project-showcase'
        AND (
          EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('admin', 'sub_admin')
          )
          OR auth.role() = 'service_role'
        )
      );
  END IF;
END $$;

