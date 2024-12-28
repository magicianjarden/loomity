'use client';

import { Editor } from '@tiptap/react';
import { useState, useEffect } from 'react';
import { BasicToolbar } from './basic-toolbar';
import { TextToolbar } from './text-toolbar';
import { CodeToolbar } from './code-toolbar';
import { TableToolbar } from './table-toolbar';
import { PresentationToolbar } from './presentation-toolbar';
import { SlideToolbar } from './slide-toolbar';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { ToolbarButton } from './toolbar-button';

interface AdaptiveToolbarProps {
  editor: Editor;
  onOpenManager?: () => void;
}

export function AdaptiveToolbar({ editor, onOpenManager }: AdaptiveToolbarProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [activeContext, setActiveContext] = useState<string>('text');

  useEffect(() => {
    if (editor.isActive('codeBlock')) {
      setActiveContext('code');
    } else if (editor.isActive('table')) {
      setActiveContext('table');
    } else if (editor.isActive('slide')) {
      setActiveContext('slide');
    } else {
      setActiveContext('text');
    }
  }, [editor.state]);

  return (
    <div
      className={cn(
        "sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        isSticky && "shadow-sm"
      )}
    >
      {/* Top Row - Universal Actions */}
      <div className="flex items-center px-4 py-1 border-b border-border/50">
        <div className="flex items-center gap-1">
          {/* Text Formatting */}
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

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Headings */}
          <ToolbarButton
            icon={Heading1}
            tooltip="Heading 1"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
          />
          <ToolbarButton
            icon={Heading2}
            tooltip="Heading 2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
          />
          <ToolbarButton
            icon={Heading3}
            tooltip="Heading 3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
          />

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Alignment */}
          <ToolbarButton
            icon={AlignLeft}
            tooltip="Align Left"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
          />
          <ToolbarButton
            icon={AlignCenter}
            tooltip="Align Center"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
          />
          <ToolbarButton
            icon={AlignRight}
            tooltip="Align Right"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
          />
          <ToolbarButton
            icon={AlignJustify}
            tooltip="Justify"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
          />

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Links */}
          <ToolbarButton
            icon={Link}
            tooltip="Add Link (⌘+K)"
            onClick={() => editor.chain().focus().toggleLink({ href: '' }).run()}
            isActive={editor.isActive('link')}
          />
        </div>
      </div>

      {/* Bottom Row - Context Sensitive */}
      <div className={cn(
        "flex items-center px-4 py-1 bg-muted/30 transition-all duration-200",
        activeContext === 'text' && "border-l-2 border-l-primary"
      )}>
        {activeContext === 'text' && (
          <TextToolbar editor={editor} />
        )}
        {activeContext === 'code' && (
          <CodeToolbar editor={editor} />
        )}
        {activeContext === 'table' && (
          <TableToolbar editor={editor} />
        )}
        {activeContext === 'slide' && onOpenManager && (
          <div className="flex items-center gap-2">
            <SlideToolbar 
              editor={editor}
              onToggleNotes={() => setShowNotes(!showNotes)}
              showNotes={showNotes}
            />
            <Separator orientation="vertical" className="h-6" />
            <PresentationToolbar editor={editor} onOpenManager={onOpenManager} />
          </div>
        )}
      </div>
    </div>
  );
}