-- Create maintenance requests table
CREATE TABLE public.maintenance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'submitted',
  room TEXT,
  photos TEXT[], -- Array of photo URLs
  quick_fixes TEXT[], -- Array of applied quick fixes
  preferred_time_slots TEXT[], -- Array of preferred time slots
  preferred_date DATE,
  agent_notes TEXT,
  landlord_notes TEXT,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  assigned_worker_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for different user roles
-- Tenants can view and create their own requests
CREATE POLICY "Tenants can view their own maintenance requests" 
ON public.maintenance_requests 
FOR SELECT 
USING (auth.uid() = tenant_id);

CREATE POLICY "Tenants can create their own maintenance requests" 
ON public.maintenance_requests 
FOR INSERT 
WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Tenants can update their own maintenance requests" 
ON public.maintenance_requests 
FOR UPDATE 
USING (auth.uid() = tenant_id);

-- For now, allow all authenticated users to see all requests (agents and landlords)
-- In a real app, you'd have proper role-based access control
CREATE POLICY "All authenticated users can view maintenance requests" 
ON public.maintenance_requests 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "All authenticated users can update maintenance requests" 
ON public.maintenance_requests 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_maintenance_requests_updated_at
BEFORE UPDATE ON public.maintenance_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();