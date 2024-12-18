-- Create themes table
CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    variables JSONB NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create active_themes table to track which theme is active for each user
CREATE TABLE IF NOT EXISTS active_themes (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_themes ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read themes
CREATE POLICY "Allow authenticated users to read themes" ON themes
    FOR SELECT TO authenticated
    USING (true);

-- Allow users to manage their active theme
CREATE POLICY "Allow users to manage their active theme" ON active_themes
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_themes_updated_at
    BEFORE UPDATE ON themes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_active_themes_updated_at
    BEFORE UPDATE ON active_themes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
