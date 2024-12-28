'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { CustomCodeBlock } from './extensions/code-block';
import { TableExtension } from './extensions/table-extension';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { CalloutNode } from './extensions/callout';
import { Slide } from './extensions/slide';
import { common, createLowlight } from 'lowlight';
import { useCallback, useEffect, useState } from 'react';
import { BlockMenu } from './block-menu';
import './editor.css';
import './styles/code-suggestions.css';
import { Extension } from '@tiptap/core';
import { SlashCommands } from './extensions/suggestions';
import { CodeSuggestions } from './extensions/code-suggestions';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Presentation,
  Table,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { tableTemplates } from './table/table-templates';
import { PresentationMode } from './presentation/presentation-mode';
import { AdaptiveToolbar } from './toolbar/adaptive-toolbar';
import { Plugin, PluginKey } from 'prosemirror-state';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SlideSidebar } from './slide-manager/slide-sidebar';
import { Button } from '@/components/ui/button';
import { SelectionHighlight } from './extensions/selection-highlight';
import { TextHighlight } from './extensions/text-highlight';

const lowlight = createLowlight(common);

const slashCommandsKey = new PluginKey('slashCommands');
const codeSuggestionsKey = new PluginKey('codeSuggestions');

interface DocumentEditorProps {
  content?: string;
  onUpdate?: (content: string) => void;
  editable?: boolean;
}

export function DocumentEditor({
  content = '',
  onUpdate,
  editable = true,
}: DocumentEditorProps) {
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null);
  const [searchText, setSearchText] = useState('');
  const [mounted, setMounted] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Type / to insert content...',
      }),
      Highlight,
      Link,
      Image,
      TaskList,
      TaskItem,
      CustomCodeBlock,
      TableExtension,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CalloutNode,
      Slide,
      SlashCommands,
      CodeSuggestions,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!editor) return;

    // Handle Cmd/Ctrl+A (Select All)
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      const { from, to } = { from: 0, to: editor.state.doc.content.size };
      setSelectionRange({ from, to });
      setSelectedText(editor.state.doc.textBetween(from, to, ' '));
    }

    // Handle Cmd/Ctrl+F (Find)
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      e.preventDefault();
      if (selectedText) {
        setSearchText(selectedText);
        editor.commands.setTextHighlight(selectedText);
      }
    }

    // Handle Escape (Clear Search)
    if (e.key === 'Escape') {
      setSearchText('');
      editor.commands.clearTextHighlight();
    }
  }, [editor, selectedText]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (onUpdate && localContent !== content) {
      onUpdate(localContent);
    }
  }, [localContent, content, onUpdate]);

  useEffect(() => {
    if (editor) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [editor, handleKeyDown]);

  const [slides, setSlides] = useState<string[]>([]);

  useEffect(() => {
    if (editor) {
      const slideIds: string[] = [];
      editor.state.doc.descendants(node => {
        if (node.type.name === 'slide') {
          slideIds.push(node.attrs.slideId);
        }
      });
      setSlides(slideIds);
    }
  }, [editor?.state.doc]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      // Find the positions of the active and over slides
      let activePos = -1;
      let overPos = -1;
      let activeOrder = -1;
      let overOrder = -1;

      editor?.state.doc.descendants((node, pos) => {
        if (node.type.name === 'slide') {
          if (node.attrs.slideId === active.id) {
            activePos = pos;
            activeOrder = node.attrs.order;
          }
          if (node.attrs.slideId === over.id) {
            overPos = pos;
            overOrder = node.attrs.order;
          }
        }
      });

      if (activePos > -1 && overPos > -1) {
        editor?.commands.command(({ tr, dispatch }) => {
          if (dispatch) {
            // Update all slides between active and over
            editor.state.doc.descendants((node, pos) => {
              if (node.type.name === 'slide') {
                const order = node.attrs.order;
                if (activeOrder < overOrder) {
                  if (order > activeOrder && order <= overOrder) {
                    tr.setNodeAttribute(pos, 'order', order - 1);
                  }
                } else {
                  if (order < activeOrder && order >= overOrder) {
                    tr.setNodeAttribute(pos, 'order', order + 1);
                  }
                }
              }
            });

            // Update the active slide's order
            tr.setNodeAttribute(activePos, 'order', overOrder);
          }
          return true;
        });
      }
    }
  };

  if (!mounted) {
    return (
      <div className="w-full h-full animate-pulse">
        <div className="h-10 bg-muted rounded mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <AdaptiveToolbar 
        editor={editor} 
        onOpenManager={() => setIsSidebarOpen(true)} 
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 px-4 py-4">
          <SortableContext 
            items={slides} 
            strategy={verticalListSortingStrategy}
          >
            <EditorContent editor={editor} />
          </SortableContext>
        </div>
      </DndContext>
      <BlockMenu editor={editor} />
      <SlideSidebar
        editor={editor}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      {(selectedText || searchText) && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-background p-4 shadow-lg border">
          <div className="flex items-center gap-4">
            {selectedText && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedText.length} characters selected
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (selectionRange) {
                      editor?.commands.setTextSelection(selectionRange);
                    }
                  }}
                >
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  Jump
                </Button>
              </div>
            )}
            {searchText && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSearchText('');
                    editor?.commands.clearTextHighlight();
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
