import React from 'react';
import { cn } from '@/lib/utils';
import { TableRow as ITableRow } from '../table-types';
import { TableCell } from './table-cell';
import { useTableStore } from '../table-store';
import { useTableSelection } from '../hooks/use-table-selection';

interface TableRowProps {
  row: ITableRow;
  isSelected?: boolean;
  onRowSelect?: (rowId: string) => void;
}

export const TableRow: React.FC<TableRowProps> = ({
  row,
  isSelected,
  onRowSelect,
}) => {
  const { data } = useTableStore();
  const { handleMouseDown, handleMouseMove, isSelected: isCellSelected } = useTableSelection();

  return (
    <tr
      className={cn(
        'group relative',
        isSelected && 'bg-blue-50',
        row.style?.backgroundColor && `bg-[${row.style.backgroundColor}]`,
      )}
      style={{
        height: row.height,
        ...row.style,
      }}
    >
      {/* Row selector */}
      <td className="w-8 border px-2 sticky left-0 bg-white">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onRowSelect?.(row.id)}
          className="rounded border-gray-300"
        />
      </td>

      {/* Row cells */}
      {data.columns.map((column) => {
        const cell = row.cells[column.id];
        if (!cell || column.hidden) return null;

        return (
          <TableCell
            key={column.id}
            rowId={row.id}
            columnId={column.id}
            cell={cell}
            column={column}
            isSelected={isCellSelected(row.id, column.id)}
            onMouseDown={(e) => handleMouseDown(row.id, column.id, e)}
            onMouseMove={() => handleMouseMove(row.id, column.id)}
          />
        );
      })}

      {/* Row detail expander */}
      {row.detailContent && (
        <tr className={cn(
          'border-t',
          row.isExpanded ? 'table-row' : 'hidden'
        )}>
          <td colSpan={data.columns.length + 1} className="p-4">
            {row.detailContent}
          </td>
        </tr>
      )}
    </tr>
  );
};
