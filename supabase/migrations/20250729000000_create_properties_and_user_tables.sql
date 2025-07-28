-- Create properties table
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

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_properties_landlord_id ON public.properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON public.tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_landlord_id ON public.tenants(landlord_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Enable RLS on tables (safe to run multiple times)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landlords ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Anyone can view properties" ON public.properties;
DROP POLICY IF EXISTS "Landlords can manage their properties" ON public.properties;
DROP POLICY IF EXISTS "Agents can manage all properties" ON public.properties;
DROP POLICY IF EXISTS "Anyone can view tenants" ON public.tenants;
DROP POLICY IF EXISTS "Agents can manage all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Landlords can view their tenants" ON public.tenants;
DROP POLICY IF EXISTS "Anyone can view landlords" ON public.landlords;
DROP POLICY IF EXISTS "Agents can manage all landlords" ON public.landlords;
DROP POLICY IF EXISTS "Landlords can update their own data" ON public.landlords;

-- Create policies for properties
CREATE POLICY "Anyone can view properties" 
ON public.properties 
FOR SELECT 
USING (true);

CREATE POLICY "Landlords can manage their properties" 
ON public.properties 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'landlord'
  )
);

CREATE POLICY "Agents can manage all properties" 
ON public.properties 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'agent'
  )
);

-- Create policies for tenants
CREATE POLICY "Anyone can view tenants" 
ON public.tenants 
FOR SELECT 
USING (true);

CREATE POLICY "Agents can manage all tenants" 
ON public.tenants 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'agent'
  )
);

CREATE POLICY "Landlords can view their tenants" 
ON public.tenants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'landlord'
    AND landlord_id = auth.uid()
  )
);

-- Create policies for landlords
CREATE POLICY "Anyone can view landlords" 
ON public.landlords 
FOR SELECT 
USING (true);

CREATE POLICY "Agents can manage all landlords" 
ON public.landlords 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'agent'
  )
);

CREATE POLICY "Landlords can update their own data" 
ON public.landlords 
FOR UPDATE 
USING (id = auth.uid());

-- Create functions to update computed fields
CREATE OR REPLACE FUNCTION update_landlord_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_properties and total_revenue for landlord
  UPDATE public.landlords 
  SET 
    total_properties = (
      SELECT COUNT(*) 
      FROM public.properties 
      WHERE landlord_id = NEW.landlord_id
    ),
    total_revenue = (
      SELECT COALESCE(SUM(rent_per_unit * units), 0) 
      FROM public.properties 
      WHERE landlord_id = NEW.landlord_id
    )
  WHERE id = NEW.landlord_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS properties_update_landlord_totals ON public.properties;
CREATE TRIGGER properties_update_landlord_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION update_landlord_totals();
