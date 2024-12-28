'use client';

import React from 'react';
import { Editor } from '@tiptap/core';
import { ToolbarButton } from './toolbar-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { slideLayouts } from '../slides/slide-layouts';
import dynamic from 'next/dynamic';
import { Icon } from '@/components/ui/client-icon';
import { ElementType } from '../slides/types';

interface SlideToolbarProps {
  editor: Editor;
  showGrid: boolean;
  showRulers: boolean;
  showNotes: boolean;
  onToggleGrid: () => void;
  onToggleRulers: () => void;
  onToggleNotes: () => void;
  onLayoutSelect: (layoutId: string) => void;
  onFullscreen: () => void;
  onAddElement: (type: ElementType) => void;
  onToggleAnimation: () => void;
}

// Dynamically import the toolbar to avoid hydration issues
const SlideToolbarComponent = ({ 
  editor,
  showGrid,
  showRulers,
  showNotes,
  onToggleGrid,
  onToggleRulers,
  onToggleNotes,
  onLayoutSelect,
  onFullscreen,
  onAddElement,
  onToggleAnimation,
}: SlideToolbarProps) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 border-b bg-background/95 px-2 py-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <Icon name="Layout" className="h-4 w-4" />
            Layout
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {slideLayouts.map((layout) => (
            <DropdownMenuItem
              key={layout.id}
              onClick={() => onLayoutSelect(layout.id)}
            >
              <Icon name="Layout" className="h-4 w-4 mr-2" />
              {layout.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <Icon name="Layers" className="h-4 w-4" />
            Add Element
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => {
            console.log('Toolbar: Clicked text element');
            onAddElement('text');
          }}>
            <Icon name="Type" className="h-4 w-4 mr-2" />
            Text
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            console.log('Toolbar: Clicked shape element');
            onAddElement('shape');
          }}>
            <Icon name="Square" className="h-4 w-4 mr-2" />
            Shape
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            console.log('Toolbar: Clicked image element');
            onAddElement('image');
          }}>
            <Icon name="Image" className="h-4 w-4 mr-2" />
            Image
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            console.log('Toolbar: Clicked code element');
            onAddElement('code');
          }}>
            <Icon name="Code2" className="h-4 w-4 mr-2" />
            Code
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            console.log('Toolbar: Clicked table element');
            onAddElement('table');
          }}>
            <Icon name="Table" className="h-4 w-4 mr-2" />
            Table
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            console.log('Toolbar: Clicked chart element');
            onAddElement('chart');
          }}>
            <Icon name="BarChart3" className="h-4 w-4 mr-2" />
            Chart
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log('Toolbar: Clicked animation button');
          onToggleAnimation();
        }}
        className="gap-2"
      >
        <Icon name="Presentation" className="h-4 w-4" />
        Animations
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log('Toolbar: Clicked grid button');
          onToggleGrid();
        }}
        className="gap-2"
        data-active={showGrid}
      >
        <Icon name="Grid" className="h-4 w-4" />
        Grid
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log('Toolbar: Clicked rulers button');
          onToggleRulers();
        }}
        className="gap-2"
        data-active={showRulers}
      >
        <Icon name="Ruler" className="h-4 w-4" />
        Rulers
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log('Toolbar: Clicked notes button');
          onToggleNotes();
        }}
        className="gap-2"
        data-active={showNotes}
      >
        <Icon name="StickyNote" className="h-4 w-4" />
        Notes
      </Button>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log('Toolbar: Clicked fullscreen button');
          onFullscreen();
        }}
        className="gap-2"
      >
        <Icon name="Maximize2" className="h-4 w-4" />
        Present
      </Button>
    </div>
  );
};

// Export the dynamic component with SSR disabled
export const SlideToolbar = dynamic(() => Promise.resolve(SlideToolbarComponent), {
  ssr: false,
});
