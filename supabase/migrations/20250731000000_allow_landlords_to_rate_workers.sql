-- Allow landlords to rate workers for completed maintenance requests

-- Update the check constraint to include landlords
ALTER TABLE public.worker_ratings 
DROP CONSTRAINT worker_ratings_rater_type_check;

ALTER TABLE public.worker_ratings 
ADD CONSTRAINT worker_ratings_rater_type_check 
CHECK (rater_type IN ('tenant', 'agent', 'landlord'));

-- Add policies for landlords to rate workers
CREATE POLICY "Landlords can create ratings for maintenance requests"
  ON public.worker_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = rater_id AND rater_type = 'landlord');

CREATE POLICY "Landlords can update their own ratings"
  ON public.worker_ratings
  FOR UPDATE
  USING (auth.uid() = rater_id AND rater_type = 'landlord');

-- Add read policies for all user types to view ratings
CREATE POLICY "Users can view all ratings"
  ON public.worker_ratings
  FOR SELECT
  USING (true);
