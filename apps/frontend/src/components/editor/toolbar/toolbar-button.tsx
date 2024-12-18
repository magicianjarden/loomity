'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  tooltip: string;
  isActive?: boolean;
}

export function ToolbarButton({
  icon: Icon,
  tooltip,
  isActive,
  ...props
}: ToolbarButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={isActive ? 'bg-accent' : ''}
            {...props}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
