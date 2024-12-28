'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Minimize2, Hash } from 'lucide-react';

interface CodeMetrics {
  lines: number;
  characters: number;
}

interface CodeStatus {
  isFullscreen: boolean;
  isExecuting: boolean;
  hasError: boolean;
  errorMessage?: string;
  executionOutput?: string;
}

interface CodeStatusBarProps {
  metrics?: CodeMetrics;
  status?: CodeStatus;
  wordWrap?: boolean;
  minimap?: boolean;
  lineNumbers?: boolean;
  onToggleWordWrap?: () => void;
  onToggleMinimap?: () => void;
  onToggleLineNumbers?: () => void;
}

export function CodeStatusBar({
  metrics = { lines: 0, characters: 0 },
  status = { 
    isFullscreen: false, 
    isExecuting: false, 
    hasError: false 
  },
  wordWrap = true,
  minimap = true,
  lineNumbers = true,
  onToggleWordWrap,
  onToggleMinimap,
  onToggleLineNumbers,
}: CodeStatusBarProps) {
  return (
    <div className="flex items-center justify-between border-t bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>
          {metrics.lines} {metrics.lines === 1 ? 'line' : 'lines'}
        </span>
        <span>·</span>
        <span>
          {metrics.characters}{' '}
          {metrics.characters === 1 ? 'character' : 'characters'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {onToggleWordWrap && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={onToggleWordWrap}
          >
            <Minimize2 className="mr-1 h-3 w-3" />
            {wordWrap ? 'Wrap' : 'No Wrap'}
          </Button>
        )}
        {onToggleMinimap && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={onToggleMinimap}
          >
            <Eye className="mr-1 h-3 w-3" />
            {minimap ? 'Minimap' : 'No Minimap'}
          </Button>
        )}
        {onToggleLineNumbers && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={onToggleLineNumbers}
          >
            <Hash className="mr-1 h-3 w-3" />
            {lineNumbers ? 'Numbers' : 'No Numbers'}
          </Button>
        )}
      </div>
      {status.executionOutput && (
        <div className="truncate text-xs">{status.executionOutput}</div>
      )}
      {status.hasError && (
        <div className="text-destructive text-xs">{status.errorMessage}</div>
      )}
    </div>
  );
}
