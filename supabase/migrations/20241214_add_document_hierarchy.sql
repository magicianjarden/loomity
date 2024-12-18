-- Add hierarchy-related fields to documents table
ALTER TABLE documents
ADD COLUMN has_children BOOLEAN DEFAULT FALSE,
ADD COLUMN position INTEGER DEFAULT 0,
ADD COLUMN emoji TEXT;

-- Add index for faster tree traversal
CREATE INDEX idx_documents_parent_id ON documents(parent_id);
CREATE INDEX idx_documents_position ON documents(position);

-- Add a trigger to update has_children when children are added/removed
CREATE OR REPLACE FUNCTION update_parent_has_children()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE documents SET has_children = TRUE WHERE id = NEW.parent_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE documents SET has_children = EXISTS(
            SELECT 1 FROM documents WHERE parent_id = OLD.parent_id LIMIT 1
        ) WHERE id = OLD.parent_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_parent_has_children
AFTER INSERT OR DELETE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_parent_has_children();
