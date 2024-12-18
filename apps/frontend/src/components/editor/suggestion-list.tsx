import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface CommandItem {
  title: string;
  icon: LucideIcon;
  command: (props: any) => void;
  keywords: string[];
}

interface SuggestionListProps {
  items: CommandItem[];
  command: (props: any) => void;
}

export const SuggestionList = forwardRef((props: SuggestionListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandGroup className="h-full overflow-hidden p-1">
        {props.items.length ? (
          props.items.map((item, index) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={index}
                onSelect={() => selectItem(index)}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 text-sm aria-selected:bg-accent',
                  index === selectedIndex && 'bg-accent text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </CommandItem>
            );
          })
        ) : (
          <div className="px-2 py-2.5 text-sm text-muted-foreground">
            No blocks found
          </div>
        )}
      </CommandGroup>
    </Command>
  );
});
