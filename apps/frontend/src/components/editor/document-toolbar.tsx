'use client';

import * as React from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, 
  Heading1, Heading2, Heading3,
  Link, Image, Table
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DocumentToolbarProps {
  onFormatText: (format: string) => void;
  onInsertElement: (element: string) => void;
}

export function DocumentToolbar({ onFormatText, onInsertElement }: DocumentToolbarProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 flex items-center gap-2 sticky top-0 z-10">
      {/* Text Style Group */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onFormatText('bold')}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onFormatText('italic')}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onFormatText('underline')}>
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Alignment Group */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onFormatText('align-left')}>
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onFormatText('align-center')}>
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onFormatText('align-right')}>
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Headings Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Heading1 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onFormatText('h1')}>
            <Heading1 className="h-4 w-4 mr-2" />
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFormatText('h2')}>
            <Heading2 className="h-4 w-4 mr-2" />
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFormatText('h3')}>
            <Heading3 className="h-4 w-4 mr-2" />
            Heading 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6" />

      {/* Lists Group */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onFormatText('bullet-list')}>
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onFormatText('numbered-list')}>
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Insert Elements Group */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onInsertElement('link')}>
          <Link className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onInsertElement('image')}>
          <Image className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onInsertElement('table')}>
          <Table className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
