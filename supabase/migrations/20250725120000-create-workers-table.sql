-- Create workers table for property maintenance system
CREATE TABLE public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initials TEXT NOT NULL,
  name TEXT NOT NULL,
  specialty TEXT,
  rating NUMERIC(2,1),
  phone TEXT,
  description TEXT,
  favorite BOOLEAN DEFAULT FALSE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key constraint to maintenance_requests.assigned_worker_id
ALTER TABLE public.maintenance_requests
  ADD CONSTRAINT fk_assigned_worker FOREIGN KEY (assigned_worker_id)
  REFERENCES public.workers(id) ON DELETE SET NULL;

-- Enable RLS on workers
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view workers
CREATE POLICY "Authenticated users can view workers"
  ON public.workers
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow agents to insert/update/delete workers
CREATE POLICY "Agents can manage workers"
  ON public.workers
  FOR ALL
  USING (public.get_user_role(auth.uid()) = 'agent');
