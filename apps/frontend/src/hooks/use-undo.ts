import { useCallback, useRef, useState } from 'react';

export function useUndo<T = any>() {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const undoStack = useRef<T[]>([]);
  const redoStack = useRef<T[]>([]);

  const addToHistory = useCallback((state: T) => {
    undoStack.current.push(state);
    redoStack.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    if (undoStack.current.length > 0) {
      const state = undoStack.current.pop()!;
      redoStack.current.push(state);
      setCanUndo(undoStack.current.length > 0);
      setCanRedo(true);
      return state;
    }
  }, []);

  const redo = useCallback(() => {
    if (redoStack.current.length > 0) {
      const state = redoStack.current.pop()!;
      undoStack.current.push(state);
      setCanUndo(true);
      setCanRedo(redoStack.current.length > 0);
      return state;
    }
  }, []);

  const clear = useCallback(() => {
    undoStack.current = [];
    redoStack.current = [];
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    addToHistory,
    clear,
  };
}
