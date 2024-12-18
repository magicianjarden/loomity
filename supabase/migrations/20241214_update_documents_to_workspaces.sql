-- Update documents table to support workspaces
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS is_workspace BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES documents(id),
  ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'doc';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_workspace_id ON documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_documents_is_workspace ON documents(is_workspace);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);

-- Update existing documents to be workspaces if they have no parent
UPDATE documents 
SET is_workspace = TRUE,
    type = 'workspace'
WHERE parent_id IS NULL;

-- Set workspace_id for existing documents
WITH RECURSIVE document_tree AS (
  -- Base case: documents with no parent (workspaces)
  SELECT id, parent_id, id as workspace_id
  FROM documents
  WHERE parent_id IS NULL
  
  UNION ALL
  
  -- Recursive case: documents with parents
  SELECT d.id, d.parent_id, dt.workspace_id
  FROM documents d
  INNER JOIN document_tree dt ON d.parent_id = dt.id
)
UPDATE documents d
SET workspace_id = dt.workspace_id
FROM document_tree dt
WHERE d.id = dt.id;
