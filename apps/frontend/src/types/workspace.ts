export interface Workspace {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  owner_id: string;
  is_workspace: boolean;
  workspace_id: string | null;
  parent_id: string | null;
  is_template: boolean;
  is_pinned: boolean;
  is_favorite: boolean;
  icon?: string;
  cover_image?: string;
}

export type WorkspaceView = 'list' | 'gallery';

export interface WorkspaceTreeItem extends Workspace {
  children?: WorkspaceTreeItem[];
  level: number;
  isExpanded?: boolean;
}
