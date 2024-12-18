-- Create marketplace_items table if it doesn't exist
DROP TABLE IF EXISTS marketplace_items CASCADE;

CREATE TABLE marketplace_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('plugin', 'theme')),
    category TEXT NOT NULL,
    version TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_url TEXT NOT NULL,
    preview_images TEXT[] DEFAULT '{}',
    downloads INTEGER DEFAULT 0,
    rating DECIMAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow users to create marketplace items"
ON marketplace_items
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Allow users to read marketplace items"
ON marketplace_items
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow users to update their own marketplace items"
ON marketplace_items
FOR UPDATE TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Allow users to delete their own marketplace items"
ON marketplace_items
FOR DELETE TO authenticated
USING (auth.uid() = author_id);

-- Create trigger for updated_at
CREATE TRIGGER update_marketplace_items_updated_at
    BEFORE UPDATE ON marketplace_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Force schema refresh
NOTIFY pgrst, 'reload schema';
