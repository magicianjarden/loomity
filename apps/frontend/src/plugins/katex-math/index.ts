import { Extension } from '@tiptap/core';
import { Node } from '@tiptap/core';
import { mergeAttributes } from '@tiptap/core';
import katex from 'katex';
import { PluginDefinition, PluginAPI, PluginContext } from '../../lib/plugin-sdk/types';

interface KaTeXAttributes {
  formula: string;
  displayMode?: boolean;
  errorColor?: string;
  throwOnError?: boolean;
}

const KaTeXNode = Node.create({
  name: 'katex',
  group: 'block',
  content: 'inline*',
  draggable: true,

  addAttributes() {
    return {
      formula: {
        default: '',
      },
      displayMode: {
        default: true,
      },
      errorColor: {
        default: '#cc0000',
      },
      throwOnError: {
        default: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="katex"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    try {
      const html = katex.renderToString(HTMLAttributes.formula, {
        displayMode: HTMLAttributes.displayMode,
        errorColor: HTMLAttributes.errorColor,
        throwOnError: HTMLAttributes.throwOnError,
      });

      return [
        'div',
        mergeAttributes({ 'data-type': 'katex', class: 'katex-block' }, HTMLAttributes),
        ['div', { class: 'katex-html', innerHTML: html }],
      ];
    } catch (error) {
      return [
        'div',
        { class: 'katex-error' },
        `Error rendering formula: ${error.message}`,
      ];
    }
  },

  addCommands() {
    return {
      insertKatex:
        (attributes: KaTeXAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
      updateKatex:
        (attributes: KaTeXAttributes) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes);
        },
    };
  },
});

const KaTeXExtension = Extension.create({
  name: 'katex',

  addNodes() {
    return [KaTeXNode];
  },
});

export const katexPlugin: PluginDefinition = {
  metadata: {
    id: 'katex-math',
    name: 'KaTeX Math Equations',
    description: 'Add beautiful math equations using KaTeX',
    version: '1.0.0',
    author: 'Loomity',
    website: 'https://loomity.dev/plugins/katex-math',
    repository: 'https://github.com/loomity/katex-math',
    license: 'MIT',
    category: 'media_embeds',
    tags: ['math', 'equations', 'katex', 'latex'],
    status: 'active',
    permissions: {
      read: true,
      write: true,
      execute: false,
    },
    pricing: {
      type: 'free',
    },
  },

  async initialize(context: PluginContext) {
    const { editor } = context;
    editor.registerExtension(KaTeXExtension);

    // Load KaTeX CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
    document.head.appendChild(link);
  },

  async activate() {
    // Plugin is ready to use
  },

  async deactivate() {
    // Clean up any resources
  },

  getExtensions() {
    return [KaTeXExtension];
  },

  getAPI(): PluginAPI {
    return {
      insertContent: async (content: string) => {
        // Implementation
      },
      replaceContent: async (content: string) => {
        // Implementation
      },
      getContent: async () => {
        return '';
      },
      getSelection: async () => {
        return { from: 0, to: 0 };
      },
      insertFormula: async (formula: string, options?: { displayMode?: boolean; errorColor?: string; throwOnError?: boolean }) => {
        // Implementation
      },
      updateFormula: async (formula: string, options?: { displayMode?: boolean; errorColor?: string; throwOnError?: boolean }) => {
        // Implementation
      },
      validateFormula: (formula: string) => {
        try {
          katex.renderToString(formula);
          return true;
        } catch (error) {
          return false;
        }
      },
      renderFormula: (formula: string, options?: { displayMode?: boolean; errorColor?: string; throwOnError?: boolean }) => {
        return katex.renderToString(formula, options);
      },
    };
  },
};
