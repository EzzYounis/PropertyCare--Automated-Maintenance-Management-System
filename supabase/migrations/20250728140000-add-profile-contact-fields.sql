-- Add phone and address fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_address ON profiles(address);

-- Update existing tenant profiles with sample contact information (optional)
-- This is just for testing purposes - in production, this data would come from user registration
UPDATE public.profiles 
SET 
  phone = CASE 
    WHEN role = 'tenant' AND phone IS NULL THEN '+90 5XX XXX XX XX'
    ELSE phone
  END,
  address = CASE 
    WHEN role = 'tenant' AND address IS NULL THEN 'Sample Address, Istanbul, Turkey'
    ELSE address
  END
WHERE role = 'tenant';
