-- Temporarily disable RLS on profiles table to fix infinite recursion
-- This is a development fix - in production you'd want proper RLS policies

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Agents can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Agents can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles during signup" ON public.profiles;

-- Disable RLS on profiles table for now
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Note: This allows unrestricted access to profiles table
-- In a production environment, you would implement proper RLS policies
-- that don't cause infinite recursion
