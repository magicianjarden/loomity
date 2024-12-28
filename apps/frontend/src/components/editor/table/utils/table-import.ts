import { TableData, TableImportOptions, TableColumn, TableRow, TableCell } from '../table-types';
import * as XLSX from 'xlsx';

const inferColumnFormat = (values: any[]): TableColumn['format'] => {
  // Skip empty values
  values = values.filter(v => v != null && v !== '');
  if (values.length === 0) return { type: 'text' };

  // Check if all values are numbers
  const numbers = values.every(v => !isNaN(Number(v)));
  if (numbers) {
    // Check if values look like currency
    if (values.some(v => String(v).includes('$'))) {
      return { type: 'currency', currency: 'USD' };
    }
    // Check if values look like percentages
    if (values.some(v => String(v).includes('%'))) {
      return { type: 'percentage' };
    }
    return { type: 'number' };
  }

  // Check if all values are dates
  const dates = values.every(v => !isNaN(Date.parse(v)));
  if (dates) {
    return { type: 'date' };
  }

  // Check if all values are booleans
  const booleans = values.every(v => 
    typeof v === 'boolean' || 
    ['true', 'false', '1', '0', 'yes', 'no'].includes(String(v).toLowerCase())
  );
  if (booleans) {
    return { type: 'boolean' };
  }

  // Default to text
  return { type: 'text' };
};

const parseCellValue = (value: any, format: TableColumn['format']): any => {
  if (value == null) return null;

  switch (format?.type) {
    case 'number':
    case 'currency':
      return Number(String(value).replace(/[$,]/g, ''));
    case 'percentage':
      return Number(String(value).replace('%', '')) * 100;
    case 'date':
      return new Date(value).toISOString();
    case 'boolean':
      if (typeof value === 'boolean') return value;
      const str = String(value).toLowerCase();
      return ['true', '1', 'yes'].includes(str);
    default:
      return String(value);
  }
};

const parseExcelStyles = (cell: XLSX.CellObject): TableCell['style'] => {
  if (!cell.s) return undefined;

  const style: TableCell['style'] = {};

  // Background color
  if (cell.s.fill?.fgColor?.rgb) {
    style.backgroundColor = `#${cell.s.fill.fgColor.rgb}`;
  }

  // Font styles
  if (cell.s.font) {
    if (cell.s.font.bold) style.fontWeight = 'bold';
    if (cell.s.font.italic) style.fontStyle = 'italic';
    if (cell.s.font.color?.rgb) style.color = `#${cell.s.font.color.rgb}`;
  }

  // Alignment
  if (cell.s.alignment) {
    style.textAlign = cell.s.alignment.horizontal as any;
    style.verticalAlign = cell.s.alignment.vertical as any;
  }

  return Object.keys(style).length > 0 ? style : undefined;
};

export const importFromCSV = async (file: File, options: TableImportOptions): Promise<TableData> => {
  const text = await file.text();
  const { hasHeaders = true, delimiter = ',' } = options;

  // Parse CSV
  const lines = text.split('\n').map(line => 
    line.split(delimiter).map(cell => 
      cell.trim().replace(/^"|"$/g, '')
    )
  );

  if (lines.length === 0) {
    throw new Error('Empty CSV file');
  }

  // Create columns
  const headerRow = lines[0];
  const columns: TableColumn[] = headerRow.map((title, index) => ({
    id: crypto.randomUUID(),
    title: hasHeaders ? title : `Column ${index + 1}`,
    format: inferColumnFormat(lines.slice(hasHeaders ? 1 : 0).map(row => row[index]))
  }));

  // Create rows
  const dataRows = hasHeaders ? lines.slice(1) : lines;
  const rows: TableRow[] = dataRows.map((row, rowIndex) => ({
    id: crypto.randomUUID(),
    index: rowIndex,
    cells: columns.reduce((acc, col, colIndex) => ({
      ...acc,
      [col.id]: {
        id: crypto.randomUUID(),
        value: parseCellValue(row[colIndex], col.format)
      }
    }), {})
  }));

  return {
    columns,
    rows,
    state: {
      sorting: [],
      filters: [],
      grouping: [],
      columnOrder: columns.map(col => col.id),
      columnVisibility: {},
      columnPinning: {},
      rowSelection: {},
      expandedRows: {},
    }
  };
};

export const importFromExcel = async (file: File, options: TableImportOptions): Promise<TableData> => {
  const { hasHeaders = true, sheetName } = options;
  
  // Read Excel file
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  
  // Get worksheet
  const ws = sheetName ? 
    workbook.Sheets[sheetName] : 
    workbook.Sheets[workbook.SheetNames[0]];

  if (!ws) {
    throw new Error('Worksheet not found');
  }

  // Convert to array of arrays
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  const rows: any[][] = [];
  
  for (let r = range.s.r; r <= range.e.r; r++) {
    const row: any[] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      row.push(cell ? cell.v : null);
    }
    rows.push(row);
  }

  // Create columns
  const headerRow = rows[0];
  const columns: TableColumn[] = headerRow.map((title, index) => ({
    id: crypto.randomUUID(),
    title: hasHeaders ? title : `Column ${index + 1}`,
    format: inferColumnFormat(rows.slice(hasHeaders ? 1 : 0).map(row => row[index])),
    width: (ws['!cols']?.[index]?.wch || 10) * 7
  }));

  // Create rows
  const dataRows = hasHeaders ? rows.slice(1) : rows;
  const tableRows: TableRow[] = dataRows.map((row, rowIndex) => ({
    id: crypto.randomUUID(),
    index: rowIndex,
    cells: columns.reduce((acc, col, colIndex) => {
      const excelCell = ws[XLSX.utils.encode_cell({ 
        r: hasHeaders ? rowIndex + 1 : rowIndex, 
        c: colIndex 
      })];
      
      return {
        ...acc,
        [col.id]: {
          id: crypto.randomUUID(),
          value: parseCellValue(row[colIndex], col.format),
          style: excelCell ? parseExcelStyles(excelCell) : undefined
        }
      };
    }, {})
  }));

  return {
    columns,
    rows: tableRows,
    state: {
      sorting: [],
      filters: [],
      grouping: [],
      columnOrder: columns.map(col => col.id),
      columnVisibility: {},
      columnPinning: {},
      rowSelection: {},
      expandedRows: {},
    }
  };
};

export const importTable = async (file: File, options: TableImportOptions): Promise<TableData> => {
  switch (options.format) {
    case 'csv':
      return importFromCSV(file, options);
    case 'xlsx':
      return importFromExcel(file, options);
    case 'json':
      const text = await file.text();
      return JSON.parse(text);
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }
};
