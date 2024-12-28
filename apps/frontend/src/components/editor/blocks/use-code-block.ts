import { useState, useCallback, useEffect } from 'react';
import { useCodeBlockStore } from './code-block-store';
import {
  type CodeBlockOptions,
  type CodeBlockStatus,
  type CodeBlockAction,
  DEFAULT_OPTIONS,
  createInitialStatus,
  executeAction,
  analyzeCode,
  getLanguageConfiguration,
  getLanguageSnippets,
} from './code-block-features';

export interface UseCodeBlockProps {
  id: string;
  initialContent: string;
  initialOptions?: Partial<CodeBlockOptions>;
  onChange?: (content: string) => void;
}

export function useCodeBlock({
  id,
  initialContent,
  initialOptions = {},
  onChange,
}: UseCodeBlockProps) {
  const [content, setContent] = useState(initialContent);
  const [options, setOptions] = useState<CodeBlockOptions>({
    ...DEFAULT_OPTIONS,
    ...initialOptions,
  });
  const [status, setStatus] = useState<CodeBlockStatus>(createInitialStatus());
  const [metrics, setMetrics] = useState(() => analyzeCode(initialContent, options.language));
  const [snippets] = useState(() => getLanguageSnippets(options.language));
  const [languageConfig] = useState(() => getLanguageConfiguration(options.language));

  const { addToHistory, undo, redo, updatePreferences, clearHistory } = useCodeBlockStore();

  // Update content and trigger onChange
  const updateContent = useCallback(
    (newContent: string) => {
      setContent(newContent);
      setStatus(prev => ({ ...prev, isDirty: true }));
      setMetrics(analyzeCode(newContent, options.language));
      addToHistory(id, newContent);
      onChange?.(newContent);
    },
    [id, options.language, addToHistory, onChange]
  );

  // Handle undo/redo
  const handleUndo = useCallback(() => {
    undo(id);
  }, [id, undo]);

  const handleRedo = useCallback(() => {
    redo(id);
  }, [id, redo]);

  // Update options
  const updateOptions = useCallback((newOptions: Partial<CodeBlockOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
    updatePreferences(newOptions);
  }, [updatePreferences]);

  // Execute actions
  const executeCodeAction = useCallback(
    async (action: CodeBlockAction) => {
      setStatus(prev => ({ ...prev, isExecuting: true, hasError: false, errorMessage: undefined }));
      
      try {
        const result = await executeAction(action, content, options);
        
        if (result.success) {
          if (result.result !== undefined) {
            updateContent(result.result);
          }
          setStatus(prev => ({
            ...prev,
            isExecuting: false,
            hasError: false,
            executionOutput: typeof result.result === 'string' ? result.result : undefined,
          }));
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          isExecuting: false,
          hasError: true,
          errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
        }));
      }
    },
    [content, options, updateContent]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearHistory(id);
    };
  }, [id, clearHistory]);

  return {
    content,
    options,
    status,
    metrics,
    snippets,
    languageConfig,
    updateContent,
    updateOptions,
    executeCodeAction,
    handleUndo,
    handleRedo,
  };
}
