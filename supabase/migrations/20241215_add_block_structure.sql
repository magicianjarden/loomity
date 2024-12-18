-- Create enum for block types
CREATE TYPE block_type AS ENUM (
    'paragraph',
    'heading1',
    'heading2',
    'heading3',
    'bulletList',
    'numberedList',
    'listItem',
    'codeBlock',
    'quote',
    'image'
);

-- Add block-related columns to documents table
ALTER TABLE documents
ADD COLUMN block_type block_type DEFAULT 'paragraph',
ADD COLUMN block_properties JSONB DEFAULT '{}'::jsonb;

-- Create blocks table for nested blocks
CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    parent_block_id UUID REFERENCES blocks(id) ON DELETE CASCADE,
    block_type block_type NOT NULL,
    content JSONB,
    properties JSONB DEFAULT '{}'::jsonb,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_blocks_document_id ON blocks(document_id);
CREATE INDEX idx_blocks_parent_block_id ON blocks(parent_block_id);
CREATE INDEX idx_blocks_position ON blocks(position);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_block_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_block_updated_at
BEFORE UPDATE ON blocks
FOR EACH ROW
EXECUTE FUNCTION update_block_updated_at();

-- Add function to reorder blocks
CREATE OR REPLACE FUNCTION reorder_blocks(
    p_document_id UUID,
    p_parent_block_id UUID,
    p_block_ids UUID[]
)
RETURNS VOID AS $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..array_length(p_block_ids, 1)
    LOOP
        UPDATE blocks
        SET position = i,
            parent_block_id = p_parent_block_id
        WHERE id = p_block_ids[i]
        AND document_id = p_document_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Migrate existing document content to blocks
INSERT INTO blocks (document_id, block_type, content, position)
SELECT 
    id as document_id,
    'paragraph' as block_type,
    content as content,
    0 as position
FROM documents
WHERE content IS NOT NULL;
