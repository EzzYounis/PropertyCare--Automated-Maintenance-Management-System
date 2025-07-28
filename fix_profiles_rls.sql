-- Run this script in your Supabase SQL Editor to fix the infinite recursion issue

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Agents can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Agents can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles during signup" ON public.profiles;

-- Disable RLS on profiles table temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- This will allow your app to work without RLS restrictions on profiles
-- You can re-enable RLS later with proper policies if needed
