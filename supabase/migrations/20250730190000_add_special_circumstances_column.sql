-- Add special_circumstances column to maintenance_requests table
ALTER TABLE public.maintenance_requests 
ADD COLUMN special_circumstances TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN public.maintenance_requests.special_circumstances IS 'Special circumstances or warnings for the maintenance visit (e.g., pregnant resident, baby in house, etc.)';
