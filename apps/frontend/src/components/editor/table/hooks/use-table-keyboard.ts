import { useCallback, useEffect } from 'react';
import { useTableStore } from '../table-store';
import { copyToClipboard, pasteFromClipboard } from '../utils/table-clipboard';
import { getTableHistory } from '../utils/table-history';

export function useTableKeyboard() {
  const { 
    data,
    setData,
    clipboard,
    setSelection,
  } = useTableStore();

  const handleCopy = useCallback(async (e: KeyboardEvent) => {
    if (!data.state.selection) return;

    try {
      const clipboardData = await copyToClipboard(data, data.state.selection);
      // Store in table state for internal operations
      setData({
        ...data,
        clipboard: clipboardData
      });
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, [data, setData]);

  const handlePaste = useCallback(async (e: KeyboardEvent) => {
    if (!data.state.selection) return;

    try {
      const updates = await pasteFromClipboard(data, data.state.selection.anchor);
      if (Object.keys(updates).length > 0) {
        const newData = {
          ...data,
          ...updates
        };
        setData(newData);
        getTableHistory(data).record(newData);
      }
    } catch (error) {
      console.error('Paste failed:', error);
    }
  }, [data, setData]);

  const handleUndo = useCallback((e: KeyboardEvent) => {
    const history = getTableHistory(data);
    if (history.canUndo()) {
      const previousState = history.undo();
      if (previousState) {
        setData(previousState);
      }
    }
  }, [data, setData]);

  const handleRedo = useCallback((e: KeyboardEvent) => {
    const history = getTableHistory(data);
    if (history.canRedo()) {
      const nextState = history.redo();
      if (nextState) {
        setData(nextState);
      }
    }
  }, [data, setData]);

  const handleSelectAll = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    if (data.rows.length === 0 || data.columns.length === 0) return;

    setSelection({
      type: 'range',
      anchor: {
        rowId: data.rows[0].id,
        columnId: data.columns[0].id,
      },
      focus: {
        rowId: data.rows[data.rows.length - 1].id,
        columnId: data.columns[data.columns.length - 1].id,
      },
    });
  }, [data.rows, data.columns, setSelection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Copy
      if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
        handleCopy(e);
      }
      // Paste
      else if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
        handlePaste(e);
      }
      // Undo
      else if (e.key === 'z' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        handleUndo(e);
      }
      // Redo
      else if (
        (e.key === 'z' && (e.metaKey || e.ctrlKey) && e.shiftKey) ||
        (e.key === 'y' && (e.metaKey || e.ctrlKey))
      ) {
        e.preventDefault();
        handleRedo(e);
      }
      // Select All
      else if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
        handleSelectAll(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCopy, handlePaste, handleUndo, handleRedo, handleSelectAll]);

  return {
    handleCopy,
    handlePaste,
    handleUndo,
    handleRedo,
    handleSelectAll,
  };
}
