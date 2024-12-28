import { useCallback, useState, useRef } from 'react';
import { useTableStore } from '../table-store';
import { TableColumn, TableRow } from '../table-types';

interface DragState {
  type: 'row' | 'column';
  sourceIndex: number;
  currentIndex: number;
  element: HTMLElement;
  initialX: number;
  initialY: number;
}

export function useTableDnd() {
  const { data, setData } = useTableStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<DragState | null>(null);
  const dragGhost = useRef<HTMLDivElement | null>(null);

  const createDragGhost = () => {
    if (!dragGhost.current) {
      dragGhost.current = document.createElement('div');
      dragGhost.current.className = 'fixed pointer-events-none opacity-50 bg-white shadow-lg rounded-md z-50';
      document.body.appendChild(dragGhost.current);
    }
    return dragGhost.current;
  };

  const removeDragGhost = () => {
    if (dragGhost.current) {
      document.body.removeChild(dragGhost.current);
      dragGhost.current = null;
    }
  };

  const updateGhostPosition = (e: MouseEvent) => {
    if (!dragState.current || !dragGhost.current) return;

    const { initialX, initialY } = dragState.current;
    const deltaX = e.clientX - initialX;
    const deltaY = e.clientY - initialY;

    dragGhost.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  };

  const startDrag = useCallback((
    type: 'row' | 'column',
    index: number,
    element: HTMLElement,
    e: React.MouseEvent
  ) => {
    e.preventDefault();

    const rect = element.getBoundingClientRect();
    const ghost = createDragGhost();
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.left = `${rect.left}px`;
    ghost.style.top = `${rect.top}px`;
    ghost.innerHTML = element.innerHTML;

    dragState.current = {
      type,
      sourceIndex: index,
      currentIndex: index,
      element,
      initialX: e.clientX,
      initialY: e.clientY,
    };

    setIsDragging(true);
    element.classList.add('opacity-50');
  }, []);

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!dragState.current) return;

    updateGhostPosition(e);

    const { type, element } = dragState.current;
    const items = type === 'row' ? 
      Array.from(element.parentElement?.children || []) :
      Array.from(element.parentElement?.children || []);

    const targetIndex = items.findIndex(item => {
      const rect = item.getBoundingClientRect();
      return type === 'row' ?
        e.clientY < rect.top + rect.height / 2 :
        e.clientX < rect.left + rect.width / 2;
    });

    if (targetIndex !== -1 && targetIndex !== dragState.current.currentIndex) {
      dragState.current.currentIndex = targetIndex;
      
      // Update visual order
      const parent = element.parentElement;
      if (parent) {
        const sourceIndex = dragState.current.sourceIndex;
        const targetItem = items[targetIndex];
        
        if (sourceIndex < targetIndex) {
          parent.insertBefore(element, targetItem.nextSibling);
        } else {
          parent.insertBefore(element, targetItem);
        }
      }
    }
  }, []);

  const endDrag = useCallback(() => {
    if (!dragState.current) return;

    const { type, sourceIndex, currentIndex, element } = dragState.current;
    element.classList.remove('opacity-50');
    removeDragGhost();

    if (sourceIndex !== currentIndex) {
      // Update data order
      const newData = { ...data };
      if (type === 'row') {
        const [movedRow] = newData.rows.splice(sourceIndex, 1);
        newData.rows.splice(currentIndex, 0, movedRow);
        
        // Update row indices
        newData.rows.forEach((row, index) => {
          row.index = index;
        });
      } else {
        const [movedCol] = newData.columns.splice(sourceIndex, 1);
        newData.columns.splice(currentIndex, 0, movedCol);
        
        // Update column order
        newData.state.columnOrder = newData.columns.map(col => col.id);
      }

      setData(newData);
    }

    dragState.current = null;
    setIsDragging(false);
  }, [data, setData]);

  const handleRowDragStart = useCallback((
    index: number,
    element: HTMLElement,
    e: React.MouseEvent
  ) => {
    startDrag('row', index, element, e);
  }, [startDrag]);

  const handleColumnDragStart = useCallback((
    index: number,
    element: HTMLElement,
    e: React.MouseEvent
  ) => {
    startDrag('column', index, element, e);
  }, [startDrag]);

  return {
    isDragging,
    handleRowDragStart,
    handleColumnDragStart,
    handleDrag,
    endDrag,
  };
}
