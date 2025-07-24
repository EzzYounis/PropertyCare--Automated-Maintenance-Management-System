-- Update RLS policies to work with custom authentication
-- Since we're not using Supabase auth, we need to disable RLS for now
-- and rely on application-level security

-- Temporarily disable RLS on maintenance_requests
ALTER TABLE public.maintenance_requests DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "All authenticated users can update maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "All authenticated users can view maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Tenants can create their own maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Tenants can update their own maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Tenants can view their own maintenance requests" ON public.maintenance_requests;