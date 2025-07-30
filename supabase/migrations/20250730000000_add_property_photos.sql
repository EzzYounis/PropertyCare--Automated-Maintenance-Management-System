-- Add photos column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.properties.photos IS 'Array of photo URLs for the property';
