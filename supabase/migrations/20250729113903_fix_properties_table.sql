-- Fix properties table creation
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL, -- 'apartment', 'house', 'condo', 'townhouse'
  landlord_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  units INTEGER DEFAULT 1,
  rent_per_unit DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_property_type CHECK (type IN ('apartment', 'house', 'condo', 'townhouse')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'inactive'))
);

-- Create tenants table (extends profiles for tenant-specific data)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  landlord_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lease_start DATE,
  lease_end DATE,
  monthly_rent DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'pending'
  
  CONSTRAINT valid_tenant_status CHECK (status IN ('active', 'inactive', 'pending'))
);

-- Create landlords table (extends profiles for landlord-specific data)
CREATE TABLE IF NOT EXISTS public.landlords (
  id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  company TEXT,
  business_address TEXT,
  total_properties INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive'
  
  CONSTRAINT valid_landlord_status CHECK (status IN ('active', 'inactive'))
);

-- Add contact fields to profiles table if they don't exist
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN email TEXT;
  ALTER TABLE public.profiles ADD COLUMN phone TEXT;
  ALTER TABLE public.profiles ADD COLUMN address TEXT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landlords ENABLE ROW LEVEL SECURITY;

-- Create policies for properties table
CREATE POLICY "Agents can view all properties" ON public.properties
  FOR SELECT USING (auth.jwt() ->> 'role' = 'agent');

CREATE POLICY "Agents can create properties" ON public.properties
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'agent');

CREATE POLICY "Agents can update properties" ON public.properties
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'agent');

CREATE POLICY "Landlords can view their properties" ON public.properties
  FOR SELECT USING (landlord_id = auth.uid());

-- Create policies for tenants table
CREATE POLICY "Agents can view all tenants" ON public.tenants
  FOR SELECT USING (auth.jwt() ->> 'role' = 'agent');

CREATE POLICY "Agents can create tenants" ON public.tenants
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'agent');

CREATE POLICY "Agents can update tenants" ON public.tenants
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'agent');

CREATE POLICY "Tenants can view their own data" ON public.tenants
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Landlords can view their tenants" ON public.tenants
  FOR SELECT USING (landlord_id = auth.uid());

-- Create policies for landlords table
CREATE POLICY "Agents can view all landlords" ON public.landlords
  FOR SELECT USING (auth.jwt() ->> 'role' = 'agent');

CREATE POLICY "Agents can create landlords" ON public.landlords
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'agent');

CREATE POLICY "Agents can update landlords" ON public.landlords
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'agent');

CREATE POLICY "Landlords can view their own data" ON public.landlords
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Landlords can update their own data" ON public.landlords
  FOR UPDATE USING (id = auth.uid());
