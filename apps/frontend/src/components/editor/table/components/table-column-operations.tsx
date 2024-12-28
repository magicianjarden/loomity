import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash,
  Copy,
  Plus,
  ArrowUpDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Hash,
  DollarSign,
  Percent,
  Calendar,
  Check,
} from 'lucide-react';
import { useTableStore } from '../table-store';
import { TableColumn, CellFormat } from '../table-types';
import { getTableHistory } from '../utils/table-history';

interface TableColumnOperationsProps {
  column: TableColumn;
  index: number;
  onDragStart: (index: number, element: HTMLElement, e: React.MouseEvent) => void;
}

export const TableColumnOperations: React.FC<TableColumnOperationsProps> = ({
  column,
  index,
  onDragStart,
}) => {
  const { data, setData } = useTableStore();

  const handleAddColumn = (position: 'before' | 'after') => {
    const newData = { ...data };
    const newColumn: TableColumn = {
      id: crypto.randomUUID(),
      title: 'New Column',
      format: { type: 'text' },
    };

    // Insert column at correct position
    newData.columns.splice(position === 'before' ? index : index + 1, 0, newColumn);

    // Add cells for the new column to all rows
    newData.rows.forEach(row => {
      row.cells[newColumn.id] = {
        id: crypto.randomUUID(),
        value: null,
      };
    });

    // Update column order
    newData.state.columnOrder = newData.columns.map(col => col.id);

    setData(newData);
    getTableHistory(data).record(newData);
  };

  const handleDuplicateColumn = () => {
    const newData = { ...data };
    const duplicatedColumn: TableColumn = {
      id: crypto.randomUUID(),
      ...column,
      title: `${column.title} (Copy)`,
    };

    newData.columns.splice(index + 1, 0, duplicatedColumn);

    // Duplicate cells
    newData.rows.forEach(row => {
      row.cells[duplicatedColumn.id] = {
        id: crypto.randomUUID(),
        ...row.cells[column.id],
      };
    });

    // Update column order
    newData.state.columnOrder = newData.columns.map(col => col.id);

    setData(newData);
    getTableHistory(data).record(newData);
  };

  const handleDeleteColumn = () => {
    const newData = { ...data };
    newData.columns = newData.columns.filter(col => col.id !== column.id);

    // Remove cells from all rows
    newData.rows.forEach(row => {
      delete row.cells[column.id];
    });

    // Update column order
    newData.state.columnOrder = newData.columns.map(col => col.id);

    setData(newData);
    getTableHistory(data).record(newData);
  };

  const handleMoveColumn = (direction: 'left' | 'right') => {
    if (
      (direction === 'left' && index === 0) ||
      (direction === 'right' && index === data.columns.length - 1)
    ) {
      return;
    }

    const newData = { ...data };
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    const [movedColumn] = newData.columns.splice(index, 1);
    newData.columns.splice(targetIndex, 0, movedColumn);

    // Update column order
    newData.state.columnOrder = newData.columns.map(col => col.id);

    setData(newData);
    getTableHistory(data).record(newData);
  };

  const handleSetFormat = (format: CellFormat['type']) => {
    const newData = { ...data };
    const targetColumn = newData.columns[index];
    
    targetColumn.format = {
      type: format,
      ...(format === 'currency' && { currency: 'USD' }),
      ...(format === 'number' && { precision: 2 }),
      ...(format === 'percentage' && { precision: 2 }),
      ...(format === 'date' && { dateFormat: 'short' }),
    };

    // Convert existing values to new format
    newData.rows.forEach(row => {
      const cell = row.cells[column.id];
      if (cell?.value != null) {
        switch (format) {
          case 'number':
          case 'currency':
          case 'percentage':
            cell.value = Number(cell.value) || 0;
            break;
          case 'date':
            cell.value = new Date(cell.value).toISOString();
            break;
          case 'boolean':
            cell.value = Boolean(cell.value);
            break;
          default:
            cell.value = String(cell.value);
        }
      }
    });

    setData(newData);
    getTableHistory(data).record(newData);
  };

  const handleSetAlignment = (alignment: 'left' | 'center' | 'right') => {
    const newData = { ...data };
    const targetColumn = newData.columns[index];
    
    if (!targetColumn.style) {
      targetColumn.style = {};
    }
    targetColumn.style.textAlign = alignment;

    setData(newData);
    getTableHistory(data).record(newData);
  };

  const handleToggleVisibility = () => {
    const newData = { ...data };
    const targetColumn = newData.columns[index];
    targetColumn.hidden = !targetColumn.hidden;

    // Update visibility state
    newData.state.columnVisibility[targetColumn.id] = !targetColumn.hidden;

    setData(newData);
    getTableHistory(data).record(newData);
  };

  const handleToggleLock = () => {
    const newData = { ...data };
    const targetColumn = newData.columns[index];
    targetColumn.locked = !targetColumn.locked;
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
          const element = e.currentTarget.closest('th');
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
          <DropdownMenuItem onClick={() => handleAddColumn('before')}>
            <Plus className="h-4 w-4 mr-2" />
            Insert Column Left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddColumn('after')}>
            <Plus className="h-4 w-4 mr-2" />
            Insert Column Right
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicateColumn}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate Column
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleMoveColumn('left')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Move Left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleMoveColumn('right')}>
            <ChevronRight className="h-4 w-4 mr-2" />
            Move Right
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Type className="h-4 w-4 mr-2" />
              Column Format
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleSetFormat('text')}>
                <Type className="h-4 w-4 mr-2" />
                Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSetFormat('number')}>
                <Hash className="h-4 w-4 mr-2" />
                Number
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSetFormat('currency')}>
                <DollarSign className="h-4 w-4 mr-2" />
                Currency
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSetFormat('percentage')}>
                <Percent className="h-4 w-4 mr-2" />
                Percentage
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSetFormat('date')}>
                <Calendar className="h-4 w-4 mr-2" />
                Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSetFormat('boolean')}>
                <Check className="h-4 w-4 mr-2" />
                Boolean
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <AlignLeft className="h-4 w-4 mr-2" />
              Alignment
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={column.style?.textAlign || 'left'}
                onValueChange={(value) => handleSetAlignment(value as any)}
              >
                <DropdownMenuRadioItem value="left">
                  <AlignLeft className="h-4 w-4 mr-2" />
                  Left
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="center">
                  <AlignCenter className="h-4 w-4 mr-2" />
                  Center
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="right">
                  <AlignRight className="h-4 w-4 mr-2" />
                  Right
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleToggleVisibility}>
            {column.hidden ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Column
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Column
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleToggleLock}>
            {column.locked ? (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Column
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Lock Column
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleDeleteColumn}
            className="text-red-600 focus:text-red-600"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete Column
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
