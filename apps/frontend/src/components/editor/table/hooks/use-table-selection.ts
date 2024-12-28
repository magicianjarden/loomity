import { useCallback, useRef, useState } from 'react';
import { useTableStore } from '../table-store';
import { TableSelection } from '../table-types';

export function useTableSelection() {
  const {
    data,
    setSelection,
  } = useTableStore();

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ rowId: string; columnId: string } | null>(null);

  const getSelectionRange = useCallback((
    start: { rowId: string; columnId: string },
    end: { rowId: string; columnId: string }
  ) => {
    const startRowIndex = data.rows.findIndex(row => row.id === start.rowId);
    const endRowIndex = data.rows.findIndex(row => row.id === end.rowId);
    const startColIndex = data.columns.findIndex(col => col.id === start.columnId);
    const endColIndex = data.columns.findIndex(col => col.id === end.columnId);

    const minRow = Math.min(startRowIndex, endRowIndex);
    const maxRow = Math.max(startRowIndex, endRowIndex);
    const minCol = Math.min(startColIndex, endColIndex);
    const maxCol = Math.max(startColIndex, endColIndex);

    return {
      rows: data.rows.slice(minRow, maxRow + 1),
      columns: data.columns.slice(minCol, maxCol + 1),
    };
  }, [data.rows, data.columns]);

  const handleMouseDown = useCallback((rowId: string, columnId: string, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left click

    dragStartRef.current = { rowId, columnId };
    setIsDragging(true);

    const newSelection: TableSelection = {
      type: 'cell',
      anchor: { rowId, columnId },
    };

    if (e.shiftKey && data.state.selection) {
      newSelection.type = 'range';
      newSelection.focus = data.state.selection.anchor;
    }

    setSelection(newSelection);
  }, [data.state.selection, setSelection]);

  const handleMouseMove = useCallback((rowId: string, columnId: string) => {
    if (!isDragging || !dragStartRef.current) return;

    const newSelection: TableSelection = {
      type: 'range',
      anchor: dragStartRef.current,
      focus: { rowId, columnId },
    };

    setSelection(newSelection);
  }, [isDragging, setSelection]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  const isSelected = useCallback((rowId: string, columnId: string): boolean => {
    const selection = data.state.selection;
    if (!selection) return false;

    if (selection.type === 'cell') {
      return selection.anchor.rowId === rowId && selection.anchor.columnId === columnId;
    }

    if (selection.type === 'range' && selection.focus) {
      const range = getSelectionRange(selection.anchor, selection.focus);
      return range.rows.some(r => r.id === rowId) && 
             range.columns.some(c => c.id === columnId);
    }

    return false;
  }, [data.state.selection, getSelectionRange]);

  const getSelectedCells = useCallback((): { rowId: string; columnId: string }[] => {
    const selection = data.state.selection;
    if (!selection) return [];

    if (selection.type === 'cell') {
      return [selection.anchor];
    }

    if (selection.type === 'range' && selection.focus) {
      const range = getSelectionRange(selection.anchor, selection.focus);
      const cells: { rowId: string; columnId: string }[] = [];

      range.rows.forEach(row => {
        range.columns.forEach(col => {
          cells.push({ rowId: row.id, columnId: col.id });
        });
      });

      return cells;
    }

    return [];
  }, [data.state.selection, getSelectionRange]);

  return {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isSelected,
    getSelectedCells,
    getSelectionRange,
  };
}
