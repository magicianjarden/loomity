import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Table,
  Underline,
  MoreHorizontal,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Presentation,
} from 'lucide-react';
import { TableTemplateSelector } from './table/table-template-selector';

interface BlockMenuProps {
  editor: Editor;
  isVisible?: boolean;
  top?: number;
}

const MENU_ITEMS = [
  {
    title: 'Text',
    icon: AlignLeft,
    command: (editor: Editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    title: 'Slide',
    icon: Presentation,
    command: (editor: Editor) => editor.chain().focus().setSlide().run(),
  },
  {
    title: 'Heading 1',
    icon: Heading1,
    command: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    icon: Heading2,
    command: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    icon: Heading3,
    command: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: 'Bullet List',
    icon: List,
    command: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: 'Numbered List',
    icon: ListOrdered,
    command: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: 'Quote',
    icon: Quote,
    command: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: 'Code Block',
    icon: Code,
    command: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: 'Image',
    icon: Image,
    command: (editor: Editor) => editor.chain().focus().setImage().run(),
  },
  {
    title: 'Table',
    icon: Table,
    command: () => {}, // Command is now handled by TableTemplateSelector
  },
  {
    title: 'Info Block',
    icon: Info,
    command: (editor: Editor) => editor.chain().focus().setCallout('info').run(),
  },
  {
    title: 'Warning Block',
    icon: AlertTriangle,
    command: (editor: Editor) => editor.chain().focus().setCallout('warning').run(),
  },
  {
    title: 'Success Block',
    icon: CheckCircle,
    command: (editor: Editor) => editor.chain().focus().setCallout('success').run(),
  },
  {
    title: 'Error Block',
    icon: XCircle,
    command: (editor: Editor) => editor.chain().focus().setCallout('error').run(),
  },
  {
    title: 'Tip Block',
    icon: Lightbulb,
    command: (editor: Editor) => editor.chain().focus().setCallout('tip').run(),
  },
];

const BlockMenu: React.FC<BlockMenuProps> = ({ editor, isVisible = false, top = 0 }) => {
  const [showTableSelector, setShowTableSelector] = useState(false);

  const handleTableSelect = () => {
    setShowTableSelector(true);
  };

  return (
    <>
      <Command
        className={cn(
          'absolute left-1/2 z-50 w-60 -translate-x-1/2 overflow-hidden rounded-md border bg-popover shadow-md transition-all',
          isVisible ? 'visible opacity-100' : 'invisible opacity-0'
        )}
        style={{ top }}
      >
        <CommandGroup>
          {MENU_ITEMS.map((item, index) => (
            <CommandItem
              key={index}
              onSelect={() => {
                if (item.title === 'Table') {
                  handleTableSelect();
                } else {
                  item.command(editor);
                }
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
      <TableTemplateSelector
        editor={editor}
        isOpen={showTableSelector}
        onClose={() => setShowTableSelector(false)}
      />
    </>
  );
};

export { BlockMenu };
