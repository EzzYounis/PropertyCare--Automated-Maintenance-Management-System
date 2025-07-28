-- Add completion related fields to maintenance_requests table

-- Add additional cost fields
ALTER TABLE maintenance_requests 
ADD COLUMN IF NOT EXISTS additional_cost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS additional_cost_description TEXT;

-- Update completed_at column to be more explicit (if not already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'maintenance_requests' 
                   AND column_name = 'completed_at') THEN
        ALTER TABLE maintenance_requests ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add index for performance on completed_at and status
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_completed_at ON maintenance_requests(completed_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status_completed ON maintenance_requests(status) WHERE status = 'completed';
