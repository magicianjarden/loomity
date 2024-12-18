-- Add is_pinned and is_favorite fields to documents table
ALTER TABLE documents 
ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;

-- Add indexes for better query performance
CREATE INDEX idx_documents_is_pinned ON documents(is_pinned);
CREATE INDEX idx_documents_is_favorite ON documents(is_favorite);
CREATE INDEX idx_documents_updated_at ON documents(updated_at);
