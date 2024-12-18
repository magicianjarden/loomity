'use client';

import { Editor } from '@tiptap/react';
import {
  List,
  ListOrdered,
  Quote,
  Code,
  ImageIcon,
  Table,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ToolbarButton } from './toolbar-button';

interface TextToolbarProps {
  editor: Editor;
}

export function TextToolbar({ editor }: TextToolbarProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Lists */}
      <ToolbarButton
        icon={List}
        tooltip="Bullet List"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
      />
      <ToolbarButton
        icon={ListOrdered}
        tooltip="Numbered List"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Block Elements */}
      <ToolbarButton
        icon={Quote}
        tooltip="Block Quote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
      />
      <ToolbarButton
        icon={Code}
        tooltip="Code Block"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Insert */}
      <ToolbarButton
        icon={ImageIcon}
        tooltip="Insert Image"
        onClick={() => {/* TODO: Implement image upload */}}
      />
      <ToolbarButton
        icon={Table}
        tooltip="Insert Table"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      />
    </div>
  );
}
