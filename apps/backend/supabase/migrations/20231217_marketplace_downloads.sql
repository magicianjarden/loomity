-- Create marketplace_downloads table
CREATE TABLE IF NOT EXISTS public.marketplace_downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies for marketplace_downloads table
ALTER TABLE public.marketplace_downloads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view download stats
CREATE POLICY "Anyone can view download stats"
    ON public.marketplace_downloads FOR SELECT
    TO authenticated
    USING (true);

-- Allow users to record their downloads
CREATE POLICY "Users can record their downloads"
    ON public.marketplace_downloads FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
    );
