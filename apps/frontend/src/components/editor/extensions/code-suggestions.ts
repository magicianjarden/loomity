import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { PluginKey } from 'prosemirror-state';

// Common keywords for different languages
export const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  javascript: [
    'const', 'let', 'var', 'function', 'class', 'extends', 'return', 'if', 'else', 'for', 'while',
    'try', 'catch', 'throw', 'new', 'typeof', 'instanceof', 'break', 'continue', 'switch', 'case',
    'default', 'do', 'void', 'yield', 'async', 'await', 'import', 'export', 'default', 'null',
    'undefined', 'true', 'false',
  ],
  typescript: [
    'interface', 'type', 'enum', 'namespace', 'implements', 'declare', 'abstract', 'public',
    'private', 'protected', 'readonly', 'as', 'is', 'keyof', 'in', 'out', 'infer', 'never',
    'unknown', 'any', 'string', 'number', 'boolean', 'object', 'symbol', 'bigint',
  ],
  python: [
    'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with',
    'as', 'import', 'from', 'raise', 'return', 'yield', 'break', 'continue', 'pass', 'None',
    'True', 'False', 'and', 'or', 'not', 'is', 'in', 'lambda', 'nonlocal', 'global',
  ],
  html: [
    'div', 'span', 'p', 'a', 'img', 'button', 'form', 'input', 'label', 'select', 'option',
    'textarea', 'table', 'tr', 'td', 'th', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'nav', 'header', 'footer', 'main', 'section', 'article', 'aside', 'figure', 'figcaption',
  ],
  css: [
    'color', 'background', 'margin', 'padding', 'border', 'display', 'position', 'width', 'height',
    'flex', 'grid', 'font-size', 'font-weight', 'text-align', 'align-items', 'justify-content',
    'transition', 'transform', 'animation', '@media', '@keyframes', '@import', '@font-face',
  ],
};

// Built-in functions and methods
export const LANGUAGE_FUNCTIONS: Record<string, string[]> = {
  javascript: [
    'console.log()', 'console.error()', 'console.warn()', 'console.info()',
    'parseInt()', 'parseFloat()', 'setTimeout()', 'setInterval()',
    'Math.floor()', 'Math.ceil()', 'Math.round()', 'Math.random()',
    'Array.isArray()', 'Object.keys()', 'Object.values()', 'JSON.stringify()',
    'JSON.parse()', 'String()', 'Number()', 'Boolean()',
  ],
  python: [
    'print()', 'len()', 'range()', 'str()', 'int()', 'float()', 'list()', 'dict()',
    'set()', 'tuple()', 'sum()', 'max()', 'min()', 'sorted()', 'enumerate()',
    'zip()', 'map()', 'filter()', 'reduce()', 'any()', 'all()', 'isinstance()',
  ],
};

export function getSuggestions(language: string, query: string) {
  if (!language) return [];

  const keywords = LANGUAGE_KEYWORDS[language] || [];
  const functions = LANGUAGE_FUNCTIONS[language] || [];
  const allItems = [...keywords, ...functions];

  if (!query) return allItems.slice(0, 10);

  return allItems
    .filter(item => item.toLowerCase().startsWith(query.toLowerCase()))
    .slice(0, 10)
    .map(item => ({
      title: item,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent(item)
          .run();
      },
    }));
}

export const CodeSuggestions = Extension.create({
  name: 'codeSuggestions',

  addOptions() {
    return {
      suggestion: {
        char: '',
        allowSpaces: true,
        decorationClass: 'code-suggestion',
        pluginKey: new PluginKey('codeSuggestions'),
        items: ({ query, editor }: { query: string; editor: any }) => {
          const { selection } = editor.state;
          const node = editor.state.doc.nodeAt(selection.from);
          if (!node?.type.name.includes('codeBlock')) return [];

          const language = node.attrs.language;
          if (!language) return [];

          // Get the current line's content up to the cursor
          const $pos = editor.state.doc.resolve(selection.from);
          const currentLine = editor.state.doc.textBetween(
            $pos.before(),
            selection.from,
            '\n'
          );

          // Extract the last word being typed
          const words = currentLine.split(/\s/);
          const lastWord = words[words.length - 1];

          return getSuggestions(language, lastWord);
        },
        render: () => {
          let popup: any;
          let selectedIndex = 0;

          const updatePopup = (items: any[], selected: number) => {
            if (!popup?.element) return;

            popup.element.innerHTML = '';
            items.forEach((item, index) => {
              const button = document.createElement('button');
              button.className = `suggestion-item ${index === selected ? 'selected' : ''}`;
              button.textContent = item.title;
              button.addEventListener('click', () => {
                item.command(item);
                popup?.hide();
              });
              popup.element.appendChild(button);
            });
          };

          return {
            onStart: (props: any) => {
              const items = props.items;
              if (!items?.length) return;

              popup = tippy('body', {
                getReferenceClientRect: () => props.clientRect(),
                appendTo: () => document.body,
                content: document.createElement('div'),
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                arrow: false,
                theme: 'suggestions',
              });

              updatePopup(items, selectedIndex);
            },

            onUpdate: (props: any) => {
              const items = props.items;
              if (!items?.length) {
                popup?.hide();
                return;
              }

              popup?.setProps({
                getReferenceClientRect: () => props.clientRect(),
              });

              updatePopup(items, selectedIndex);
            },

            onKeyDown: (props: any) => {
              const items = props.items;
              if (!items?.length) return false;

              if (props.event.key === 'ArrowDown') {
                selectedIndex = (selectedIndex + 1) % items.length;
                updatePopup(items, selectedIndex);
                return true;
              }

              if (props.event.key === 'ArrowUp') {
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                updatePopup(items, selectedIndex);
                return true;
              }

              if (props.event.key === 'Enter' || props.event.key === 'Tab') {
                const item = items[selectedIndex];
                if (item) {
                  item.command(item);
                  popup?.hide();
                }
                return true;
              }

              return false;
            },

            onExit: () => {
              popup?.destroy();
              selectedIndex = 0;
            },
          };
        },
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
