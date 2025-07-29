-- Update property status constraint to allow more meaningful statuses
-- for property management (occupied, available, maintenance, etc.)

-- Drop the existing constraint
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS valid_status;

-- Add new constraint with property management specific statuses
ALTER TABLE public.properties ADD CONSTRAINT valid_status 
  CHECK (status IN ('active', 'inactive', 'occupied', 'available', 'maintenance', 'under_renovation'));

-- Update any existing 'active' properties to 'available' if they don't have tenants
-- and 'occupied' if they do have tenants
DO $$
DECLARE
    prop_record RECORD;
    tenant_count INTEGER;
BEGIN
    -- Loop through all properties with 'active' status
    FOR prop_record IN 
        SELECT id FROM properties WHERE status = 'active'
    LOOP
        -- Check if this property has tenants
        SELECT COUNT(*) INTO tenant_count
        FROM profiles 
        WHERE property_id = prop_record.id 
        AND role = 'tenant' 
        AND (tenant_status = 'active' OR tenant_status IS NULL);
        
        -- Update status based on tenant assignment
        IF tenant_count > 0 THEN
            UPDATE properties SET status = 'occupied' WHERE id = prop_record.id;
        ELSE
            UPDATE properties SET status = 'available' WHERE id = prop_record.id;
        END IF;
    END LOOP;
END $$;
