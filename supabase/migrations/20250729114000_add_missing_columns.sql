-- Add missing columns to properties table
DO $$ BEGIN
  -- Add units column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'properties' 
                 AND column_name = 'units') THEN
    ALTER TABLE public.properties ADD COLUMN units INTEGER DEFAULT 1;
  END IF;
  
  -- Add rent_per_unit column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'properties' 
                 AND column_name = 'rent_per_unit') THEN
    ALTER TABLE public.properties ADD COLUMN rent_per_unit DECIMAL(10,2);
  END IF;
  
  -- Add type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'properties' 
                 AND column_name = 'type') THEN
    ALTER TABLE public.properties ADD COLUMN type TEXT NOT NULL DEFAULT 'apartment';
  END IF;
  
  -- Add landlord_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'properties' 
                 AND column_name = 'landlord_id') THEN
    ALTER TABLE public.properties ADD COLUMN landlord_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  
  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'properties' 
                 AND column_name = 'status') THEN
    ALTER TABLE public.properties ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
  END IF;
END $$;

-- Add constraints if they don't exist
DO $$ BEGIN
  -- Add type constraint
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE table_schema = 'public' 
                 AND table_name = 'properties' 
                 AND constraint_name = 'valid_property_type') THEN
    ALTER TABLE public.properties ADD CONSTRAINT valid_property_type CHECK (type IN ('apartment', 'house', 'condo', 'townhouse'));
  END IF;
  
  -- Add status constraint
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE table_schema = 'public' 
                 AND table_name = 'properties' 
                 AND constraint_name = 'valid_status') THEN
    ALTER TABLE public.properties ADD CONSTRAINT valid_status CHECK (status IN ('active', 'inactive'));
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Continue if constraints already exist
    NULL;
END $$;
