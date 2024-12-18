import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { v4 as uuidv4 } from 'uuid';
import { SlideComponent } from '../blocks/slide-component';
import { slideLayouts } from '../slides/slide-layouts';
import { SlideAttributes } from '../slides/types';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    slide: {
      setSlide: () => ReturnType;
      updateSlideLayout: (slideId: string, layoutId: string) => ReturnType;
      updateSlideNotes: (slideId: string, notes: string) => ReturnType;
      deleteSlide: () => ReturnType;
    };
  }
}

export interface SlideOptions {
  HTMLAttributes: Record<string, any>;
}

export const SlideNode = Node.create<SlideOptions>({
  name: 'slide',

  group: 'block',

  content: 'block+',

  draggable: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-slide-id'),
        renderHTML: attributes => {
          return {
            'data-slide-id': attributes.id,
          };
        },
      },
      layout: {
        default: 'title',
        parseHTML: element => element.getAttribute('data-layout'),
        renderHTML: attributes => {
          return {
            'data-layout': attributes.layout,
          };
        },
      },
      structure: {
        default: slideLayouts[0].structure,
        parseHTML: element => {
          const structureStr = element.getAttribute('data-structure');
          return structureStr ? JSON.parse(structureStr) : slideLayouts[0].structure;
        },
        renderHTML: attributes => {
          return {
            'data-structure': JSON.stringify(attributes.structure),
          };
        },
      },
      notes: {
        default: '',
        parseHTML: element => element.getAttribute('data-notes'),
        renderHTML: attributes => {
          return {
            'data-notes': attributes.notes,
          };
        },
      },
      showNotes: {
        default: false,
        parseHTML: element => element.getAttribute('data-show-notes') === 'true',
        renderHTML: attributes => {
          return {
            'data-show-notes': attributes.showNotes,
          };
        },
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
    return ['div', mergeAttributes({ 'data-type': 'slide' }, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setSlide:
        () =>
        ({ chain }) => {
          const defaultLayout = slideLayouts[0];
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                id: uuidv4(),
                layout: defaultLayout.id,
                structure: defaultLayout.structure,
              },
              content: [
                {
                  type: 'paragraph',
                },
              ],
            })
            .run();
        },
      updateSlideLayout:
        (slideId: string, layoutId: string) =>
        ({ tr }) => {
          const pos = this.findSlidePosition(tr.doc, slideId);
          if (pos === -1) return false;

          const layout = slideLayouts.find(l => l.id === layoutId);
          if (!layout) return false;

          tr.setNodeAttribute(pos, 'layout', layoutId);
          tr.setNodeAttribute(pos, 'structure', layout.structure);
          return true;
        },
      updateSlideNotes:
        (slideId: string, notes: string) =>
        ({ tr }) => {
          const pos = this.findSlidePosition(tr.doc, slideId);
          if (pos === -1) return false;

          tr.setNodeAttribute(pos, 'notes', notes);
          return true;
        },
      deleteSlide:
        () =>
        ({ tr, state }) => {
          const { $from } = state.selection;
          const depth = $from.depth;
          
          // Find the slide node
          let pos = $from.before(depth);
          let node = tr.doc.nodeAt(pos);
          
          // Keep going up until we find the slide
          while (node && node.type.name !== 'slide' && depth > 0) {
            pos = $from.before(--depth);
            node = tr.doc.nodeAt(pos);
          }
          
          if (!node || node.type.name !== 'slide') return false;
          
          // Delete the slide
          tr.delete(pos, pos + node.nodeSize);
          return true;
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(SlideComponent);
  },

  findSlidePosition(doc: any, slideId: string): number {
    let slidePos = -1;
    doc.descendants((node: any, pos: number) => {
      if (node.type.name === this.name && node.attrs.id === slideId) {
        slidePos = pos;
        return false;
      }
    });
    return slidePos;
  },
});
