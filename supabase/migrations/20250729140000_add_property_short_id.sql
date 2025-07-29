-- Add short_id column to properties table for user-friendly IDs
ALTER TABLE public.properties 
ADD COLUMN short_id TEXT UNIQUE;

-- Create a function to generate short property IDs
CREATE OR REPLACE FUNCTION generate_property_short_id() 
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    done BOOL;
BEGIN
    done := FALSE;
    WHILE NOT done LOOP
        -- Generate a 6-character alphanumeric ID (P + 5 characters)
        new_id := 'P' || upper(substr(md5(random()::text), 1, 5));
        
        -- Check if this ID already exists
        IF NOT EXISTS (SELECT 1 FROM public.properties WHERE short_id = new_id) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate short_id on insert
CREATE OR REPLACE FUNCTION set_property_short_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.short_id IS NULL THEN
        NEW.short_id := generate_property_short_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_set_property_short_id ON public.properties;
CREATE TRIGGER trigger_set_property_short_id
    BEFORE INSERT ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION set_property_short_id();

-- Generate short_ids for existing properties
UPDATE public.properties 
SET short_id = generate_property_short_id() 
WHERE short_id IS NULL;

-- Add an index for better performance on short_id lookups
CREATE INDEX IF NOT EXISTS idx_properties_short_id ON public.properties(short_id);
