import { TableData, TableSelection, TableCell, TableClipboard } from '../table-types';

interface CellPosition {
  rowId: string;
  columnId: string;
}

interface ClipboardData {
  text: string;
  html: string;
  cells: Record<string, Record<string, TableCell>>;
  format: 'text' | 'html' | 'cells';
}

const formatCellForClipboard = (cell: TableCell): string => {
  if (cell.value == null) return '';
  return String(cell.value);
};

const createHTMLTable = (
  data: TableData,
  selection: TableSelection
): string => {
  const rows = new Set<string>();
  const cols = new Set<string>();
  const selectedCells = getSelectedCells(data, selection);
  
  selectedCells.forEach(cell => {
    rows.add(cell.rowId);
    cols.add(cell.columnId);
  });

  const rowIds = Array.from(rows);
  const colIds = Array.from(cols);

  let html = '<table border="1" style="border-collapse: collapse;">';

  // Add header row
  html += '<tr>';
  colIds.forEach(colId => {
    const column = data.columns.find(col => col.id === colId);
    html += `<th style="padding: 4px;">${column?.title || ''}</th>`;
  });
  html += '</tr>';

  // Add data rows
  rowIds.forEach(rowId => {
    const row = data.rows.find(r => r.id === rowId);
    if (!row) return;

    html += '<tr>';
    colIds.forEach(colId => {
      const cell = row.cells[colId];
      const style = cell?.style ? 
        Object.entries(cell.style)
          .map(([key, value]) => `${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${value}`)
          .join('; ') 
        : '';
      
      html += `<td style="padding: 4px; ${style}">${formatCellForClipboard(cell)}</td>`;
    });
    html += '</tr>';
  });

  html += '</table>';
  return html;
};

const getSelectedCells = (
  data: TableData,
  selection: TableSelection
): CellPosition[] => {
  if (selection.type === 'cell') {
    return [selection.anchor];
  }

  if (selection.type === 'range' && selection.focus) {
    const startRowIndex = data.rows.findIndex(row => row.id === selection.anchor.rowId);
    const endRowIndex = data.rows.findIndex(row => row.id === selection.focus.rowId);
    const startColIndex = data.columns.findIndex(col => col.id === selection.anchor.columnId);
    const endColIndex = data.columns.findIndex(col => col.id === selection.focus.columnId);

    const minRow = Math.min(startRowIndex, endRowIndex);
    const maxRow = Math.max(startRowIndex, endRowIndex);
    const minCol = Math.min(startColIndex, endColIndex);
    const maxCol = Math.max(startColIndex, endColIndex);

    const cells: CellPosition[] = [];
    for (let i = minRow; i <= maxRow; i++) {
      for (let j = minCol; j <= maxCol; j++) {
        cells.push({
          rowId: data.rows[i].id,
          columnId: data.columns[j].id,
        });
      }
    }
    return cells;
  }

  return [];
};

export const copyToClipboard = async (
  data: TableData,
  selection: TableSelection
): Promise<TableClipboard> => {
  const selectedCells = getSelectedCells(data, selection);
  if (selectedCells.length === 0) {
    throw new Error('No cells selected');
  }

  // Create plain text version (tab-separated)
  const textRows: string[][] = [];
  let currentRow = '';
  let lastRowId = '';

  selectedCells.forEach(cell => {
    const row = data.rows.find(r => r.id === cell.rowId);
    if (!row) return;

    if (lastRowId !== cell.rowId) {
      if (currentRow) textRows.push([currentRow]);
      currentRow = '';
      lastRowId = cell.rowId;
    }

    const cellValue = formatCellForClipboard(row.cells[cell.columnId]);
    currentRow += (currentRow ? '\t' : '') + cellValue;
  });
  if (currentRow) textRows.push([currentRow]);

  // Create HTML version
  const html = createHTMLTable(data, selection);

  // Create structured cell data
  const cells: Record<string, Record<string, TableCell>> = {};
  selectedCells.forEach(cell => {
    const row = data.rows.find(r => r.id === cell.rowId);
    if (!row) return;

    if (!cells[cell.rowId]) {
      cells[cell.rowId] = {};
    }
    cells[cell.rowId][cell.columnId] = { ...row.cells[cell.columnId] };
  });

  // Copy to clipboard
  const clipboardData: ClipboardData = {
    text: textRows.join('\n'),
    html,
    cells,
    format: 'cells'
  };

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([clipboardData.text], { type: 'text/plain' }),
        'text/html': new Blob([clipboardData.html], { type: 'text/html' }),
      })
    ]);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }

  return {
    type: selection.type,
    data: clipboardData,
    format: 'cells'
  };
};

export const pasteFromClipboard = async (
  data: TableData,
  targetCell: CellPosition
): Promise<Partial<TableData>> => {
  try {
    const clipboardText = await navigator.clipboard.readText();
    const rows = clipboardText.split('\n');
    const updates: Partial<TableData> = {
      rows: [...data.rows]
    };

    // Find target indices
    const targetRowIndex = data.rows.findIndex(row => row.id === targetCell.rowId);
    const targetColIndex = data.columns.findIndex(col => col.id === targetCell.columnId);
    if (targetRowIndex === -1 || targetColIndex === -1) {
      throw new Error('Invalid target cell');
    }

    // Parse and apply clipboard data
    rows.forEach((row, rowOffset) => {
      const cells = row.split('\t');
      const targetRow = data.rows[targetRowIndex + rowOffset];
      if (!targetRow) return;

      cells.forEach((cellValue, colOffset) => {
        const targetCol = data.columns[targetColIndex + colOffset];
        if (!targetCol) return;

        if (!targetRow.cells[targetCol.id]) {
          targetRow.cells[targetCol.id] = {
            id: crypto.randomUUID(),
            value: null
          };
        }

        targetRow.cells[targetCol.id] = {
          ...targetRow.cells[targetCol.id],
          value: cellValue.trim()
        };
      });
    });

    return updates;
  } catch (error) {
    console.error('Failed to paste from clipboard:', error);
    return {};
  }
};
