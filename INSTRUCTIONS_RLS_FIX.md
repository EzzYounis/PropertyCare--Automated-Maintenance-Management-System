# Fix Row Level Security (RLS) Issue

## Problem
The tenant creation is failing because Row Level Security (RLS) is enabled on the profiles table and blocking profile creation with the error:
```
Error: Failed to create tenant profile: new row violates row-level security policy for table "profiles"
```

## Solution: Disable RLS Temporarily

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com
2. Sign in to your account
3. Navigate to your PropertyCare project

### Step 2: Open SQL Editor
1. Click on "SQL Editor" in the left sidebar
2. Click "New Query"

### Step 3: Run the RLS Fix Script
Copy and paste the following SQL script and click "Run":

```sql
-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Agents can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Agents can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles during signup" ON public.profiles;

-- Disable RLS on profiles table temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

### Step 4: Verify RLS is Disabled
Run this query to confirm RLS is disabled:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';
```

The `rowsecurity` column should show `f` (false).

### Step 5: Test Tenant Creation
After running the script, try creating a tenant again in your application.

## Alternative: Proper RLS Policies (For Production)

If you want to keep RLS enabled, you can create proper policies instead:

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own profiles
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to view their own profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profiles
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow agents to manage all profiles
CREATE POLICY "Agents can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'agent'
    )
  );
```

## Recommendation
For development, use the first solution (disable RLS). For production, implement proper RLS policies.
