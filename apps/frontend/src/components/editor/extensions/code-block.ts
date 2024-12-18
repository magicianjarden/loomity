import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { mergeAttributes } from '@tiptap/core';
import { common, createLowlight } from 'lowlight'

export const lowlight = createLowlight(common);

export type CodeBlockTheme = {
  name: string;
  background: string;
  text: string;
};

export const CODE_THEMES: CodeBlockTheme[] = [
  { name: 'Default', background: 'bg-muted', text: 'text-foreground' },
  { name: 'Dark', background: 'bg-zinc-950', text: 'text-zinc-50' },
  { name: 'Night Owl', background: 'bg-[#011627]', text: 'text-[#d6deeb]' },
  { name: 'Monokai', background: 'bg-[#272822]', text: 'text-[#f8f8f2]' },
  { name: 'Dracula', background: 'bg-[#282a36]', text: 'text-[#f8f8f2]' },
  { name: 'Solarized', background: 'bg-[#002b36]', text: 'text-[#839496]' },
  { name: 'GitHub', background: 'bg-white dark:bg-[#0d1117]', text: 'text-[#24292e] dark:text-white' },
  { name: 'VSCode', background: 'bg-[#1e1e1e]', text: 'text-[#d4d4d4]' },
];

// Languages supported by lowlight
export const SUPPORTED_LANGUAGES = Object.keys(common).sort();

export const CustomCodeBlock = CodeBlockLowlight
  .extend({
    addOptions() {
      return {
        ...this.parent?.(),
        lowlight,
        defaultLanguage: null,
        HTMLAttributes: {
          class: 'not-prose',
        },
      };
    },

    addAttributes() {
      return {
        ...this.parent?.(),
        language: {
          default: this.options.defaultLanguage,
          parseHTML: element => {
            const language = element.getAttribute('data-language') || this.options.defaultLanguage;
            return SUPPORTED_LANGUAGES.includes(language) ? language : this.options.defaultLanguage;
          },
          renderHTML: attributes => ({
            'data-language': attributes.language,
          }),
        },
        theme: {
          default: CODE_THEMES[0],
          parseHTML: element => {
            const themeName = element.getAttribute('data-theme');
            return CODE_THEMES.find(theme => theme.name === themeName) || CODE_THEMES[0];
          },
          renderHTML: attributes => {
            const theme = attributes.theme as CodeBlockTheme;
            return {
              'data-theme': theme.name,
              style: 'margin: 0;',
            };
          },
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

    renderHTML({ HTMLAttributes, node }) {
      const theme = node.attrs.theme as CodeBlockTheme;
      const containerClasses = `rounded-md p-4 text-sm ${theme.background} ${theme.text}`;
      const language = node.attrs.language || this.options.defaultLanguage;

      return [
        'div',
        { class: containerClasses },
        [
          'pre',
          mergeAttributes(this.options.HTMLAttributes, {
            style: 'margin: 0; background: none; font-size: inherit;',
            'data-language': language,
          }),
          [
            'code',
            {
              style: 'background: none; font-size: inherit;',
              class: `language-${language}`,
            },
            0,
          ],
        ],
      ];
    },

    addCommands() {
      return {
        ...this.parent?.(),
        setCodeBlockTheme:
          (theme: CodeBlockTheme) =>
          ({ commands }) => {
            return commands.updateAttributes(this.name, {
              theme,
            });
          },
      };
    },

    addKeyboardShortcuts() {
      return {
        ...this.parent?.(),
        Tab: () => {
          const { state, view } = this.editor;
          const { from, to } = state.selection;
          view.dispatch(state.tr.insertText('  ', from, to));
          return true;
        },
      };
    },
  });
