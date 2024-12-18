export interface Document {
  id: string;
  title: string;
  content: string;
  type: 'doc' | 'folder' | 'workspace';
  parent_id: string | null;
  workspace_id: string | null;
  owner_id: string;
  is_template: boolean;
  is_pinned: boolean;
  is_favorite: boolean;
  is_workspace: boolean;
  has_children: boolean;
  position: number;
  icon?: string;
  emoji?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentTreeItem extends Document {
  children?: DocumentTreeItem[];
  level: number;
}

export interface DocumentGroup {
  title: string;
  documents: Document[];
}

export type DocumentView = 'list' | 'gallery';

export interface DocumentBreadcrumb {
  id: string;
  title: string;
  type: 'page' | 'folder';
}
