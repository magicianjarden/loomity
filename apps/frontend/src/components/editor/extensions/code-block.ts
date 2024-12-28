/** @jsxImportSource react */
import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { EnhancedCodeBlock } from '../blocks/enhanced-code-block';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import React from 'react';

const lowlight = createLowlight(common);

// Languages supported by lowlight
export const SUPPORTED_LANGUAGES = Object.keys(common).sort();

export interface CodeBlockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    codeBlock: {
      setCodeBlock: (attributes?: { language?: string }) => ReturnType;
      toggleCodeBlock: (attributes?: { language?: string }) => ReturnType;
    };
  }
}

export const CustomCodeBlock = Node.create({
  name: 'codeBlock',
  group: 'block',
  code: true,
  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: 'text*',

  addAttributes() {
    return {
      language: {
        default: 'typescript',
        parseHTML: element => element.getAttribute('data-language') || 'typescript',
        renderHTML: attributes => ({
          'data-language': attributes.language,
        }),
      },
      content: {
        default: '',
        parseHTML: element => element.textContent || '',
        renderHTML: attributes => attributes.content,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['pre', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), ['code', {}, 0]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EnhancedCodeBlock, {
      className: 'code-block',
      contentDOMElementTag: 'pre',
    });
  },

  addCommands() {
    return {
      setCodeBlock:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
      toggleCodeBlock:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),
    };
  },
});
