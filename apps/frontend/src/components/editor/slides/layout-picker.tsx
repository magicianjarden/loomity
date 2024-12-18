'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DEFAULT_LAYOUTS } from './default-layouts';
import { SlideLayout } from './types';
import Image from 'next/image';

interface LayoutPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectLayout: (layout: SlideLayout) => void;
}

export function LayoutPicker({ open, onOpenChange, onSelectLayout }: LayoutPickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Choose a Layout</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-3 gap-4 p-4">
            {DEFAULT_LAYOUTS.map((layout) => (
              <button
                key={layout.id}
                onClick={() => {
                  onSelectLayout(layout);
                  onOpenChange(false);
                }}
                className="group relative aspect-video overflow-hidden rounded-lg border bg-muted p-2 hover:border-primary"
              >
                {/* Layout Preview */}
                <div className="relative h-full w-full">
                  <Image
                    src={layout.thumbnail}
                    alt={layout.name}
                    fill
                    className="object-contain"
                  />
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-sm font-medium">{layout.name}</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
