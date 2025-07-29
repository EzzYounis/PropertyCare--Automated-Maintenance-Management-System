-- Drop tenant and landlord tables and use profiles table for all user types
-- This simplifies the schema and allows agents to create accounts with passwords

-- Drop existing tables
DROP TABLE IF EXISTS public.tenants CASCADE;
DROP TABLE IF EXISTS public.landlords CASCADE;

-- Drop existing triggers and functions related to landlord totals
DROP TRIGGER IF EXISTS properties_update_landlord_totals ON public.properties;
DROP FUNCTION IF EXISTS update_landlord_totals();

-- Add additional fields to profiles table for tenant and landlord specific data
DO $$ BEGIN
  -- Tenant specific fields
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS landlord_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lease_start DATE;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lease_end DATE;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_rent DECIMAL(10,2);
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deposit_paid DECIMAL(10,2);
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_status TEXT DEFAULT 'active';
  
  -- Landlord specific fields
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_email TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_phone TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_address TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS license_number TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_properties INTEGER DEFAULT 0;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(12,2) DEFAULT 0;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_payment_method TEXT;
  
  -- General status field for all user types
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Add check constraints for status fields
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT valid_tenant_status 
    CHECK (role != 'tenant' OR tenant_status IN ('active', 'inactive', 'pending'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT valid_status 
    CHECK (status IN ('active', 'inactive', 'pending'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_property_id ON public.profiles(property_id);
CREATE INDEX IF NOT EXISTS idx_profiles_landlord_id ON public.profiles(landlord_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_status ON public.profiles(tenant_status);

-- Update RLS policies for the unified profiles table
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Agents can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Agents can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles during signup" ON public.profiles;

-- Temporarily disable RLS on profiles for development
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Note: In production, you would create proper RLS policies that allow:
-- 1. Users to view/update their own profiles
-- 2. Agents to view/manage all profiles  
-- 3. Landlords to view their tenants' profiles
-- 4. Public signup for new profiles
