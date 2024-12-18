import React from 'react';
import { Editor } from '@tiptap/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Image,
  List,
  ListOrdered,
  MoreHorizontal,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
} from 'lucide-react';

interface BlockMenuProps {
  editor: Editor;
  isVisible: boolean;
  top: number;
}

export function BlockMenu({ editor, isVisible, top }: BlockMenuProps) {
  const setBlockType = (type: string) => {
    switch (type) {
      case 'paragraph':
        editor.chain().focus().setParagraph().run();
        break;
      case 'heading1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'heading3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'callout-info':
        editor.chain().focus().setCallout('info').run();
        break;
      case 'callout-warning':
        editor.chain().focus().setCallout('warning').run();
        break;
      case 'callout-success':
        editor.chain().focus().setCallout('success').run();
        break;
      case 'callout-error':
        editor.chain().focus().setCallout('error').run();
        break;
      case 'callout-tip':
        editor.chain().focus().setCallout('tip').run();
        break;
      case 'codeBlock':
        editor.chain().focus().toggleCodeBlock().run();
        break;
    }
  };

  return (
    <div
      className={cn(
        'absolute left-0 transition-all duration-200',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      style={{ top }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
            onClick={(e) => e.preventDefault()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => setBlockType('paragraph')}>
            <AlignLeft className="mr-2 h-4 w-4" />
            <span>Text</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBlockType('heading1')}>
            <Heading1 className="mr-2 h-4 w-4" />
            <span>Heading 1</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBlockType('heading2')}>
            <Heading2 className="mr-2 h-4 w-4" />
            <span>Heading 2</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBlockType('heading3')}>
            <Heading3 className="mr-2 h-4 w-4" />
            <span>Heading 3</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBlockType('bulletList')}>
            <List className="mr-2 h-4 w-4" />
            <span>Bullet List</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBlockType('orderedList')}>
            <ListOrdered className="mr-2 h-4 w-4" />
            <span>Numbered List</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBlockType('blockquote')}>
            <Quote className="mr-2 h-4 w-4" />
            <span>Quote</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBlockType('callout-info')}>
            <Info className="mr-2 h-4 w-4" />
            <span>Info Block</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBlockType('callout-warning')}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>Warning Block</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBlockType('callout-success')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>Success Block</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBlockType('callout-error')}>
            <XCircle className="mr-2 h-4 w-4" />
            <span>Error Block</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBlockType('callout-tip')}>
            <Lightbulb className="mr-2 h-4 w-4" />
            <span>Tip Block</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBlockType('codeBlock')}>
            <Code className="mr-2 h-4 w-4" />
            <span>Code Block</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
