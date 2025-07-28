-- Modify worker_ratings table to support both tenant and agent ratings

-- Add rater_type column to distinguish between tenant and agent ratings
ALTER TABLE public.worker_ratings 
ADD COLUMN rater_type TEXT NOT NULL DEFAULT 'tenant' CHECK (rater_type IN ('tenant', 'agent'));

-- Rename tenant_id to rater_id for clarity
ALTER TABLE public.worker_ratings 
RENAME COLUMN tenant_id TO rater_id;

-- Drop the old unique constraint
ALTER TABLE public.worker_ratings 
DROP CONSTRAINT worker_ratings_maintenance_request_id_tenant_id_key;

-- Add new unique constraint allowing both tenant and agent to rate the same maintenance request
ALTER TABLE public.worker_ratings 
ADD CONSTRAINT worker_ratings_unique_rating 
UNIQUE(maintenance_request_id, rater_id, rater_type);

-- Update RLS policies to include agents

-- Drop old policies
DROP POLICY "Tenants can create ratings for their own requests" ON public.worker_ratings;
DROP POLICY "Tenants can update their own ratings" ON public.worker_ratings;

-- Create new policies for both tenants and agents
CREATE POLICY "Tenants can create ratings for their own requests"
  ON public.worker_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = rater_id AND rater_type = 'tenant');

CREATE POLICY "Agents can create ratings for maintenance requests"
  ON public.worker_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = rater_id AND rater_type = 'agent');

CREATE POLICY "Tenants can update their own ratings"
  ON public.worker_ratings
  FOR UPDATE
  USING (auth.uid() = rater_id AND rater_type = 'tenant');

CREATE POLICY "Agents can update their own ratings"
  ON public.worker_ratings
  FOR UPDATE
  USING (auth.uid() = rater_id AND rater_type = 'agent');

-- Update the trigger function to handle the new structure
CREATE OR REPLACE FUNCTION update_worker_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate the new average rating for the worker from all ratings (tenant and agent)
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

-- Create index for the new rater_type column
CREATE INDEX idx_worker_ratings_rater_type ON public.worker_ratings(rater_type);
CREATE INDEX idx_worker_ratings_rater_id ON public.worker_ratings(rater_id);
