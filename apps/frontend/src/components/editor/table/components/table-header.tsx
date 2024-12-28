import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { TableColumn, TableSort } from '../table-types';
import { useTableStore } from '../table-store';
import {
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  GripVertical,
  Pin,
  Filter,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TableHeaderProps {
  column: TableColumn;
  sort?: TableSort;
  onSort?: (columnId: string, desc: boolean) => void;
  onResize?: (columnId: string, width: number) => void;
  onPin?: (columnId: string, position: 'left' | 'right' | null) => void;
  onFilter?: (columnId: string, value: any) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  column,
  sort,
  onSort,
  onResize,
  onPin,
  onFilter,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    resizeStartX.current = e.clientX;
    startWidth.current = column.width || 100;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const diff = e.clientX - resizeStartX.current;
      const newWidth = Math.max(column.minWidth || 50, startWidth.current + diff);
      
      if (onResize) {
        onResize(column.id, newWidth);
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleSort = () => {
    if (!column.sortable || !onSort) return;
    
    const isDesc = sort?.id === column.id && !sort.desc;
    onSort(column.id, isDesc);
  };

  return (
    <th
      className={cn(
        'group relative border px-4 py-2 font-semibold',
        column.frozen && 'sticky',
        column.frozen === 'left' && 'left-0',
        column.frozen === 'right' && 'right-0',
        isResizing && 'select-none',
      )}
      style={{
        width: column.width,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            'flex items-center gap-2',
            column.sortable && 'cursor-pointer'
          )}
          onClick={handleSort}
        >
          <span>{column.title}</span>
          {column.sortable && (
            <span className="text-gray-400">
              {sort?.id === column.id ? (
                sort.desc ? <ArrowDown size={16} /> : <ArrowUp size={16} />
              ) : (
                <ArrowUpDown size={16} />
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {column.filterable && (
            <button
              className="p-1 hover:bg-gray-100 rounded"
              onClick={() => onFilter?.(column.id, null)}
            >
              <Filter size={16} />
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {column.frozen ? (
                <DropdownMenuItem onClick={() => onPin?.(column.id, null)}>
                  Unpin Column
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => onPin?.(column.id, 'left')}>
                    Pin Left
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPin?.(column.id, 'right')}>
                    Pin Right
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  // Hide column
                }}
              >
                Hide Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {column.resizable !== false && (
            <div
              className="absolute right-0 top-0 h-full w-1 cursor-col-resize group-hover:bg-blue-400"
              onMouseDown={handleResizeStart}
            />
          )}
        </div>
      </div>
    </th>
  );
};
