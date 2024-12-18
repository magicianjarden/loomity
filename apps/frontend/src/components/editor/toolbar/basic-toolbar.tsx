'use client';

import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Code,
  List,
  ListOrdered,
  Quote,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ToolbarButton } from './toolbar-button';

interface BasicToolbarProps {
  editor: Editor;
}

export function BasicToolbar({ editor }: BasicToolbarProps) {
  return (
    <div className="flex items-center gap-1">
      <ToolbarButton
        icon={Bold}
        tooltip="Bold (⌘+B)"
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
      />
      <ToolbarButton
        icon={Italic}
        tooltip="Italic (⌘+I)"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
      />
      <ToolbarButton
        icon={Underline}
        tooltip="Underline (⌘+U)"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
      />
      <ToolbarButton
        icon={Strikethrough}
        tooltip="Strikethrough"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        icon={Link}
        tooltip="Add Link (⌘+K)"
        onClick={() => {
          const url = window.prompt('Enter the URL');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        isActive={editor.isActive('link')}
      />
      <ToolbarButton
        icon={Code}
        tooltip="Inline Code"
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

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
      <ToolbarButton
        icon={Quote}
        tooltip="Block Quote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
      />
    </div>
  );
}
