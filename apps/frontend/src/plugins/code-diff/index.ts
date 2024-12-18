import { Extension } from '@tiptap/core';
import { Node } from '@tiptap/core';
import { mergeAttributes } from '@tiptap/core';
import { diffLines, Change } from 'diff';
import * as Prism from 'prismjs';
import { PluginDefinition, PluginAPI } from '../../lib/plugin-sdk/types';

interface CodeDiffAttributes {
  oldCode: string;
  newCode: string;
  language?: string;
  filename?: string;
  diffStyle?: 'split' | 'unified';
}

const CodeDiffNode = Node.create({
  name: 'codeDiff',
  group: 'block',
  content: 'inline*',
  draggable: true,

  addAttributes() {
    return {
      oldCode: {
        default: '',
      },
      newCode: {
        default: '',
      },
      language: {
        default: 'plaintext',
      },
      filename: {
        default: '',
      },
      diffStyle: {
        default: 'split',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="code-diff"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const lines = diffLines(HTMLAttributes.oldCode || '', HTMLAttributes.newCode || '');
    const highlightedLines = lines.map((line: Change) => {
      if (!line.added && !line.removed) {
        return Prism.highlight(line.value, Prism.languages[HTMLAttributes.language || 'plaintext'], HTMLAttributes.language || 'plaintext');
      }
      return line.value;
    });

    return ['div', mergeAttributes({ 'data-type': 'code-diff' }, HTMLAttributes), ...highlightedLines];
  },

  addCommands() {
    return {
      insertCodeDiff:
        (attributes: CodeDiffAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
      updateCodeDiff:
        (attributes: CodeDiffAttributes) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes);
        },
    };
  },
});

const CodeDiffExtension = Extension.create({
  name: 'codeDiff',

  addNodes() {
    return [CodeDiffNode];
  },
});

export const codeDiffPlugin: PluginDefinition = {
  name: 'codeDiff',
  version: '1.0.0',
  description: 'A plugin for displaying code diffs with syntax highlighting',
  author: {
    name: 'Loomity',
    email: 'support@loomity.com',
  },

  getExtensions() {
    return [CodeDiffExtension];
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
      insertDiff: async (oldCode: string, newCode: string, options?: { language?: string; filename?: string; diffStyle?: 'split' | 'unified' }) => {
        // Implementation
      },
      updateDiff: async (oldCode: string, newCode: string, options?: { language?: string; filename?: string; diffStyle?: 'split' | 'unified' }) => {
        // Implementation
      },
      getDiff: async (oldCode: string, newCode: string) => {
        return diffLines(oldCode, newCode);
      },
      highlightCode: (code: string, language: string) => {
        return Prism.highlight(code, Prism.languages[language], language);
      },
    };
  },
};
