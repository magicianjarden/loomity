-- Add downloads column to marketplace_items if it doesn't exist
ALTER TABLE public.marketplace_items ADD COLUMN IF NOT EXISTS downloads INTEGER DEFAULT 0;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Add last_sign_in_at column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = user_id
    );

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    );

-- Create trigger to update last_sign_in_at
CREATE OR REPLACE FUNCTION public.handle_auth_sign_in()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, last_sign_in_at)
  VALUES (NEW.id, NEW.last_sign_in_at)
  ON CONFLICT (user_id) 
  DO UPDATE SET last_sign_in_at = NEW.last_sign_in_at;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;
CREATE TRIGGER on_auth_user_sign_in
  AFTER INSERT OR UPDATE OF last_sign_in_at
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_sign_in();
