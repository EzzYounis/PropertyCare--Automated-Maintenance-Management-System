-- Add completion and additional cost fields to maintenance_requests table
-- These fields are needed for the issue completion functionality

-- Add additional_cost column (used when completing issues with extra costs)
ALTER TABLE public.maintenance_requests 
ADD COLUMN IF NOT EXISTS additional_cost DECIMAL(10,2);

-- Add additional_cost_description column (to explain any extra charges)
ALTER TABLE public.maintenance_requests 
ADD COLUMN IF NOT EXISTS additional_cost_description TEXT;

-- Add completion_notes column (for worker completion notes)
ALTER TABLE public.maintenance_requests 
ADD COLUMN IF NOT EXISTS completion_notes TEXT;

-- Ensure we have the completed_at timestamp column (might already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'maintenance_requests' 
                   AND column_name = 'additional_cost') THEN
        ALTER TABLE public.maintenance_requests ADD COLUMN additional_cost DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'maintenance_requests' 
                   AND column_name = 'additional_cost_description') THEN
        ALTER TABLE public.maintenance_requests ADD COLUMN additional_cost_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'maintenance_requests' 
                   AND column_name = 'completion_notes') THEN
        ALTER TABLE public.maintenance_requests ADD COLUMN completion_notes TEXT;
    END IF;
END $$;
