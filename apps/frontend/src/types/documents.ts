export interface Document {
  is_pinned: any;
  is_favorite: any;
  id: string;
  title: string;
  content: any; // Will be replaced with proper block type
  parent_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  is_template: boolean;
  icon?: string;
  cover_image?: string;
  shared?: boolean;
}

export interface DocumentBlock {
  id: string;
  document_id: string;
  type: 'text' | 'heading' | 'list' | 'code' | 'image' | 'table';
  content: any;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  resolved: boolean;
}

export interface DocumentPermission {
  id: string;
  document_id: string;
  user_id: string;
  permission_level: 'view' | 'comment' | 'edit' | 'admin';
  created_at: string;
}

export type DocumentView = 'list' | 'board' | 'calendar' | 'gallery';

export interface DocumentTreeItem {
  id: string;
  title: string;
  type: 'folder' | 'document';
  status?: 'shared' | 'private' | 'draft';
  activeCollaborators?: string[];
  children?: DocumentTreeItem[];
  parentId?: string;
  lastEdited?: Date;
}

export interface BreadcrumbItem {
  id: string;
  title: string;
  type: 'folder' | 'document';
}
