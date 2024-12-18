export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'numberedList'
  | 'listItem'
  | 'codeBlock'
  | 'quote'
  | 'image';

export interface BlockProperties {
  textAlign?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  textColor?: string;
  language?: string; // For code blocks
  alt?: string; // For images
  url?: string; // For images
  [key: string]: any;
}

export interface Block {
  id: string;
  documentId: string;
  parentBlockId?: string;
  blockType: BlockType;
  content: any;
  properties: BlockProperties;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockCreate extends Omit<Block, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

export interface BlockUpdate extends Partial<BlockCreate> {
  id: string;
}

export interface ReorderBlocksParams {
  documentId: string;
  parentBlockId?: string;
  blockIds: string[];
}
