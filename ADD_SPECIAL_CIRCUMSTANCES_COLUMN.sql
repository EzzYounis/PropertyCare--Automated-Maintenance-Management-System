-- Execute this SQL in the Supabase Dashboard > SQL Editor to add the special_circumstances column

-- Add special_circumstances column to maintenance_requests table
ALTER TABLE public.maintenance_requests 
ADD COLUMN IF NOT EXISTS special_circumstances TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN public.maintenance_requests.special_circumstances 
IS 'Special circumstances or warnings for the maintenance visit (e.g., pregnant resident, baby in house, etc.)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'maintenance_requests' 
AND column_name = 'special_circumstances';
