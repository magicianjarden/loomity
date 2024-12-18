'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Play, Settings } from 'lucide-react';

interface PresentationToolbarProps {
  editor: Editor;
  onStartPresentation: () => void;
}

export function PresentationToolbar({ editor, onStartPresentation }: PresentationToolbarProps) {
  const slideCount = editor.view.dom.querySelectorAll('.slide-block').length;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={onStartPresentation}
        disabled={slideCount === 0}
      >
        <Play className="h-4 w-4" />
        Present
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              // TODO: Implement export to PowerPoint
              console.log('Export to PowerPoint');
            }}
          >
            Export to PowerPoint
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              // TODO: Implement export to PDF
              console.log('Export to PDF');
            }}
          >
            Export to PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="text-sm text-gray-500">
        {slideCount} {slideCount === 1 ? 'slide' : 'slides'}
      </div>
    </div>
  );
}
