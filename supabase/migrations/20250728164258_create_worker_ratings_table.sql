-- Create worker_ratings table to store individual ratings
CREATE TABLE public.worker_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  maintenance_request_id UUID NOT NULL REFERENCES public.maintenance_requests(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure one rating per tenant per maintenance request
  UNIQUE(maintenance_request_id, tenant_id)
);

-- Enable RLS on worker_ratings
ALTER TABLE public.worker_ratings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view ratings
CREATE POLICY "Authenticated users can view worker ratings"
  ON public.worker_ratings
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow tenants to create ratings for their own maintenance requests
CREATE POLICY "Tenants can create ratings for their own requests"
  ON public.worker_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

-- Allow tenants to update their own ratings
CREATE POLICY "Tenants can update their own ratings"
  ON public.worker_ratings
  FOR UPDATE
  USING (auth.uid() = tenant_id);

-- Function to calculate and update worker overall rating
CREATE OR REPLACE FUNCTION update_worker_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate the new average rating for the worker
  UPDATE public.workers 
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM public.worker_ratings 
    WHERE worker_id = COALESCE(NEW.worker_id, OLD.worker_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.worker_id, OLD.worker_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update worker rating when ratings are inserted, updated, or deleted
CREATE TRIGGER update_worker_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.worker_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_worker_rating();

-- Create index for better performance
CREATE INDEX idx_worker_ratings_worker_id ON public.worker_ratings(worker_id);
CREATE INDEX idx_worker_ratings_maintenance_request_id ON public.worker_ratings(maintenance_request_id);
