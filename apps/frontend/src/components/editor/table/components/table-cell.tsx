import React, { useCallback, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TableCell as ITableCell, TableColumn, CellFormat } from '../table-types';
import { useTableStore } from '../table-store';

interface TableCellProps {
  rowId: string;
  columnId: string;
  cell: ITableCell;
  column: TableColumn;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: () => void;
}

const formatValue = (value: any, format?: CellFormat): string => {
  if (value == null) return '';
  
  if (!format) return String(value);

  switch (format.type) {
    case 'number':
      return Number(value).toFixed(format.precision || 0);
    case 'currency':
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: format.currency || 'USD',
      }).format(Number(value));
    case 'percentage':
      return new Intl.NumberFormat(undefined, {
        style: 'percent',
        minimumFractionDigits: format.precision || 0,
      }).format(Number(value) / 100);
    case 'date':
      return new Date(value).toLocaleDateString(undefined, {
        dateStyle: format.dateFormat as any || 'short',
      });
    case 'boolean':
      return value ? '✓' : '✗';
    default:
      return String(value);
  }
};

export const TableCell: React.FC<TableCellProps> = ({
  rowId,
  columnId,
  cell,
  column,
  isSelected,
  onMouseDown,
  onMouseMove,
}) => {
  const { updateCell } = useTableStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setEditValue(cell.value?.toString() || '');
  }, [cell.value]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editValue !== cell.value?.toString()) {
      let parsedValue: any = editValue;

      // Parse value based on column format
      if (column.format) {
        switch (column.format.type) {
          case 'number':
          case 'currency':
          case 'percentage':
            parsedValue = parseFloat(editValue);
            break;
          case 'date':
            parsedValue = new Date(editValue).toISOString();
            break;
          case 'boolean':
            parsedValue = Boolean(editValue);
            break;
        }
      }

      updateCell(rowId, columnId, parsedValue);
    }
  }, [editValue, cell.value, column.format, rowId, columnId, updateCell]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(cell.value?.toString() || '');
    }
  }, [cell.value, handleBlur]);

  const displayValue = formatValue(cell.value, column.format);

  return (
    <td
      className={cn(
        'relative border px-4 py-2',
        isSelected && 'bg-blue-100',
        cell.style?.backgroundColor && `bg-[${cell.style.backgroundColor}]`,
        column.frozen && 'sticky',
        column.frozen === 'left' && 'left-0',
        column.frozen === 'right' && 'right-0',
      )}
      style={{
        ...cell.style,
        width: column.width,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="w-full h-full border-none bg-white p-1 outline-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <>
          <span
            className={cn(
              'block truncate',
              cell.style?.textAlign && `text-${cell.style.textAlign}`,
            )}
          >
            {displayValue}
          </span>
          {cell.error && (
            <div className="absolute bottom-0 right-0 text-red-500 text-xs">
              ⚠️
            </div>
          )}
          {cell.comment && (
            <div className="absolute top-0 right-0 text-gray-400 text-xs">
              💭
            </div>
          )}
        </>
      )}
    </td>
  );
};
