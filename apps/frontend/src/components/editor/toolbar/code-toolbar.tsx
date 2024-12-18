'use client';

import React from 'react';
import {
  Code,
  Copy,
  Download,
  Play,
  Terminal,
  Palette,
  Check,
  FileCode,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from 'react';
import { LANGUAGE_KEYWORDS, LANGUAGE_FUNCTIONS } from '../extensions/code-suggestions';
import { CODE_THEMES, SUPPORTED_LANGUAGES } from '../extensions/code-block';
import { ToolbarButton } from './toolbar-button';
import { Separator } from '@/components/ui/separator';

// Common languages to show at the top of the list
const COMMON_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'html',
  'css',
  'sql',
  'json',
  'markdown',
];

// Sort languages to show common ones first
const SORTED_LANGUAGES = [
  ...COMMON_LANGUAGES,
  ...SUPPORTED_LANGUAGES.filter(lang => !COMMON_LANGUAGES.includes(lang)),
];

export function CodeToolbar({ editor }: { editor: any }) {
  if (!editor) return null;

  const [copied, setCopied] = useState(false);
  const currentLanguage = editor.getAttributes('codeBlock').language;
  const currentTheme = editor.getAttributes('codeBlock').theme?.name;

  const setLanguage = (language: string) => {
    editor.chain()
      .focus()
      .setCodeBlock()
      .updateAttributes('codeBlock', { language })
      .run();
  };

  const setTheme = (themeName: string) => {
    const theme = CODE_THEMES.find(t => t.name === themeName);
    if (theme) {
      editor.chain().focus().setCodeBlockTheme(theme).run();
    }
  };

  const insertSnippet = (snippet: string) => {
    editor.chain()
      .focus()
      .insertContent(snippet)
      .run();
  };

  const handleCopy = () => {
    const codeBlock = editor.state.doc.nodeAt(editor.state.selection.from)?.textContent;
    if (codeBlock) {
      navigator.clipboard.writeText(codeBlock);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const codeBlock = editor.getAttributes('codeBlock');
    if (codeBlock) {
      const content = editor.getText();
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code.${codeBlock.language || 'txt'}`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleRun = () => {
    // Implement code execution logic here
    console.log('Running code...');
  };

  const getSnippetsForLanguage = (language: string) => {
    const keywords = LANGUAGE_KEYWORDS[language] || [];
    const functions = LANGUAGE_FUNCTIONS[language] || [];
    return [...keywords, ...functions];
  };

  const snippets = getSnippetsForLanguage(currentLanguage);

  return (
    <div className="flex items-center gap-1 px-2">
      <Select value={currentLanguage} onValueChange={setLanguage}>
        <SelectTrigger className="w-[150px]">
          <Code className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Language">
            {currentLanguage}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SORTED_LANGUAGES.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton
            icon={Palette}
            tooltip="Change Theme"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {CODE_THEMES.map((theme) => (
            <DropdownMenuItem
              key={theme.name}
              onClick={() => setTheme(theme.name)}
            >
              {theme.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        icon={copied ? Check : Copy}
        tooltip="Copy Code"
        onClick={handleCopy}
      />
      <ToolbarButton
        icon={Download}
        tooltip="Download Code"
        onClick={handleDownload}
      />
      <ToolbarButton
        icon={Play}
        tooltip="Run Code"
        onClick={handleRun}
      />
      <ToolbarButton
        icon={Terminal}
        tooltip="Terminal"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarButton
            icon={FileCode}
            tooltip="Snippets"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          {snippets.map((snippet, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => insertSnippet(snippet)}
            >
              {snippet}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
