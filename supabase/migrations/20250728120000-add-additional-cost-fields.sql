-- Add additional cost fields for completed tickets
ALTER TABLE maintenance_requests 
ADD COLUMN IF NOT EXISTS additional_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS additional_cost_description TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_completed_at ON maintenance_requests(completed_at);
