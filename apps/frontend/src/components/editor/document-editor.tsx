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
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { CalloutNode } from './extensions/callout';
import { SlideNode } from './extensions/slide';
import { common, createLowlight } from 'lowlight';
import { useCallback, useEffect, useState } from 'react';
import { BlockMenu } from './block-menu';
import './editor.css';
import './styles/code-suggestions.css';
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { renderSuggestion } from './suggestion-renderer';
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
} from 'lucide-react';
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

const lowlight = createLowlight(common);

const slashCommandsKey = new PluginKey('slashCommands');
const codeSuggestionsKey = new PluginKey('codeSuggestions');

const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        pluginKey: slashCommandsKey,
      }),
    ];
  },
});

const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: 'Slide',
      description: 'Add a new slide',
      searchTerms: ['slide', 'presentation', 'powerpoint'],
      icon: Presentation,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setSlide()
          .run();
      },
    },
    {
      title: 'Heading 1',
      icon: Heading1,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 1 })
          .run();
      },
      keywords: ['h1', 'title', 'big'],
    },
    {
      title: 'Heading 2',
      icon: Heading2,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 2 })
          .run();
      },
      keywords: ['h2', 'subtitle'],
    },
    {
      title: 'Heading 3',
      icon: Heading3,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 3 })
          .run();
      },
      keywords: ['h3'],
    },
    {
      title: 'Bullet List',
      icon: List,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
      keywords: ['ul', 'list', 'bullet'],
    },
    {
      title: 'Numbered List',
      icon: ListOrdered,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
      keywords: ['ol', 'list', 'number'],
    },
    {
      title: 'Quote',
      icon: Quote,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
      keywords: ['blockquote', 'quote'],
    },
    {
      title: 'Code Block',
      icon: Code,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
      keywords: ['code', 'codeblock'],
    },
    {
      title: 'Info Block',
      icon: Info,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setCallout('info').run();
      },
      keywords: ['info', 'information', 'note'],
    },
    {
      title: 'Warning Block',
      icon: AlertTriangle,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setCallout('warning').run();
      },
      keywords: ['warning', 'alert', 'attention'],
    },
    {
      title: 'Success Block',
      icon: CheckCircle,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setCallout('success').run();
      },
      keywords: ['success', 'done', 'complete'],
    },
    {
      title: 'Error Block',
      icon: XCircle,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setCallout('error').run();
      },
      keywords: ['error', 'danger', 'failed'],
    },
    {
      title: 'Tip Block',
      icon: Lightbulb,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setCallout('tip').run();
      },
      keywords: ['tip', 'hint', 'suggestion'],
    },
  ];

  return items.filter(item => {
    const search = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(search) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(search))
    );
  });
};

interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

export function DocumentEditor({ content, onChange, editable = true }: DocumentEditorProps) {
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
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return "What's the title?";
          }
          return 'Press "/" for commands...';
        },
      }),
      Highlight,
      Link,
      Image,
      TaskList,
      TaskItem,
      CustomCodeBlock.configure({
        lowlight,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CalloutNode,
      SlideNode.configure({
        onOpenManager: () => setIsSidebarOpen(true),
      }),
      SlashCommands.configure({
        suggestion: {
          items: getSuggestionItems,
          render: renderSuggestion,
        },
      }),
      CodeSuggestions,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

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

  if (!editor) {
    return null;
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
    </div>
  );
}
