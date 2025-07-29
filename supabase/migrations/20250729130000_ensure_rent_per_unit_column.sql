-- Ensure rent_per_unit column exists in properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS rent_per_unit DECIMAL(10,2);
