-- Create marketplace tables if they don't exist
CREATE TABLE IF NOT EXISTS marketplace_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS marketplace_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category UUID REFERENCES marketplace_categories(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    author_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Add theme support to tables
ALTER TABLE tables 
ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES marketplace_items(id),
ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{}';

-- Insert default table theme category if it doesn't exist
DO $$
DECLARE
    category_id UUID;
BEGIN
    -- Try to find existing category
    SELECT id INTO category_id
    FROM marketplace_categories
    WHERE name = 'table_themes';

    -- Create category if it doesn't exist
    IF category_id IS NULL THEN
        INSERT INTO marketplace_categories (name, description, config)
        VALUES (
            'table_themes',
            'Themes for customizing table appearance',
            '{
                "header": {
                    "background": "#f8f9fa",
                    "text": "#1a1b1e",
                    "border": "#e9ecef"
                },
                "body": {
                    "background": "#ffffff",
                    "text": "#1a1b1e",
                    "border": "#e9ecef",
                    "alternateBackground": "#f8f9fa"
                },
                "row": {
                    "hover": "#e9ecef",
                    "selected": "#e7f5ff"
                },
                "cell": {
                    "padding": "0.5rem",
                    "fontSize": "0.875rem"
                }
            }'::jsonb
        )
        RETURNING id INTO category_id;

        -- Insert a default theme with only essential fields
        INSERT INTO marketplace_items (
            category,
            name,
            description,
            price,
            author_id,
            is_active
        )
        VALUES (
            category_id,
            'Default Light Theme',
            'A clean, professional light theme for tables',
            0,
            (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin' LIMIT 1),
            true
        );
    END IF;
END $$;

-- Create or replace the table themes view
CREATE OR REPLACE VIEW table_themes AS
SELECT 
    mi.id,
    mi.name,
    mi.description,
    NULL as preview,
    mi.price,
    mi.author_id,
    mc.config as default_config
FROM marketplace_items mi
JOIN marketplace_categories mc ON mi.category = mc.id
WHERE mc.name = 'table_themes';

-- Add RLS policy for table themes if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'marketplace_items' 
        AND policyname = 'Anyone can view table themes in marketplace'
    ) THEN
        CREATE POLICY "Anyone can view table themes in marketplace"
            ON marketplace_items
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM marketplace_categories mc
                    WHERE mc.id = marketplace_items.category
                    AND mc.name = 'table_themes'
                )
            );
    END IF;
END $$;
