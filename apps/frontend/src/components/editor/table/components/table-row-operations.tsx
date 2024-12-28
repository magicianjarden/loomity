import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  ChevronUp,
  Trash,
  Copy,
  Plus,
  ArrowUpDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from 'lucide-react';
import { useTableStore } from '../table-store';
import { TableRow } from '../table-types';
import { getTableHistory } from '../utils/table-history';

interface TableRowOperationsProps {
  row: TableRow;
  index: number;
  onDragStart: (index: number, element: HTMLElement, e: React.MouseEvent) => void;
}

export const TableRowOperations: React.FC<TableRowOperationsProps> = ({
  row,
  index,
  onDragStart,
}) => {
  const { data, setData } = useTableStore();

  const handleAddRow = (position: 'before' | 'after') => {
    const newData = { ...data };
    const newRow: TableRow = {
      id: crypto.randomUUID(),
      index: position === 'before' ? index : index + 1,
      cells: {},
    };

    // Initialize cells for all columns
    newData.columns.forEach(col => {
      newRow.cells[col.id] = {
        id: crypto.randomUUID(),
        value: null,
      };
    });

    // Insert row at correct position
    newData.rows.splice(position === 'before' ? index : index + 1, 0, newRow);

    // Update indices for all rows after insertion
    for (let i = position === 'before' ? index : index + 1; i < newData.rows.length; i++) {
      newData.rows[i].index = i;
    }

    setData(newData);
    getTableHistory(data).record(newData);
  };

  const handleDuplicateRow = () => {
    const newData = { ...data };
    const duplicatedRow: TableRow = {
      id: crypto.randomUUID(),
      index: index + 1,
      cells: {},
      ...row,
    };

    // Deep copy cells
    Object.entries(row.cells).forEach(([colId, cell]) => {
      duplicatedRow.cells[colId] = {
        id: crypto.randomUUID(),
        ...cell,
      };
    });

    newData.rows.splice(index + 1, 0, duplicatedRow);

    // Update indices
    for (let i = index + 1; i < newData.rows.length; i++) {
      newData.rows[i].index = i;
    }

    setData(newData);
    getTableHistory(data).record(newData);
  };

  const handleDeleteRow = () => {
    const newData = { ...data };
    newData.rows.splice(index, 1);

    // Update indices
    newData.rows.forEach((row, i) => {
      row.index = i;
    });

    setData(newData);
    getTableHistory(data).record(newData);
  };

  const handleMoveRow = (direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === data.rows.length - 1)
    ) {
      return;
    }

    const newData = { ...data };
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const [movedRow] = newData.rows.splice(index, 1);
    newData.rows.splice(targetIndex, 0, movedRow);

    // Update indices
    newData.rows.forEach((row, i) => {
      row.index = i;
    });

    setData(newData);
    getTableHistory(data).record(newData);
  };

  const handleToggleVisibility = () => {
    const newData = { ...data };
    const targetRow = newData.rows[index];
    targetRow.hidden = !targetRow.hidden;
    setData(newData);
    getTableHistory(data).record(newData);
  };

  const handleToggleLock = () => {
    const newData = { ...data };
    const targetRow = newData.rows[index];
    targetRow.locked = !targetRow.locked;
    setData(newData);
    getTableHistory(data).record(newData);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="cursor-move"
        onMouseDown={(e) => {
          const element = e.currentTarget.closest('tr');
          if (element) {
            onDragStart(index, element, e);
          }
        }}
      >
        <ArrowUpDown className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleAddRow('before')}>
            <Plus className="h-4 w-4 mr-2" />
            Insert Row Above
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddRow('after')}>
            <Plus className="h-4 w-4 mr-2" />
            Insert Row Below
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicateRow}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate Row
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleMoveRow('up')}>
            <ChevronUp className="h-4 w-4 mr-2" />
            Move Up
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleMoveRow('down')}>
            <ChevronDown className="h-4 w-4 mr-2" />
            Move Down
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleToggleVisibility}>
            {row.hidden ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Row
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Row
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleToggleLock}>
            {row.locked ? (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Row
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Lock Row
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleDeleteRow}
            className="text-red-600 focus:text-red-600"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete Row
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
