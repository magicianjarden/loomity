-- Add type column to documents table
ALTER TABLE documents 
ADD COLUMN type TEXT NOT NULL DEFAULT 'default';

-- Create index on type column
CREATE INDEX idx_documents_type ON documents(type);

-- Add check constraint for valid types
ALTER TABLE documents
ADD CONSTRAINT valid_document_type 
CHECK (type IN ('default', 'powerpoint', 'code', 'markdown'));
