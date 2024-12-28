import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Upload, FileSpreadsheet, FileJson, FileText } from 'lucide-react';
import { useTableStore } from '../table-store';
import { exportTable, importTable } from '../utils';
import { TableExportOptions, TableImportOptions } from '../table-types';

export const TableToolbarExport: React.FC = () => {
  const { data, setData } = useTableStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = (format: TableExportOptions['format']) => {
    const options: TableExportOptions = {
      format,
      includeHeaders: true,
      sheetName: 'Table Data'
    };
    exportTable(data, options);
  };

  const handleImport = async (file: File) => {
    try {
      const format = file.name.split('.').pop()?.toLowerCase() as TableImportOptions['format'];
      if (!format || !['csv', 'xlsx', 'json'].includes(format)) {
        throw new Error('Unsupported file format');
      }

      const options: TableImportOptions = {
        format,
        hasHeaders: true,
      };

      const importedData = await importTable(file, options);
      setData(importedData);
    } catch (error) {
      console.error('Import failed:', error);
      // TODO: Show error toast
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImport(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleExport('xlsx')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export to Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileText className="h-4 w-4 mr-2" />
            Export to CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('json')}>
            <FileJson className="h-4 w-4 mr-2" />
            Export to JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".csv,.xlsx,.json"
        onChange={handleFileSelect}
      />
    </div>
  );
};
