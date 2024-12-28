'use client';

import { useEffect, useRef, useState } from 'react';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import dynamic from 'next/dynamic';
import { editor } from 'monaco-editor';
import { CodeToolbar } from '../toolbar/code-toolbar';
import { CodeStatusBar } from '../toolbar/code-status-bar';
import { DEFAULT_OPTIONS } from './code-block-features';
import { initializeThemes, setEditorTheme } from '../themes/theme-manager';

const LoadingEditor = () => (
  <div className="flex items-center justify-center min-h-[200px] bg-muted">
    <div className="animate-pulse">Loading editor...</div>
  </div>
);

// Dynamically import Monaco Editor with no SSR
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  { 
    ssr: false,
    loading: LoadingEditor
  }
);

export function EnhancedCodeBlock({
  node,
  updateAttributes,
}: NodeViewProps) {
  const [mounted, setMounted] = useState(false);
  const [options, setOptions] = useState({
    ...DEFAULT_OPTIONS,
    language: node?.attrs?.language || DEFAULT_OPTIONS.language,
  });

  const [metrics, setMetrics] = useState({
    lines: 0,
    characters: 0,
  });

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof editor | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateMetrics = (editor: editor.IStandaloneCodeEditor) => {
    const model = editor.getModel();
    if (model) {
      const content = model.getValue();
      setMetrics({
        lines: model.getLineCount(),
        characters: content.length,
      });
    }
  };

  const handleEditorDidMount = async (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco.editor;
    
    try {
      await initializeThemes();
      await setEditorTheme(monaco.editor, options.theme);
      updateMetrics(editor);
      editor.onDidChangeModelContent(() => {
        updateMetrics(editor);
      });
    } catch (error) {
      console.error('Error initializing editor:', error);
    }
  };

  const handleOptionsChange = async (newOptions: Partial<typeof options>) => {
    setOptions((prev) => ({ ...prev, ...newOptions }));
    if (newOptions.theme && monacoRef.current) {
      try {
        await setEditorTheme(monacoRef.current, newOptions.theme);
      } catch (error) {
        console.error('Error changing theme:', error);
      }
    }
  };

  const handleAction = (action: string) => {
    if (!editorRef.current) return;

    switch (action) {
      case 'copy':
        const content = editorRef.current.getValue();
        navigator.clipboard.writeText(content);
        break;
      case 'format':
        editorRef.current.getAction('editor.action.formatDocument')?.run();
        break;
      case 'undo':
        editorRef.current.trigger('keyboard', 'undo', null);
        break;
      case 'redo':
        editorRef.current.trigger('keyboard', 'redo', null);
        break;
      default:
        break;
    }
  };

  if (!mounted) {
    return (
      <NodeViewWrapper>
        <LoadingEditor />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <div className="relative my-4">
        <div className="rounded-md border bg-background shadow">
          <CodeToolbar
            options={options}
            onOptionsChange={handleOptionsChange}
            onAction={handleAction}
          />
          <div className="relative min-h-[200px]">
            <MonacoEditor
              height="400px"
              defaultLanguage={options.language}
              defaultValue={node?.attrs?.content || ''}
              theme={options.theme}
              options={{
                fontSize: options.fontSize,
                minimap: { enabled: options.minimap },
                lineNumbers: options.lineNumbers ? 'on' : 'off',
                tabSize: options.tabSize,
                wordWrap: options.wordWrap ? 'on' : 'off',
                readOnly: options.readOnly,
              }}
              onMount={handleEditorDidMount}
              onChange={(value) => {
                updateAttributes?.({ content: value || '' });
              }}
            />
          </div>
          <CodeStatusBar metrics={metrics} />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
