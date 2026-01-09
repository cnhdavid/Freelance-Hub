-- Fix RLS Policies for Projects Table
-- Run this in your Supabase SQL Editor to ensure authenticated users can insert and select projects

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

-- Recreate policies with proper permissions
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Verify RLS is enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Optional: Check if policies are active
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'projects';
