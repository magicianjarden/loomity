'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Copy,
  Download,
  Play,
  Settings,
  Undo,
  Redo,
  Languages,
  Moon,
  Sun,
  Palette,
  Terminal,
  FileCode,
  Check,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ToolbarButton } from './toolbar-button';
import { CODE_THEMES } from '../blocks/code-block-features';
import { LANGUAGE_KEYWORDS, LANGUAGE_FUNCTIONS } from '../extensions/code-suggestions';

// Language categories with their respective languages
const LANGUAGES = {
  'Web Development': {
    typescript: 'TypeScript',
    javascript: 'JavaScript',
    html: 'HTML',
    css: 'CSS',
    php: 'PHP',
  },
  'Backend': {
    python: 'Python',
    java: 'Java',
    csharp: 'C#',
    go: 'Go',
    rust: 'Rust',
    ruby: 'Ruby',
  },
  'System Programming': {
    cpp: 'C++',
    c: 'C',
    assembly: 'Assembly',
  },
  'Data & ML': {
    r: 'R',
    julia: 'Julia',
    scala: 'Scala',
    matlab: 'MATLAB',
  },
  'Shell & Scripting': {
    bash: 'Bash',
    powershell: 'PowerShell',
    perl: 'Perl',
  },
  'Database': {
    sql: 'SQL',
    plsql: 'PL/SQL',
    mongodb: 'MongoDB',
  },
  'Markup & Config': {
    markdown: 'Markdown',
    json: 'JSON',
    yaml: 'YAML',
    toml: 'TOML',
    xml: 'XML',
  },
  'Mobile': {
    kotlin: 'Kotlin',
    swift: 'Swift',
    dart: 'Dart',
    objectivec: 'Objective-C',
  },
};

interface CodeToolbarProps {
  options?: {
    language: string;
    theme: string;
    [key: string]: any;
  };
  onOptionsChange: (options: any) => void;
  onAction: (action: 'copy' | 'download' | 'run' | 'undo' | 'redo' | 'terminal' | 'insert-snippet') => void;
}

export function CodeToolbar({
  options = { language: 'typescript', theme: 'vs-dark' },
  onOptionsChange,
  onAction,
}: CodeToolbarProps) {
  const [copied, setCopied] = useState(false);

  // Find the display name for the current language
  const getCurrentLanguageDisplay = () => {
    for (const category of Object.values(LANGUAGES)) {
      for (const [key, value] of Object.entries(category)) {
        if (key === options?.language) {
          return value;
        }
      }
    }
    return options?.language || 'TypeScript';
  };

  // Get snippets for current language
  const getSnippetsForLanguage = (lang: string) => {
    const keywords = LANGUAGE_KEYWORDS[lang] || [];
    const functions = LANGUAGE_FUNCTIONS[lang] || [];
    return [...keywords, ...functions];
  };

  const handleCopy = () => {
    onAction('copy');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group themes by category
  const themeCategories = {
    'Dark Themes': CODE_THEMES.filter(t => 
      t.name.includes('dark') || 
      ['monokai', 'dracula', 'nord', 'aura', 'material-darker', 'night-owl', 'tokyo-night'].includes(t.name)
    ),
    'Light Themes': CODE_THEMES.filter(t => 
      t.name.includes('light') || 
      t.name === 'vs'
    ),
    'High Contrast': CODE_THEMES.filter(t => 
      t.name.includes('hc-')
    ),
  };

  return (
    <div className="flex items-center gap-1 border-b bg-muted/50 px-2 py-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Languages className="h-4 w-4" />
            {getCurrentLanguageDisplay()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[400px] overflow-y-auto">
          {Object.entries(LANGUAGES).map(([category, languages]) => (
            <React.Fragment key={category}>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{category}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {Object.entries(languages).map(([key, value]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => onOptionsChange({ language: key })}
                    >
                      {value}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Palette className="h-4 w-4" />
            {CODE_THEMES.find(t => t.name === options?.theme)?.label || 'Theme'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {Object.entries(themeCategories).map(([category, themes]) => (
            <React.Fragment key={category}>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{category}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {themes.map((themeOption) => (
                    <DropdownMenuItem
                      key={themeOption.name}
                      onClick={() => onOptionsChange({ theme: themeOption.name })}
                    >
                      {themeOption.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        icon={Undo}
        tooltip="Undo"
        onClick={() => onAction('undo')}
      />
      <ToolbarButton
        icon={Redo}
        tooltip="Redo"
        onClick={() => onAction('redo')}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        icon={copied ? Check : Copy}
        tooltip="Copy Code"
        onClick={handleCopy}
      />
      <ToolbarButton
        icon={Download}
        tooltip="Download"
        onClick={() => onAction('download')}
      />
      <ToolbarButton
        icon={Play}
        tooltip="Run Code"
        onClick={() => onAction('run')}
      />
      <ToolbarButton
        icon={Terminal}
        tooltip="Terminal"
        onClick={() => onAction('terminal')}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <FileCode className="h-4 w-4" />
            Snippets
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-[400px] overflow-y-auto">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Keywords</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {LANGUAGE_KEYWORDS[options?.language]?.map((keyword) => (
                <DropdownMenuItem
                  key={keyword}
                  onClick={() => onAction('insert-snippet')}
                >
                  {keyword}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Functions</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {LANGUAGE_FUNCTIONS[options?.language]?.map((func) => (
                <DropdownMenuItem
                  key={func}
                  onClick={() => onAction('insert-snippet')}
                >
                  {func}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopy}>Copy Code</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction('download')}>Download</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction('run')}>Run Code</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
