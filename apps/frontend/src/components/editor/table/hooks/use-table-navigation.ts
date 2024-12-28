import { useCallback, useEffect } from 'react';
import { useTableStore } from '../table-store';
import { TableSelection } from '../table-types';

export function useTableNavigation() {
  const {
    data,
    setSelection,
    updateCell,
  } = useTableStore();

  const findNextEditableCell = useCallback((
    currentRow: number,
    currentCol: number,
    direction: 'right' | 'left' | 'up' | 'down'
  ): { row: number; col: number } | null => {
    const rows = data.rows;
    const cols = data.columns;

    switch (direction) {
      case 'right': {
        // Try next cell in current row
        if (currentCol < cols.length - 1) {
          return { row: currentRow, col: currentCol + 1 };
        }
        // Move to first cell of next row
        if (currentRow < rows.length - 1) {
          return { row: currentRow + 1, col: 0 };
        }
        break;
      }
      case 'left': {
        // Try previous cell in current row
        if (currentCol > 0) {
          return { row: currentRow, col: currentCol - 1 };
        }
        // Move to last cell of previous row
        if (currentRow > 0) {
          return { row: currentRow - 1, col: cols.length - 1 };
        }
        break;
      }
      case 'up': {
        // Try cell above in current column
        if (currentRow > 0) {
          return { row: currentRow - 1, col: currentCol };
        }
        break;
      }
      case 'down': {
        // Try cell below in current column
        if (currentRow < rows.length - 1) {
          return { row: currentRow + 1, col: currentCol };
        }
        break;
      }
    }
    return null;
  }, [data.rows, data.columns]);

  const handleKeyNavigation = useCallback((
    e: KeyboardEvent,
    currentSelection: TableSelection
  ) => {
    const currentRowIndex = data.rows.findIndex(
      row => row.id === currentSelection.anchor.rowId
    );
    const currentColIndex = data.columns.findIndex(
      col => col.id === currentSelection.anchor.columnId
    );

    if (currentRowIndex === -1 || currentColIndex === -1) return;

    let direction: 'right' | 'left' | 'up' | 'down' | null = null;

    switch (e.key) {
      case 'Tab':
        direction = e.shiftKey ? 'left' : 'right';
        e.preventDefault();
        break;
      case 'ArrowRight':
        direction = 'right';
        break;
      case 'ArrowLeft':
        direction = 'left';
        break;
      case 'ArrowUp':
        direction = 'up';
        break;
      case 'ArrowDown':
        direction = 'down';
        break;
      case 'Enter':
        direction = e.shiftKey ? 'up' : 'down';
        e.preventDefault();
        break;
    }

    if (direction) {
      const nextCell = findNextEditableCell(currentRowIndex, currentColIndex, direction);
      if (nextCell) {
        const nextRow = data.rows[nextCell.row];
        const nextCol = data.columns[nextCell.col];
        
        const newSelection: TableSelection = {
          type: e.shiftKey ? 'range' : 'cell',
          anchor: {
            rowId: nextRow.id,
            columnId: nextCol.id,
          },
          focus: e.shiftKey ? currentSelection.anchor : undefined,
        };

        setSelection(newSelection);
      }
    }
  }, [data.rows, data.columns, findNextEditableCell, setSelection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const selection = data.state.selection;
      if (!selection) return;

      handleKeyNavigation(e, selection);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data.state.selection, handleKeyNavigation]);

  return {
    findNextEditableCell,
    handleKeyNavigation,
  };
}
