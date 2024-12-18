import { Node } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { PluginDefinition, PluginContext, PluginAPI } from '../../lib/plugin-sdk/types';
import { Extension } from '@tiptap/core';
import { mergeAttributes } from '@tiptap/core';

interface JSONViewerAttributes {
  json: string;
  expanded?: boolean;
  theme?: 'light' | 'dark';
  maxDepth?: number;
  sortKeys?: boolean;
}

const JsonViewerNode = Node.create({
  name: 'jsonViewer',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      json: {
        default: '{}',
      },
      expanded: {
        default: true,
      },
      theme: {
        default: 'light',
      },
      maxDepth: {
        default: 10,
      },
      sortKeys: {
        default: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-json-viewer]',
        getAttrs: (dom) => ({
          json: dom.getAttribute('data-json'),
          expanded: dom.getAttribute('data-expanded') === 'true',
          theme: dom.getAttribute('data-theme'),
          maxDepth: parseInt(dom.getAttribute('data-max-depth') || '10'),
          sortKeys: dom.getAttribute('data-sort-keys') === 'true',
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    try {
      const parsedJson = JSON.parse(HTMLAttributes.json);
      const formattedJson = JSON.stringify(parsedJson, null, 2);
      const renderValue = (value: any, depth: number = 0): string => {
        if (depth > HTMLAttributes.maxDepth) return '<span class="json-ellipsis">...</span>';
        
        if (value === null) return '<span class="json-null">null</span>';
        if (typeof value === 'boolean') return `<span class="json-boolean">${value}</span>`;
        if (typeof value === 'number') return `<span class="json-number">${value}</span>`;
        if (typeof value === 'string') return `<span class="json-string">"${value}"</span>`;
        
        if (Array.isArray(value)) {
          if (value.length === 0) return '[]';
          const items = value.map(item => renderValue(item, depth + 1)).join(',');
          return `[\n${' '.repeat((depth + 1) * 2)}${items}\n${' '.repeat(depth * 2)}]`;
        }
        
        if (typeof value === 'object') {
          const keys = Object.keys(value);
          if (HTMLAttributes.sortKeys) keys.sort();
          if (keys.length === 0) return '{}';
          
          const entries = keys.map(key => {
            const formattedKey = `<span class="json-key">"${key}"</span>: `;
            return `${' '.repeat((depth + 1) * 2)}${formattedKey}${renderValue(value[key], depth + 1)}`;
          }).join(',\n');
          
          return `{\n${entries}\n${' '.repeat(depth * 2)}}`;
        }
        
        return String(value);
      };

      const rendered = renderValue(parsedJson);

      return ['div', {
        'data-json-viewer': '',
        'data-json': HTMLAttributes.json,
        'data-expanded': HTMLAttributes.expanded,
        'data-theme': HTMLAttributes.theme,
        'data-max-depth': HTMLAttributes.maxDepth,
        'data-sort-keys': HTMLAttributes.sortKeys,
        class: `json-viewer theme-${HTMLAttributes.theme}`,
        innerHTML: `<pre>${rendered}</pre>`,
      }];
    } catch (error) {
      return ['div', {
        class: 'json-viewer-error',
      }, 'Invalid JSON'];
    }
  },

  addCommands() {
    return {
      insertJsonViewer:
        (attributes: JSONViewerAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
      updateJsonViewer:
        (attributes: JSONViewerAttributes) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes);
        },
    };
  },
});

const JsonViewerExtension = Extension.create({
  name: 'jsonViewer',

  addNodes() {
    return [JsonViewerNode];
  },
});

export const JsonViewerPlugin: PluginDefinition = {
  metadata: {
    id: 'json-viewer',
    name: 'JSON Viewer',
    description: 'Interactive JSON viewer with syntax highlighting and collapsible nodes',
    version: '1.0.0',
    author: 'Loomity',
    website: 'https://loomity.dev/plugins/json-viewer',
    repository: 'https://github.com/loomity/json-viewer',
    license: 'MIT',
    category: 'developer_tools',
    tags: ['json', 'viewer', 'developer', 'data'],
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
    editor.registerExtension(JsonViewerNode);
  },

  async activate() {
    // Plugin is ready to use
  },

  async deactivate() {
    // Clean up any resources
  },

  getAPI(): PluginAPI {
    return {
      insertJson: async (json: string | object, options: {
        expanded?: boolean;
        theme?: string;
        maxDepth?: number;
        sortKeys?: boolean;
      } = {}) => {
        const { editor } = this.context;
        const jsonString = typeof json === 'string' ? json : JSON.stringify(json);
        editor.commands.insertJsonViewer({
          json: jsonString,
          expanded: options.expanded ?? true,
          theme: options.theme || 'light',
          maxDepth: options.maxDepth || 10,
          sortKeys: options.sortKeys || false,
        });
      },

      updateJson: async (json: string | object, options: {
        expanded?: boolean;
        theme?: string;
        maxDepth?: number;
        sortKeys?: boolean;
      } = {}) => {
        const { editor } = this.context;
        const jsonString = typeof json === 'string' ? json : JSON.stringify(json);
        editor.commands.updateJsonViewer({
          json: jsonString,
          expanded: options.expanded,
          theme: options.theme,
          maxDepth: options.maxDepth,
          sortKeys: options.sortKeys,
        });
      },

      validateJson: async (json: string): Promise<boolean> => {
        try {
          JSON.parse(json);
          return true;
        } catch {
          return false;
        }
      },

      formatJson: async (json: string): Promise<string> => {
        try {
          return JSON.stringify(JSON.parse(json), null, 2);
        } catch {
          return json;
        }
      },

      getThemes: () => {
        return ['light', 'dark', 'github', 'monokai'];
      },
    };
  },
};
