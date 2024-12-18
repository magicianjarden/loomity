'use client';

import { Editor } from '@tiptap/react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Trash2,
  TableProperties,
  RowsIcon,
  ColumnsIcon,
  Merge,
  Split,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ToolbarButton } from './toolbar-button';

interface TableToolbarProps {
  editor: Editor;
}

export function TableToolbar({ editor }: TableToolbarProps) {
  return (
    <div className="flex items-center gap-1">
      <ToolbarButton
        icon={AlignLeft}
        tooltip="Align Left"
        onClick={() => editor.chain().focus().setCellAttribute('textAlign', 'left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
      />
      <ToolbarButton
        icon={AlignCenter}
        tooltip="Align Center"
        onClick={() => editor.chain().focus().setCellAttribute('textAlign', 'center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
      />
      <ToolbarButton
        icon={AlignRight}
        tooltip="Align Right"
        onClick={() => editor.chain().focus().setCellAttribute('textAlign', 'right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
      />
      <ToolbarButton
        icon={AlignJustify}
        tooltip="Justify"
        onClick={() => editor.chain().focus().setCellAttribute('textAlign', 'justify').run()}
        isActive={editor.isActive({ textAlign: 'justify' })}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        icon={RowsIcon}
        tooltip="Add Row"
        onClick={() => editor.chain().focus().addRowAfter().run()}
      />
      <ToolbarButton
        icon={ColumnsIcon}
        tooltip="Add Column"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        icon={Merge}
        tooltip="Merge Cells"
        onClick={() => editor.chain().focus().mergeCells().run()}
      />
      <ToolbarButton
        icon={Split}
        tooltip="Split Cell"
        onClick={() => editor.chain().focus().splitCell().run()}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        icon={Trash2}
        tooltip="Delete Table"
        onClick={() => editor.chain().focus().deleteTable().run()}
      />
    </div>
  );
}
