import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Code, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Image, Table, AlignLeft, Presentation } from 'lucide-react';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { SuggestionList } from '../suggestion-list';

export interface CommandItem {
  title: string;
  description: string;
  searchTerms: string[];
  icon: any;
  command: ({ editor, range }: { editor: any; range: any }) => void;
}

const renderSuggestion = () => {
  let component: ReactRenderer | null = null;
  let popup: any[] | null = null;

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(SuggestionList, {
        props,
        editor: props.editor,
      });

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
        theme: 'light-border',
        animation: 'scale-subtle',
        duration: 100,
      });

      // Add dark mode support
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class' && popup) {
            const isDark = document.documentElement.classList.contains('dark');
            popup[0].popper.classList.toggle('dark', isDark);
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    },

    onUpdate: (props: any) => {
      if (component && popup) {
        component.updateProps(props);
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      }
    },

    onKeyDown: (props: any) => {
      if (props.event.key === 'Escape') {
        popup?.[0].hide();
        return true;
      }
      return component?.ref?.onKeyDown(props);
    },

    onExit: () => {
      if (popup) {
        popup[0].destroy();
        popup = null;
      }

      if (component) {
        component.destroy();
        component = null;
      }
    },
  };
};

export const getSuggestionItems = (): CommandItem[] => [
  {
    title: 'Text',
    description: 'Start writing with plain text',
    searchTerms: ['text', 'paragraph', 'plain', 'write'],
    icon: AlignLeft,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: 'Slide',
    description: 'Add a new presentation slide',
    searchTerms: ['slide', 'presentation', 'deck', 'powerpoint'],
    icon: Presentation,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setSlide().run();
    },
  },
  {
    title: 'Heading 1',
    description: 'Large section heading',
    searchTerms: ['h1', 'header', 'heading', 'large', 'title'],
    icon: Heading1,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    searchTerms: ['h2', 'header', 'heading', 'medium', 'subtitle'],
    icon: Heading2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    searchTerms: ['h3', 'header', 'heading', 'small', 'subtitle'],
    icon: Heading3,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    title: 'Bullet List',
    description: 'Create a simple bullet list',
    searchTerms: ['bullet', 'list', 'unordered', 'point'],
    icon: List,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Create a numbered list',
    searchTerms: ['ordered', 'list', 'numbered'],
    icon: ListOrdered,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: 'Quote',
    description: 'Add a quote or citation',
    searchTerms: ['blockquote', 'quote', 'cite'],
    icon: Quote,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: 'Code Block',
    description: 'Add a code block',
    searchTerms: ['code', 'codeblock', 'fence'],
    icon: Code,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run();
    },
  },
  {
    title: 'Table',
    description: 'Add a table',
    searchTerms: ['table', 'grid', 'spreadsheet', 'matrix'],
    icon: Table,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setTable({ data: { rows: 3, cols: 3, content: [] } }).run();
    },
  },
];

export const filterCommandItems = (items: CommandItem[], query: string) => {
  if (!query) return items;

  const lowerQuery = query.toLowerCase();
  return items.filter((item) => {
    if (item.title.toLowerCase().includes(lowerQuery)) return true;
    if (item.description.toLowerCase().includes(lowerQuery)) return true;
    return item.searchTerms.some((term) => term.toLowerCase().includes(lowerQuery));
  });
};

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        items: ({ query }) => {
          return filterCommandItems(getSuggestionItems(), query);
        },
        render: renderSuggestion,
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
