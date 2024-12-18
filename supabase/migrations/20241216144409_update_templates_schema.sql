-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('theme', 'plugin', 'integration')),
    tags TEXT[] DEFAULT '{}',
    version TEXT,
    author_id UUID REFERENCES auth.users(id),
    access TEXT NOT NULL CHECK (access IN ('public', 'private', 'organization')) DEFAULT 'private',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create template_stats table with explicit foreign key name
CREATE TABLE IF NOT EXISTS template_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL,
    uses INTEGER DEFAULT 0,
    rating FLOAT DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT templates_id_fkey FOREIGN KEY (template_id)
        REFERENCES templates(id) ON DELETE CASCADE
);

-- Add unique constraint to ensure one stats row per template
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'template_stats_template_id_unique'
    ) THEN
        ALTER TABLE template_stats
        ADD CONSTRAINT template_stats_template_id_unique UNIQUE (template_id);
    END IF;
END $$;

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_template_stats_updated_at ON template_stats;
CREATE TRIGGER update_template_stats_updated_at
    BEFORE UPDATE ON template_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public templates are viewable by everyone" ON templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON templates;
DROP POLICY IF EXISTS "Public template stats are viewable by everyone" ON template_stats;
DROP POLICY IF EXISTS "Template stats can be updated by template owner" ON template_stats;

-- Templates policies
CREATE POLICY "Public templates are viewable by everyone"
ON templates FOR SELECT
USING (access = 'public');

CREATE POLICY "Users can create their own templates"
ON templates FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own templates"
ON templates FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own templates"
ON templates FOR DELETE
USING (auth.uid() = author_id);

-- Template stats policies
CREATE POLICY "Public template stats are viewable by everyone"
ON template_stats FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM templates
        WHERE templates.id = template_stats.template_id
        AND templates.access = 'public'
    )
);

CREATE POLICY "Template stats can be updated by template owner"
ON template_stats FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM templates
        WHERE templates.id = template_stats.template_id
        AND templates.author_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM templates
        WHERE templates.id = template_stats.template_id
        AND templates.author_id = auth.uid()
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_template_stats_template_id ON template_stats(template_id);
CREATE INDEX IF NOT EXISTS idx_templates_author_id ON templates(author_id);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON templates(featured) WHERE featured = true;

-- Create template stats trigger function
CREATE OR REPLACE FUNCTION create_template_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO template_stats (template_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS create_template_stats_on_template_creation ON templates;
CREATE TRIGGER create_template_stats_on_template_creation
    AFTER INSERT ON templates
    FOR EACH ROW
    EXECUTE FUNCTION create_template_stats();
