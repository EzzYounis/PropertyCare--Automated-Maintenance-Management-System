-- Add missing quote-related fields to maintenance_requests table
-- These fields are needed for the quote submission and worker assignment functionality

-- Add estimated_time column (used in quote submissions)
ALTER TABLE public.maintenance_requests 
ADD COLUMN IF NOT EXISTS estimated_time TEXT;

-- Add quote_description column (used to store detailed work descriptions)
ALTER TABLE public.maintenance_requests 
ADD COLUMN IF NOT EXISTS quote_description TEXT;

-- Add any other missing fields that might be needed for re-assignment
-- (checking if they already exist to avoid conflicts)
DO $$ 
BEGIN
    -- Check if columns exist before adding
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'maintenance_requests' 
                   AND column_name = 'estimated_time') THEN
        ALTER TABLE public.maintenance_requests ADD COLUMN estimated_time TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'maintenance_requests' 
                   AND column_name = 'quote_description') THEN
        ALTER TABLE public.maintenance_requests ADD COLUMN quote_description TEXT;
    END IF;
END $$;
