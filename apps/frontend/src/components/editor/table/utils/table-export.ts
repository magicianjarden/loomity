import { TableData, TableCell, TableExportOptions, CellFormat } from '../table-types';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const formatCellForExport = (cell: TableCell, format?: CellFormat): string | number | boolean => {
  if (cell.value == null) return '';

  switch (format?.type) {
    case 'number':
      return Number(cell.value);
    case 'currency':
      return Number(cell.value);
    case 'percentage':
      return Number(cell.value) / 100;
    case 'date':
      return new Date(cell.value).toISOString();
    case 'boolean':
      return Boolean(cell.value);
    default:
      return String(cell.value);
  }
};

export const exportToCSV = (data: TableData, options: TableExportOptions): void => {
  const { includeHeaders = true, delimiter = ',' } = options;
  const rows: string[] = [];

  // Add headers
  if (includeHeaders) {
    rows.push(data.columns.map(col => `"${col.title}"`).join(delimiter));
  }

  // Add data rows
  data.rows.forEach(row => {
    const rowData = data.columns.map(col => {
      const cell = row.cells[col.id];
      const value = formatCellForExport(cell, col.format);
      return typeof value === 'string' ? `"${value}"` : value;
    });
    rows.push(rowData.join(delimiter));
  });

  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'table-export.csv');
};

export const exportToExcel = (data: TableData, options: TableExportOptions): void => {
  const { includeHeaders = true, sheetName = 'Sheet1' } = options;
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws: XLSX.WorkSheet = {};
  
  // Track the current row for XLSX
  let rowIndex = 0;

  // Add headers
  if (includeHeaders) {
    data.columns.forEach((col, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
      ws[cellRef] = { 
        v: col.title,
        t: 's',
        s: { font: { bold: true } }
      };
    });
    rowIndex++;
  }

  // Add data rows
  data.rows.forEach(row => {
    data.columns.forEach((col, colIndex) => {
      const cell = row.cells[col.id];
      const value = formatCellForExport(cell, col.format);
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });

      // Set cell value and type
      const cellData: any = { v: value };

      // Set cell type based on value and format
      if (typeof value === 'number') {
        cellData.t = 'n';
        if (col.format?.type === 'currency') {
          cellData.z = `$#,##0.00;[Red]-$#,##0.00`;
        } else if (col.format?.type === 'percentage') {
          cellData.z = '0.00%';
        }
      } else if (typeof value === 'boolean') {
        cellData.t = 'b';
      } else if (col.format?.type === 'date') {
        cellData.t = 'd';
        cellData.z = col.format.dateFormat || 'yyyy-mm-dd';
      } else {
        cellData.t = 's';
      }

      // Set cell style
      if (cell.style) {
        cellData.s = {
          fill: cell.style.backgroundColor ? {
            fgColor: { rgb: cell.style.backgroundColor.replace('#', '') }
          } : undefined,
          font: {
            bold: cell.style.fontWeight === 'bold',
            italic: cell.style.fontStyle === 'italic',
            color: { rgb: cell.style.color?.replace('#', '') }
          },
          alignment: {
            horizontal: cell.style.textAlign,
            vertical: cell.style.verticalAlign
          }
        };
      }

      ws[cellRef] = cellData;
    });
    rowIndex++;
  });

  // Set column widths
  const colWidths = data.columns.map(col => ({
    wch: Math.max(
      (col.title?.length || 0) + 2,
      Math.min(50, col.width ? Math.floor(col.width / 7) : 10)
    )
  }));
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate and save file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, 'table-export.xlsx');
};

export const exportTable = (data: TableData, options: TableExportOptions): void => {
  switch (options.format) {
    case 'csv':
      exportToCSV(data, options);
      break;
    case 'xlsx':
      exportToExcel(data, options);
      break;
    case 'json':
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json;charset=utf-8;' 
      });
      saveAs(blob, 'table-export.json');
      break;
  }
};
