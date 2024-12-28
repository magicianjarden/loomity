-- Create enum for slide layouts
CREATE TYPE slide_layout AS ENUM (
    'TITLE',
    'CONTENT',
    'IMAGE_TEXT',
    'TWO_COLUMN',
    'FULL_IMAGE',
    'QUOTE'
);

-- Create presentations table
CREATE TABLE IF NOT EXISTS presentations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    theme JSONB DEFAULT '{
        "colors": {
            "primary": "#1a73e8",
            "secondary": "#4285f4",
            "background": "#ffffff",
            "text": "#202124"
        },
        "fonts": {
            "heading": "Inter",
            "body": "Roboto"
        },
        "spacing": {
            "padding": "2rem",
            "gap": "1rem"
        }
    }'::jsonb,
    settings JSONB DEFAULT '{
        "aspectRatio": "16:9",
        "showSlideNumbers": true,
        "autoPlay": false,
        "loop": false,
        "transitionDuration": 0.3
    }'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create slides table
CREATE TABLE IF NOT EXISTS slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
    layout slide_layout NOT NULL DEFAULT 'CONTENT',
    content JSONB DEFAULT '{
        "elements": []
    }'::jsonb,
    background JSONB DEFAULT '{
        "type": "color",
        "value": "#ffffff"
    }'::jsonb,
    transitions JSONB DEFAULT '{
        "in": {
            "type": "fade",
            "duration": 0.3
        },
        "out": {
            "type": "fade",
            "duration": 0.3
        }
    }'::jsonb,
    animations JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create slide elements table for tracking individual elements on a slide
CREATE TABLE IF NOT EXISTS slide_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slide_id UUID REFERENCES slides(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- text, image, shape, etc.
    content JSONB NOT NULL,
    style JSONB DEFAULT '{
        "position": {
            "x": 0,
            "y": 0
        },
        "size": {
            "width": "auto",
            "height": "auto"
        },
        "rotation": 0,
        "opacity": 1
    }'::jsonb,
    animations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create presentation assets table for storing shared resources
CREATE TABLE IF NOT EXISTS presentation_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- image, video, font, etc.
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Add RLS policies
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE slide_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_assets ENABLE ROW LEVEL SECURITY;

-- Presentations policies
CREATE POLICY "Users can view their own presentations"
    ON presentations
    FOR SELECT
    USING (created_by = auth.uid());

CREATE POLICY "Users can create presentations"
    ON presentations
    FOR INSERT
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own presentations"
    ON presentations
    FOR UPDATE
    USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own presentations"
    ON presentations
    FOR DELETE
    USING (created_by = auth.uid());

-- Slides policies
CREATE POLICY "Users can view slides of their presentations"
    ON slides
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM presentations
            WHERE presentations.id = slides.presentation_id
            AND presentations.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create slides in their presentations"
    ON slides
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM presentations
            WHERE presentations.id = presentation_id
            AND presentations.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update slides in their presentations"
    ON slides
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM presentations
            WHERE presentations.id = presentation_id
            AND presentations.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete slides in their presentations"
    ON slides
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM presentations
            WHERE presentations.id = presentation_id
            AND presentations.created_by = auth.uid()
        )
    );

-- Slide elements policies
CREATE POLICY "Users can view elements of their slides"
    ON slide_elements
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM slides
            JOIN presentations ON presentations.id = slides.presentation_id
            WHERE slides.id = slide_id
            AND presentations.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create elements in their slides"
    ON slide_elements
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM slides
            JOIN presentations ON presentations.id = slides.presentation_id
            WHERE slides.id = slide_id
            AND presentations.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update elements in their slides"
    ON slide_elements
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM slides
            JOIN presentations ON presentations.id = slides.presentation_id
            WHERE slides.id = slide_id
            AND presentations.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete elements in their slides"
    ON slide_elements
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM slides
            JOIN presentations ON presentations.id = slides.presentation_id
            WHERE slides.id = slide_id
            AND presentations.created_by = auth.uid()
        )
    );

-- Presentation assets policies
CREATE POLICY "Users can view assets of their presentations"
    ON presentation_assets
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM presentations
            WHERE presentations.id = presentation_id
            AND presentations.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create assets in their presentations"
    ON presentation_assets
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM presentations
            WHERE presentations.id = presentation_id
            AND presentations.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update assets in their presentations"
    ON presentation_assets
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM presentations
            WHERE presentations.id = presentation_id
            AND presentations.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete assets in their presentations"
    ON presentation_assets
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM presentations
            WHERE presentations.id = presentation_id
            AND presentations.created_by = auth.uid()
        )
    );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS slides_presentation_id_idx ON slides(presentation_id);
CREATE INDEX IF NOT EXISTS slides_order_index_idx ON slides(presentation_id, order_index);
CREATE INDEX IF NOT EXISTS slide_elements_slide_id_idx ON slide_elements(slide_id);
CREATE INDEX IF NOT EXISTS presentation_assets_presentation_id_idx ON presentation_assets(presentation_id);
