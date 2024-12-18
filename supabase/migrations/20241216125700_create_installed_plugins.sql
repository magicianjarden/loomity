-- Create installed_plugins table
CREATE TABLE IF NOT EXISTS installed_plugins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plugin_id UUID NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    configuration JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, plugin_id)
);

-- Add RLS policies for installed_plugins
ALTER TABLE installed_plugins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own installed plugins"
    ON installed_plugins FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plugins"
    ON installed_plugins FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plugins"
    ON installed_plugins FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plugins"
    ON installed_plugins FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at
CREATE TRIGGER update_installed_plugins_updated_at
    BEFORE UPDATE ON installed_plugins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
