-- Add tenant contact information fields to maintenance_requests table
ALTER TABLE public.maintenance_requests 
ADD COLUMN IF NOT EXISTS tenant_phone TEXT,
ADD COLUMN IF NOT EXISTS tenant_address TEXT,
ADD COLUMN IF NOT EXISTS property_address TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_tenant_phone ON maintenance_requests(tenant_phone);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property_address ON maintenance_requests(property_address);
