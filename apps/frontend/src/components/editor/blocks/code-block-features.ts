import { languages } from 'monaco-editor';

export const SUPPORTED_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'sql',
  'html',
  'css',
  'json',
  'yaml',
  'markdown',
  'shell',
  'plaintext',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Updated theme list
export const CODE_THEMES = [
  // Dark Themes
  { name: 'vs-dark', label: 'VS Dark' },
  { name: 'monokai', label: 'Monokai' },
  { name: 'dracula', label: 'Dracula' },
  { name: 'nord', label: 'Nord' },
  { name: 'aura', label: 'Aura Dark' },
  { name: 'github-dark', label: 'GitHub Dark' },
  { name: 'material-darker', label: 'Material Darker' },
  { name: 'night-owl', label: 'Night Owl' },
  { name: 'solarized-dark', label: 'Solarized Dark' },
  { name: 'tokyo-night', label: 'Tokyo Night' },

  // Light Themes
  { name: 'vs', label: 'VS Light' },
  { name: 'github-light', label: 'GitHub Light' },
  { name: 'solarized-light', label: 'Solarized Light' },
  { name: 'material-lighter', label: 'Material Lighter' },
  { name: 'min-light', label: 'Minimal Light' },

  // High Contrast Themes
  { name: 'hc-black', label: 'HC Dark' },
] as const;

export type CodeTheme = typeof CODE_THEMES[number]['name'];

export interface CodeBlockOptions {
  language: SupportedLanguage;
  theme: CodeTheme;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  readOnly: boolean;
}

export const DEFAULT_OPTIONS: CodeBlockOptions = {
  language: 'typescript',
  theme: 'vs-dark',
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  lineNumbers: true,
  readOnly: false,
};

// Language-specific features
export async function getLanguageConfiguration(language: SupportedLanguage) {
  if (typeof window === 'undefined') return null;
  
  try {
    const monaco = await import('monaco-editor');
    return monaco.languages.getLanguages().find(lang => lang.id === language);
  } catch (error) {
    console.error('Failed to load Monaco editor:', error);
    return null;
  }
}

// Code formatting
export async function formatCode(code: string, language: SupportedLanguage) {
  if (typeof window === 'undefined') return code;

  try {
    const monaco = await import('monaco-editor');
    const model = monaco.editor.createModel(code, language);
    const formatted = await monaco.editor.getModelMarkers(model);
    model.dispose();
    return formatted;
  } catch (error) {
    console.error('Failed to format code:', error);
    return code;
  }
}

// Code analysis
export async function analyzeCode(code: string, language: SupportedLanguage) {
  if (typeof window === 'undefined') return null;

  try {
    const monaco = await import('monaco-editor');
    const model = monaco.editor.createModel(code, language);
    const markers = monaco.editor.getModelMarkers(model);
    model.dispose();
    return markers;
  } catch (error) {
    console.error('Failed to analyze code:', error);
    return null;
  }
}

// Syntax highlighting configuration
export async function getSyntaxHighlighting(language: SupportedLanguage) {
  if (typeof window === 'undefined') return null;

  try {
    const monaco = await import('monaco-editor');
    const config = monaco.languages.getLanguages().find(lang => lang.id === language);
    return config?.tokenizer || null;
  } catch (error) {
    console.error('Failed to get syntax highlighting:', error);
    return null;
  }
}

// Code execution configuration (placeholder)
export const getExecutionConfig = (language: SupportedLanguage) => {
  // This would be replaced with actual execution configuration
  return {
    canExecute: ['javascript', 'typescript', 'python'].includes(language),
    runtime: language === 'python' ? 'python3' : 'node',
    // Add more execution configuration as needed
  };
};

// Code snippets
export const getLanguageSnippets = (language: SupportedLanguage): { [key: string]: string } => {
  const commonSnippets = {
    'console.log': 'console.log($1);',
    'function': 'function $1($2) {\n\t$3\n}',
    'if': 'if ($1) {\n\t$2\n}',
    'for': 'for (let i = 0; i < $1; i++) {\n\t$2\n}',
    'while': 'while ($1) {\n\t$2\n}',
    'try': 'try {\n\t$1\n} catch (error) {\n\t$2\n}',
  };

  const languageSpecificSnippets: Record<SupportedLanguage, { [key: string]: string }> = {
    typescript: {
      'interface': 'interface $1 {\n\t$2\n}',
      'type': 'type $1 = $2;',
      'class': 'class $1 {\n\tconstructor($2) {\n\t\t$3\n\t}\n}',
      'enum': 'enum $1 {\n\t$2\n}',
      'generic': 'function $1<T>($2: T): T {\n\t$3\n}',
      'async': 'async function $1($2) {\n\tconst result = await $3;\n\treturn result;\n}',
      'react-component': 'export function $1({ $2 }: $1Props) {\n\treturn (\n\t\t$3\n\t);\n}',
      'react-hook': 'export function use$1($2) {\n\tconst [$3, set${3/^(.)/\\u$1/}] = useState($4);\n\treturn $5;\n}',
    },
    javascript: {
      'class': 'class $1 {\n\tconstructor($2) {\n\t\t$3\n\t}\n}',
      'arrow': 'const $1 = ($2) => {\n\t$3\n};',
      'promise': 'new Promise((resolve, reject) => {\n\t$1\n})',
      'fetch': 'fetch($1)\n\t.then(response => response.json())\n\t.then(data => {\n\t\t$2\n\t})\n\t.catch(error => {\n\t\t$3\n\t});',
      'module': 'export default {\n\t$1\n};',
    },
    python: {
      'def': 'def $1($2):\n\t$3',
      'class': 'class $1:\n\tdef __init__(self, $2):\n\t\t$3',
      'print': 'print($1)',
      'with': 'with open($1, "$2") as f:\n\t$3',
      'if-main': 'if __name__ == "__main__":\n\t$1',
      'decorator': '@$1\ndef $2($3):\n\t$4',
      'async-def': 'async def $1($2):\n\t$3',
      'list-comp': '[$1 for $2 in $3]',
    },
    java: {
      'class': 'public class $1 {\n\t$2\n}',
      'main': 'public static void main(String[] args) {\n\t$1\n}',
      'method': 'public $1 $2($3) {\n\t$4\n}',
      'interface': 'public interface $1 {\n\t$2\n}',
    },
    go: {
      'func': 'func $1($2) $3 {\n\t$4\n}',
      'struct': 'type $1 struct {\n\t$2\n}',
      'interface': 'type $1 interface {\n\t$2\n}',
      'main': 'func main() {\n\t$1\n}',
    },
    rust: {
      'fn': 'fn $1($2) -> $3 {\n\t$4\n}',
      'struct': 'struct $1 {\n\t$2\n}',
      'impl': 'impl $1 {\n\t$2\n}',
      'trait': 'trait $1 {\n\t$2\n}',
    },
    sql: {
      'select': 'SELECT $1\nFROM $2\nWHERE $3;',
      'insert': 'INSERT INTO $1 ($2)\nVALUES ($3);',
      'update': 'UPDATE $1\nSET $2\nWHERE $3;',
      'delete': 'DELETE FROM $1\nWHERE $2;',
    },
    html: {
      'html5': '<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>$1</title>\n</head>\n<body>\n\t$2\n</body>\n</html>',
      'link': '<link rel="$1" href="$2">',
      'script': '<script src="$1"></script>',
      'div': '<div class="$1">\n\t$2\n</div>',
    },
    css: {
      'media': '@media ($1) {\n\t$2\n}',
      'keyframes': '@keyframes $1 {\n\t$2\n}',
      'flex': 'display: flex;\nflex-direction: $1;\njustify-content: $2;\nalign-items: $3;',
      'grid': 'display: grid;\ngrid-template-columns: $1;\ngrid-gap: $2;',
    },
    // Add more language snippets as needed
    c: {},
    cpp: {},
    csharp: {},
    ruby: {},
    php: {},
    swift: {},
    kotlin: {},
    json: {},
    yaml: {},
    markdown: {},
    shell: {},
    plaintext: {},
  };

  return {
    ...commonSnippets,
    ...languageSpecificSnippets[language],
  };
};

// Code block status
export interface CodeBlockStatus {
  isDirty: boolean;
  isExecuting: boolean;
  hasError: boolean;
  errorMessage?: string;
  executionOutput?: string;
}

export const createInitialStatus = (): CodeBlockStatus => ({
  isDirty: false,
  isExecuting: false,
  hasError: false,
});

// Code block actions
export interface CodeBlockAction {
  type: 'format' | 'execute' | 'copy' | 'download' | 'clear';
  payload?: any;
}

export const executeAction = async (
  action: CodeBlockAction,
  code: string,
  options: CodeBlockOptions
): Promise<{ success: boolean; result?: any; error?: string }> => {
  try {
    switch (action.type) {
      case 'format':
        const formattedCode = await formatCode(code, options.language);
        return { success: true, result: formattedCode };

      case 'execute':
        // Placeholder for code execution
        return { success: true, result: 'Code execution not implemented' };

      case 'copy':
        await navigator.clipboard.writeText(code);
        return { success: true };

      case 'download':
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${options.language}`;
        a.click();
        URL.revokeObjectURL(url);
        return { success: true };

      case 'clear':
        return { success: true, result: '' };

      default:
        return { success: false, error: 'Unknown action' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
