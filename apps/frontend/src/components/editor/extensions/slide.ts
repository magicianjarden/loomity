import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { SlideBlock } from '../blocks/slide-block';
import { Background, SlideElement } from '../slides/types';
import { v4 as uuidv4 } from 'uuid';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    slide: {
      /**
       * Add a slide
       */
      setSlide: (options?: { 
        id?: string;
        elements?: SlideElement[];
        background?: Background;
        notes?: string;
      }) => ReturnType;
    };
  }
}

export interface SlideOptions {
  HTMLAttributes: Record<string, any>;
  onOpenManager?: () => void;
}

export const Slide = Node.create<SlideOptions>({
  name: 'slide',
  
  group: 'block',
  
  atom: true,
  
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      onOpenManager: () => {},
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => ({ 'data-id': attributes.id }),
      },
      elements: {
        default: [],
        parseHTML: element => {
          try {
            return JSON.parse(element.getAttribute('data-elements') || '[]');
          } catch {
            return [];
          }
        },
        renderHTML: attributes => ({
          'data-elements': JSON.stringify(attributes.elements),
        }),
      },
      background: {
        default: { type: 'color', value: '#ffffff' },
        parseHTML: element => {
          try {
            return JSON.parse(element.getAttribute('data-background') || '{"type":"color","value":"#ffffff"}');
          } catch {
            return { type: 'color', value: '#ffffff' };
          }
        },
        renderHTML: attributes => ({
          'data-background': JSON.stringify(attributes.background),
        }),
      },
      notes: {
        default: '',
        parseHTML: element => element.getAttribute('data-notes'),
        renderHTML: attributes => ({ 'data-notes': attributes.notes }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="slide"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, { 'data-type': 'slide' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SlideBlock, {
      decorations: false
    });
  },

  addCommands() {
    return {
      setSlide:
        (options = {}) =>
        ({ commands }) => {
          const slideId = options.id || uuidv4();
          return commands.insertContent({
            type: this.name,
            attrs: {
              id: slideId,
              elements: options.elements || [],
              background: options.background || { type: 'color', value: '#ffffff' },
              notes: options.notes || '',
            },
          });
        },
    };
  },
});
