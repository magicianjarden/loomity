-- Create enum for marketplace item types if not exists
DO $$ BEGIN
    CREATE TYPE marketplace_item_type AS ENUM ('plugin', 'theme');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum for installation status if not exists
DO $$ BEGIN
    CREATE TYPE installation_status AS ENUM ('installed', 'active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create marketplace_items table if not exists
CREATE TABLE IF NOT EXISTS marketplace_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type marketplace_item_type NOT NULL,
    tags TEXT[] DEFAULT '{}',
    author_id UUID NOT NULL REFERENCES auth.users(id),
    version VARCHAR(50) NOT NULL,
    content_url TEXT NOT NULL,
    preview_images TEXT[] DEFAULT '{}',
    downloads INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5)
);

-- Create user_installed_items table if not exists
CREATE TABLE IF NOT EXISTS user_installed_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    item_id UUID NOT NULL REFERENCES marketplace_items(id),
    type marketplace_item_type NOT NULL,
    status installation_status DEFAULT 'installed',
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    configuration JSONB DEFAULT '{}',
    
    UNIQUE(user_id, item_id)
);

-- Create marketplace_reviews table if not exists
CREATE TABLE IF NOT EXISTS marketplace_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    item_id UUID NOT NULL REFERENCES marketplace_items(id),
    rating INTEGER NOT NULL,
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5),
    UNIQUE(user_id, item_id)
);

-- Drop existing function if exists
DROP FUNCTION IF EXISTS update_marketplace_item_rating() CASCADE;

-- Create function to update marketplace_items rating
CREATE OR REPLACE FUNCTION update_marketplace_item_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE marketplace_items
    SET 
        rating = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM marketplace_reviews
            WHERE item_id = NEW.item_id
        ),
        review_count = (
            SELECT COUNT(*)
            FROM marketplace_reviews
            WHERE item_id = NEW.item_id
        )
    WHERE id = NEW.item_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating ratings if not exists
DROP TRIGGER IF EXISTS update_marketplace_item_rating_trigger ON marketplace_reviews;
CREATE TRIGGER update_marketplace_item_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON marketplace_reviews
FOR EACH ROW
EXECUTE FUNCTION update_marketplace_item_rating();

-- Drop existing function if exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps if not exist
DROP TRIGGER IF EXISTS update_marketplace_items_updated_at ON marketplace_items;
CREATE TRIGGER update_marketplace_items_updated_at
    BEFORE UPDATE ON marketplace_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_installed_items_updated_at ON user_installed_items;
CREATE TRIGGER update_user_installed_items_updated_at
    BEFORE UPDATE ON user_installed_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_installed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view marketplace items" ON marketplace_items;
DROP POLICY IF EXISTS "Authors can insert marketplace items" ON marketplace_items;
DROP POLICY IF EXISTS "Authors can update their marketplace items" ON marketplace_items;
DROP POLICY IF EXISTS "Users can view their installed items" ON user_installed_items;
DROP POLICY IF EXISTS "Users can install items" ON user_installed_items;
DROP POLICY IF EXISTS "Users can update their installed items" ON user_installed_items;
DROP POLICY IF EXISTS "Users can uninstall items" ON user_installed_items;
DROP POLICY IF EXISTS "Anyone can view reviews" ON marketplace_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON marketplace_reviews;
DROP POLICY IF EXISTS "Users can update their reviews" ON marketplace_reviews;
DROP POLICY IF EXISTS "Users can delete their reviews" ON marketplace_reviews;

-- Create new policies
CREATE POLICY "Anyone can view marketplace items"
    ON marketplace_items FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authors can insert marketplace items"
    ON marketplace_items FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their marketplace items"
    ON marketplace_items FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- User installed items policies
CREATE POLICY "Users can view their installed items"
    ON user_installed_items FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can install items"
    ON user_installed_items FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their installed items"
    ON user_installed_items FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can uninstall items"
    ON user_installed_items FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
    ON marketplace_reviews FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create reviews"
    ON marketplace_reviews FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their reviews"
    ON marketplace_reviews FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their reviews"
    ON marketplace_reviews FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
