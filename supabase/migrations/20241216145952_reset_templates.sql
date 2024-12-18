-- Drop existing objects and constraints
ALTER TABLE IF EXISTS templates DROP CONSTRAINT IF EXISTS templates_author_id_fkey;
DROP TRIGGER IF EXISTS create_template_stats_on_template_creation ON templates;
DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
DROP TRIGGER IF EXISTS update_template_stats_updated_at ON template_stats;
DROP FUNCTION IF EXISTS create_template_stats();
DROP TABLE IF EXISTS template_stats;
DROP TABLE IF EXISTS templates;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create templates table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('theme', 'plugin', 'integration')),
    tags TEXT[] DEFAULT '{}',
    version TEXT,
    author_id UUID,
    access TEXT NOT NULL CHECK (access IN ('public', 'private', 'organization')) DEFAULT 'private',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add foreign key constraint after table creation
ALTER TABLE templates 
    ADD CONSTRAINT templates_author_id_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE;

-- Create template_stats table
CREATE TABLE template_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL,
    uses INTEGER DEFAULT 0,
    rating FLOAT DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT templates_id_fkey FOREIGN KEY (template_id)
        REFERENCES templates(id) ON DELETE CASCADE,
    CONSTRAINT template_stats_template_id_unique UNIQUE (template_id)
);

-- Create triggers for updated_at (using existing function)
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_stats_updated_at
    BEFORE UPDATE ON template_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_stats ENABLE ROW LEVEL SECURITY;

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
CREATE INDEX idx_template_stats_template_id ON template_stats(template_id);
CREATE INDEX idx_templates_author_id ON templates(author_id);
CREATE INDEX idx_templates_featured ON templates(featured) WHERE featured = true;

-- Create template stats trigger function
CREATE FUNCTION create_template_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO template_stats (template_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically create template stats
CREATE TRIGGER create_template_stats_on_template_creation
    AFTER INSERT ON templates
    FOR EACH ROW
    EXECUTE FUNCTION create_template_stats();
