import { Extension } from '@tiptap/core';
import { Node } from '@tiptap/core';
import { mergeAttributes } from '@tiptap/core';
import mermaid from 'mermaid';
import { PluginDefinition, PluginAPI } from '../../lib/plugin-sdk/types';

interface MermaidAttributes {
  diagram: string;
  theme?: 'default' | 'forest' | 'dark' | 'neutral';
  direction?: 'TB' | 'BT' | 'LR' | 'RL';
}

const MermaidNode = Node.create({
  name: 'mermaid',
  group: 'block',
  content: 'inline*',
  draggable: true,

  addAttributes() {
    return {
      diagram: {
        default: '',
      },
      theme: {
        default: 'default',
      },
      direction: {
        default: 'TB',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="mermaid"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    try {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      mermaid.initialize({
        startOnLoad: true,
        theme: HTMLAttributes.theme,
        flowchart: {
          defaultRenderer: 'dagre-d3',
          useMaxWidth: true,
          defaultLinkTarget: '_blank',
          curve: 'basis',
          direction: HTMLAttributes.direction,
        },
      });

      return [
        'div',
        mergeAttributes({ 'data-type': 'mermaid', class: 'mermaid-diagram' }, HTMLAttributes),
        ['div', { id, class: 'mermaid' }, HTMLAttributes.diagram],
      ];
    } catch (error) {
      return [
        'div',
        { class: 'mermaid-error' },
        `Error rendering diagram: ${error.message}`,
      ];
    }
  },

  addCommands() {
    return {
      insertMermaid:
        (attributes: MermaidAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
      updateMermaid:
        (attributes: MermaidAttributes) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes);
        },
    };
  },
});

const MermaidExtension = Extension.create({
  name: 'mermaid',

  addNodes() {
    return [MermaidNode];
  },
});

export const mermaidPlugin: PluginDefinition = {
  name: 'mermaid',
  version: '1.0.0',
  description: 'A plugin for creating diagrams and flowcharts using Mermaid',
  author: {
    name: 'Loomity',
    email: 'support@loomity.com',
  },

  getExtensions() {
    return [MermaidExtension];
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
      insertDiagram: async (diagram: string, options?: { theme?: 'default' | 'forest' | 'dark' | 'neutral'; direction?: 'TB' | 'BT' | 'LR' | 'RL' }) => {
        // Implementation
      },
      updateDiagram: async (diagram: string, options?: { theme?: 'default' | 'forest' | 'dark' | 'neutral'; direction?: 'TB' | 'BT' | 'LR' | 'RL' }) => {
        // Implementation
      },
      validateDiagram: async (diagram: string) => {
        try {
          await mermaid.parse(diagram);
          return true;
        } catch (error) {
          return false;
        }
      },
      renderDiagram: async (diagram: string, options?: { theme?: string; direction?: string }) => {
        const { svg } = await mermaid.render('preview', diagram, undefined, undefined, {
          theme: options?.theme || 'default',
          flowchart: {
            direction: options?.direction || 'TB',
          },
        });
        return svg;
      },
    };
  },
};
