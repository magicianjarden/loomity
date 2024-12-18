-- Drop existing generated columns if they exist
ALTER TABLE documents DROP COLUMN IF EXISTS title_search;
ALTER TABLE documents DROP COLUMN IF EXISTS content_search;

-- Add text search vectors
ALTER TABLE documents
ADD COLUMN title_search tsvector GENERATED ALWAYS AS (to_tsvector('english', COALESCE(title::text, ''))) STORED,
ADD COLUMN content_search tsvector GENERATED ALWAYS AS (to_tsvector('english', COALESCE(
    CASE jsonb_typeof(content)
        WHEN 'null' THEN ''
        WHEN 'string' THEN content::text
        ELSE ''
    END,
    ''
))) STORED;

-- Create GIN indexes for fast full-text search
DROP INDEX IF EXISTS idx_documents_title_search;
DROP INDEX IF EXISTS idx_documents_content_search;
CREATE INDEX idx_documents_title_search ON documents USING GIN (title_search);
CREATE INDEX idx_documents_content_search ON documents USING GIN (content_search);

-- Update existing rows to trigger the generation of search vectors
UPDATE documents SET title = title WHERE title IS NOT NULL;
UPDATE documents SET content = content WHERE content IS NOT NULL;
