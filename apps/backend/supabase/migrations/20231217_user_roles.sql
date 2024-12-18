-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'moderator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_roles_updated_at();

-- Create RLS policies for user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own role
CREATE POLICY "Users can view their own role"
    ON public.user_roles FOR SELECT
    USING (
        auth.uid() = user_id
    );

-- Allow admins to view all user roles
CREATE POLICY "Admins can view all user roles"
    ON public.user_roles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    );

-- Allow admins to manage user roles
CREATE POLICY "Only admins can manage user roles"
    ON public.user_roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    );
