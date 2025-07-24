-- Fix security warnings by updating function search paths
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER SET search_path = 'public'
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;