import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CalloutComponent } from '../blocks/callout-component';

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (type: string) => ReturnType;
      toggleCallout: (type: string) => ReturnType;
    };
  }
}

export const CalloutNode = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  draggable: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        rendered: true,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent);
  },

  addCommands() {
    return {
      setCallout:
        (type: string) =>
        ({ commands }) => {
          return commands.setNode(this.name, { type });
        },
      toggleCallout:
        (type: string) =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', { type });
        },
    };
  },
});
