-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('tenant', 'agent', 'landlord');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  role app_role NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role, name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'username',
    (NEW.raw_user_meta_data ->> 'role')::app_role,
    NEW.raw_user_meta_data ->> 'name'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Re-enable RLS on maintenance_requests
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies for maintenance_requests
CREATE POLICY "Authenticated users can view maintenance requests" 
ON public.maintenance_requests 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Tenants can create maintenance requests" 
ON public.maintenance_requests 
FOR INSERT 
WITH CHECK (auth.uid() = tenant_id AND public.get_user_role(auth.uid()) = 'tenant');

CREATE POLICY "Authenticated users can update maintenance requests" 
ON public.maintenance_requests 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Update the trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();