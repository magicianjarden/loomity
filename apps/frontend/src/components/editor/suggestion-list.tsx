'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Command, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { CommandItem as SuggestionItem, filterCommandItems } from './extensions/suggestions';
import dynamic from 'next/dynamic';

interface SuggestionListProps {
  items: SuggestionItem[];
  command: (props: any) => void;
}

const DynamicIcon = dynamic(() => Promise.resolve(({ icon: Icon, ...props }: any) => {
  const IconComponent = Icon;
  return <IconComponent {...props} />;
}), { ssr: false });

export const SuggestionList = forwardRef((props: SuggestionListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const filteredItems = filterCommandItems(props.items, query);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectItem = (index: number) => {
    const item = filteredItems[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + filteredItems.length - 1) % filteredItems.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % filteredItems.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems.length]);

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

  if (!mounted) {
    return null;
  }

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput
        placeholder="Type a command or search..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandGroup className="max-h-[300px] overflow-auto p-1">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <CommandItem
              key={index}
              onSelect={() => selectItem(index)}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 text-sm aria-selected:bg-accent',
                index === selectedIndex && 'bg-accent text-accent-foreground'
              )}
            >
              <DynamicIcon icon={item.icon} className="h-4 w-4" />
              <div className="flex flex-col">
                <span>{item.title}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </div>
            </CommandItem>
          ))
        ) : (
          <div className="px-2 py-2.5 text-sm text-muted-foreground">
            No commands found
          </div>
        )}
      </CommandGroup>
    </Command>
  );
});
