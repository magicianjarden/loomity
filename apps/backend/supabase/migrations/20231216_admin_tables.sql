-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all admin records" ON public.admins;
DROP POLICY IF EXISTS "Only super admin can insert admin records" ON public.admins;
DROP POLICY IF EXISTS "Users can view their own admin record" ON public.admins;
DROP POLICY IF EXISTS "Admins can view banned users" ON public.banned_users;
DROP POLICY IF EXISTS "Only admins can ban users" ON public.banned_users;
DROP POLICY IF EXISTS "Only admins can unban users" ON public.banned_users;
DROP POLICY IF EXISTS "Admins can delete any marketplace item" ON public.marketplace_items;
DROP POLICY IF EXISTS "Admins can update any marketplace item" ON public.marketplace_items;

-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Create banned_users table
CREATE TABLE IF NOT EXISTS public.banned_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    banned_by UUID REFERENCES auth.users(id),
    reason TEXT,
    UNIQUE(user_id)
);

-- Create RLS policies for admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own admin record
CREATE POLICY "Users can view their own admin record"
    ON public.admins FOR SELECT
    USING (
        auth.uid() = user_id
    );

-- Allow super admin to insert new admin records
CREATE POLICY "Only super admin can insert admin records"
    ON public.admins FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = 'e3b5ab0d-2304-4f50-b8f4-0816beb0309f'
            AND user_id = auth.uid()
        )
    );

-- Create RLS policies for banned_users table
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view banned users (this is public info)
CREATE POLICY "Anyone can view banned users"
    ON public.banned_users FOR SELECT
    TO PUBLIC
    USING (true);

-- Only allow admins to ban users
CREATE POLICY "Only admins can ban users"
    ON public.banned_users FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    );

-- Only allow admins to unban users
CREATE POLICY "Only admins can unban users"
    ON public.banned_users FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for marketplace items
CREATE POLICY "Admins can delete any marketplace item"
    ON public.marketplace_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
        OR auth.uid() = author_id
    );

CREATE POLICY "Admins can update any marketplace item"
    ON public.marketplace_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid()
        )
        OR auth.uid() = author_id
    );

-- Insert initial admin user
INSERT INTO public.admins (user_id)
VALUES ('e3b5ab0d-2304-4f50-b8f4-0816beb0309f')
ON CONFLICT (user_id) DO NOTHING;
