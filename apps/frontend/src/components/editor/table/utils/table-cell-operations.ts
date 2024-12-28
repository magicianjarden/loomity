import { TableData, TableSelection, TableCell, CellValidation } from '../table-types';

interface CellRange {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

export const getCellRange = (data: TableData, selection: TableSelection): CellRange | null => {
  if (!selection.focus) return null;

  const startRowIndex = data.rows.findIndex(row => row.id === selection.anchor.rowId);
  const endRowIndex = data.rows.findIndex(row => row.id === selection.focus.rowId);
  const startColIndex = data.columns.findIndex(col => col.id === selection.anchor.columnId);
  const endColIndex = data.columns.findIndex(col => col.id === selection.focus.columnId);

  if (startRowIndex === -1 || endRowIndex === -1 || startColIndex === -1 || endColIndex === -1) {
    return null;
  }

  return {
    startRow: Math.min(startRowIndex, endRowIndex),
    endRow: Math.max(startRowIndex, endRowIndex),
    startCol: Math.min(startColIndex, endColIndex),
    endCol: Math.max(startColIndex, endColIndex),
  };
};

export const mergeCells = (data: TableData, selection: TableSelection): Partial<TableData> => {
  const range = getCellRange(data, selection);
  if (!range) return {};

  const newData = { ...data };
  const { startRow, endRow, startCol, endCol } = range;

  // Get the merged value (use the top-left cell's value)
  const topLeftCell = newData.rows[startRow].cells[newData.columns[startCol].id];
  const mergedValue = topLeftCell.value;

  // Create the merged cell
  const mergedCell: TableCell = {
    id: crypto.randomUUID(),
    value: mergedValue,
    rowspan: endRow - startRow + 1,
    colspan: endCol - startCol + 1,
    style: topLeftCell.style,
    format: topLeftCell.format,
    validation: topLeftCell.validation,
    comment: topLeftCell.comment,
  };

  // Update the grid
  for (let i = startRow; i <= endRow; i++) {
    for (let j = startCol; j <= endCol; j++) {
      const row = newData.rows[i];
      const col = newData.columns[j];

      if (i === startRow && j === startCol) {
        // Set the merged cell in the top-left position
        row.cells[col.id] = mergedCell;
      } else {
        // Mark other cells as part of the merged cell
        row.cells[col.id] = {
          id: crypto.randomUUID(),
          value: null,
          mergeRef: {
            rowId: newData.rows[startRow].id,
            columnId: newData.columns[startCol].id,
          },
        };
      }
    }
  }

  return newData;
};

export const splitCells = (data: TableData, selection: TableSelection): Partial<TableData> => {
  const range = getCellRange(data, selection);
  if (!range) return {};

  const newData = { ...data };
  const { startRow, endRow, startCol, endCol } = range;

  // Get the merged cell
  const mergedCell = newData.rows[startRow].cells[newData.columns[startCol].id];
  if (!mergedCell.rowspan || !mergedCell.colspan) return {};

  // Split the cells
  for (let i = startRow; i <= endRow; i++) {
    for (let j = startCol; j <= endCol; j++) {
      const row = newData.rows[i];
      const col = newData.columns[j];

      row.cells[col.id] = {
        id: crypto.randomUUID(),
        value: i === startRow && j === startCol ? mergedCell.value : null,
        style: mergedCell.style,
        format: mergedCell.format,
        validation: mergedCell.validation,
      };
    }
  }

  return newData;
};

export const validateCell = (
  value: any,
  validation?: CellValidation,
  format?: TableCell['format']
): string | null => {
  if (!validation) return null;

  // Required check
  if (validation.required && (value == null || value === '')) {
    return validation.errorMessage || 'This field is required';
  }

  // Skip other validations if value is empty and not required
  if (value == null || value === '') return null;

  // Type-specific validations
  if (format) {
    switch (format.type) {
      case 'number':
      case 'currency':
      case 'percentage': {
        const num = Number(value);
        if (isNaN(num)) {
          return 'Invalid number format';
        }
        if (validation.min != null && num < validation.min) {
          return `Value must be at least ${validation.min}`;
        }
        if (validation.max != null && num > validation.max) {
          return `Value must be at most ${validation.max}`;
        }
        break;
      }
      case 'date': {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return 'Invalid date format';
        }
        if (validation.min && new Date(value) < new Date(validation.min)) {
          return `Date must be after ${new Date(validation.min).toLocaleDateString()}`;
        }
        if (validation.max && new Date(value) > new Date(validation.max)) {
          return `Date must be before ${new Date(validation.max).toLocaleDateString()}`;
        }
        break;
      }
    }
  }

  // Pattern validation
  if (validation.pattern) {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(String(value))) {
      return validation.errorMessage || 'Invalid format';
    }
  }

  // Custom validation
  if (validation.customValidation && !validation.customValidation(value)) {
    return validation.errorMessage || 'Invalid value';
  }

  return null;
};

export const addCellComment = (
  data: TableData,
  rowId: string,
  columnId: string,
  comment: string
): Partial<TableData> => {
  const newData = { ...data };
  const row = newData.rows.find(r => r.id === rowId);
  if (!row) return {};

  const cell = row.cells[columnId];
  if (!cell) return {};

  cell.comment = comment;
  return newData;
};

export const removeCellComment = (
  data: TableData,
  rowId: string,
  columnId: string
): Partial<TableData> => {
  const newData = { ...data };
  const row = newData.rows.find(r => r.id === rowId);
  if (!row) return {};

  const cell = row.cells[columnId];
  if (!cell) return {};

  delete cell.comment;
  return newData;
};
