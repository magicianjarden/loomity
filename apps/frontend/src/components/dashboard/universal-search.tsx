import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, File, FileText, Layout, 
  Command as CommandIcon, Clock, Settings, 
  Keyboard, Folder, FolderOpen, 
  ScrollText, BookOpen, Files,
  Boxes
} from 'lucide-react';
import { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from 'cmdk';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { TextHighlight } from '@/components/ui/text-highlight';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogTitle, DialogDescription } from '@radix-ui/react-dialog';
import { useTheme } from 'next-themes';

interface UniversalSearchProps {
  currentContext: string;
  className?: string;
}

type SearchResult = {
  id: string;
  title: string;
  path?: string;
  type: 'document' | 'file' | 'page' | 'command' | 'setting' | 'workspace' | 'folder';
  action?: () => Promise<void>;
  requiresInput?: boolean;
  inputPlaceholder?: string;
  shortcut?: string;
  description?: string;
  lastModified?: string;
};

const defaultCommands = [
  {
    id: 'create-file',
    title: 'Create New File',
    description: 'Create a new file in the current workspace',
    shortcut: '/c',
    type: 'command' as const,
    requiresInput: true,
    inputPlaceholder: 'Enter file name...'
  },
  {
    id: 'delete-file',
    title: 'Delete File',
    description: 'Delete selected file',
    shortcut: '/d',
    type: 'command' as const,
    requiresInput: true,
    inputPlaceholder: 'Enter file name to delete...'
  },
  {
    id: 'settings',
    title: 'Open Settings',
    description: 'Open application settings',
    shortcut: '/s',
    type: 'command' as const
  },
  {
    id: 'help',
    title: 'Search Help',
    description: 'View search tips and shortcuts',
    shortcut: '/h',
    type: 'command' as const
  },
  {
    id: 'search-files',
    title: 'Search Files',
    description: 'Search only files',
    shortcut: '/f',
    type: 'command' as const
  },
  {
    id: 'search-pages',
    title: 'Search Pages',
    description: 'Search only pages',
    shortcut: '/p',
    type: 'command' as const
  },
  {
    id: 'search-workspaces',
    title: 'Search Workspaces',
    description: 'Search only workspaces',
    shortcut: '/w',
    type: 'command' as const
  },
  {
    id: 'toggle-theme',
    title: 'Toggle Dark Mode',
    description: 'Switch between light and dark themes',
    shortcut: '/t',
    type: 'command' as const
  },
  {
    id: 'system-theme',
    title: 'Use System Theme',
    description: 'Match your system theme preference',
    shortcut: '/ts',
    type: 'command' as const
  }
];

const settings = [
  { id: 'theme', title: 'Theme Settings', path: '/settings/theme', type: 'setting' as const },
  { id: 'profile', title: 'Profile Settings', path: '/settings/profile', type: 'setting' as const },
  { id: 'notifications', title: 'Notification Settings', path: '/settings/notifications', type: 'setting' as const },
  { id: 'security', title: 'Security Settings', path: '/settings/security', type: 'setting' as const }
];

export function UniversalSearch({ currentContext, className }: UniversalSearchProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>(defaultCommands);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [flatResults, setFlatResults] = useState<SearchResult[]>([]);
  const [inputMode, setInputMode] = useState<{
    active: boolean;
    command?: SearchResult;
    inputValue: string;
  }>({
    active: false,
    inputValue: ''
  });

  const groupedResults = useMemo(() => {
    return results.reduce((acc, result) => {
      const group = result.type || 'other';
      if (!acc[group]) acc[group] = [];
      acc[group].push(result);
      return acc;
    }, {} as Record<string, SearchResult[]>);
  }, [results]);

  useEffect(() => {
    const newFlatResults = Object.values(groupedResults).flatMap(group => group);
    setFlatResults(newFlatResults);
    setSelectedIndex(0); // Reset selection when results change
  }, [groupedResults]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }

      if (e.key === 'Escape' && open) {
        e.preventDefault();
        if (inputMode.active) {
          setInputMode({ active: false, inputValue: '' });
        } else {
          setOpen(false);
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, inputMode.active]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < flatResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : prev
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          handleSelect(flatResults[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (inputMode.active) {
          setInputMode({ active: false, inputValue: '' });
          setQuery('');
        } else {
          setOpen(false);
        }
        break;
    }
  };

  const handleSelect = (item: SearchResult) => {
    if (item.type === 'command') {
      handleCommand(item);
    } else if (item.path) {
      router.push(item.path);
    } else if (item.action) {
      item.action();
    }
    setOpen(false);
  };

  const handleCommand = async (command: SearchResult) => {
    switch (command.id) {
      case 'create-file':
        if (command.requiresInput) {
          // Keep the dialog open for input
          setQuery('/c ');
          return;
        }
        break;

      case 'delete-file':
        if (command.requiresInput) {
          setQuery('/d ');
          return;
        }
        break;

      case 'settings':
        router.push('/dashboard/settings');
        break;

      case 'help':
        router.push('/help');
        break;

      case 'search-files':
        setQuery('/f ');
        return;

      case 'search-pages':
        setQuery('/p ');
        return;

      case 'search-workspaces':
        setQuery('/w ');
        return;

      case 'toggle-theme':
        setTheme(theme === 'dark' ? 'light' : 'dark');
        toast.success(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
        break;

      case 'system-theme':
        setTheme('system');
        toast.success('Using system theme preference');
        break;
    }

    // Close the modal after command execution
    setOpen(false);
  };

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery) {
      setResults(defaultCommands);
      return;
    }

    setLoading(true);

    try {
      let searchResults: SearchResult[] = [];

      // Search commands if query starts with /
      if (searchQuery.startsWith('/')) {
        searchResults = defaultCommands.filter(cmd => 
          cmd.shortcut.includes(searchQuery.toLowerCase()) ||
          cmd.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        // Search files in Supabase
        const { data: files, error } = await supabase
          .from('documents')
          .select('*')
          .ilike('title', `%${searchQuery}%`)
          .limit(10);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        const fileResults = (files || []).map(file => ({
          id: file.id,
          title: file.title,
          path: file.path ? (file.path.startsWith('/') ? file.path : `/${file.path}`) : '/',
          type: file.is_workspace ? 'workspace' : 
                file.type === 'doc' ? 'document' : 
                file.type || 'file',
          lastModified: file.updated_at,
          description: file.content ? `${file.content.substring(0, 100)}...` : undefined
        }));

        // Search settings
        const settingsResults = settings.filter(setting =>
          setting.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

        searchResults = [...fileResults, ...settingsResults];
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search]);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'workspace':
        return <Boxes className="h-4 w-4" />;
      case 'document':
        return <ScrollText className="h-4 w-4" />;
      case 'folder':
        return <Folder className="h-4 w-4" />;
      case 'file':
        return <Files className="h-4 w-4" />;
      case 'page':
        return <BookOpen className="h-4 w-4" />;
      case 'command':
        return <CommandIcon className="h-4 w-4" />;
      case 'setting':
        return <Settings className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getGroupLabel = (type: string) => {
    switch (type) {
      case 'document':
        return 'Documents';
      case 'workspace':
        return 'Workspaces';
      case 'folder':
        return 'Folders';
      case 'file':
        return 'Files';
      case 'page':
        return 'Pages';
      case 'command':
        return 'Commands';
      case 'setting':
        return 'Settings';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode.command) {
      await handleCommand(inputMode.command);
      setInputMode({ active: false, inputValue: '' });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative w-full justify-start text-sm text-muted-foreground",
          "flex items-center gap-2",
          className
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="inline-flex truncate">
          Search or type a command...
        </span>
        <kbd className="pointer-events-none absolute right-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      {open && (
        <CommandDialog
          open={open}
          onOpenChange={setOpen}
          className={cn(
            "rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1),0_12px_28px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.2),0_12px_28px_rgba(0,0,0,0.2)] border-0",
            className
          )}
        >
          <VisuallyHidden asChild>
            <DialogTitle>Search documents and commands</DialogTitle>
          </VisuallyHidden>
          <VisuallyHidden asChild>
            <DialogDescription>
              Search across your documents, or type / to access commands
            </DialogDescription>
          </VisuallyHidden>
          <Command 
            shouldFilter={!inputMode.active}
            className="[&_[cmdk-root]]:overflow-hidden [&_[cmdk-root]]:bg-transparent [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
          >
            <div className="fixed inset-0 z-[999] bg-background/80 backdrop-blur-sm">
              <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-background rounded-xl border-0 shadow-lg">
                {inputMode.active ? (
                  <form onSubmit={handleInputSubmit} className="flex items-center px-4 py-3">
                    <CommandIcon className="mr-2 h-5 w-5 shrink-0 text-muted-foreground" />
                    <input
                      value={inputMode.inputValue}
                      onChange={(e) => setInputMode(prev => ({ ...prev, inputValue: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      className={cn(
                        "flex h-10 w-full bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
                        "focus-visible:outline-none"
                      )}
                      placeholder={inputMode.command?.inputPlaceholder}
                      autoFocus
                    />
                    <Button 
                      type="submit" 
                      size="sm"
                      variant="ghost"
                      className="ml-2"
                    >
                      Enter
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center px-4 py-3">
                    <Search className="mr-2 h-5 w-5 shrink-0 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={cn(
                        "flex h-10 w-full bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
                        "focus-visible:outline-none"
                      )}
                      placeholder="Search or type / for commands..."
                      autoFocus
                    />
                    <kbd className="ml-auto hidden h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[12px] font-medium opacity-100 sm:flex">
                      ESC
                    </kbd>
                  </div>
                )}
                <div className="relative">
                  {loading ? (
                    <div className="p-8 text-sm text-muted-foreground text-center">
                      Searching...
                    </div>
                  ) : results.length > 0 ? (
                    <div className="max-h-[60vh] overflow-y-auto">
                      {Object.entries(groupedResults).map(([group, items]) => (
                        items.length > 0 && (
                          <CommandGroup key={group} heading={getGroupLabel(group)}>
                            {items.map((result, index) => (
                              <CommandItem
                                key={result.id}
                                onSelect={() => handleSelect(result)}
                                className={cn(
                                  'group flex items-center gap-3 px-3 py-2.5',
                                  'aria-selected:bg-accent/50 dark:aria-selected:bg-accent/30',
                                  'transition-colors duration-150 ease-out'
                                )}
                              >
                                <div className={cn(
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                                  "bg-background/80 dark:bg-background/50",
                                  "border border-border/50 dark:border-border/30",
                                  "group-aria-selected:border-border/80 dark:group-aria-selected:border-border/50",
                                  "transition-colors duration-150 ease-out",
                                  result.type === 'workspace' && "bg-primary/5 dark:bg-primary/10 border-primary/20"
                                )}>
                                  {getIconForType(result.type)}
                                </div>
                                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                  <TextHighlight 
                                    text={result.title} 
                                    query={query}
                                    className="font-medium text-[13px] truncate text-foreground/90"
                                  />
                                  {result.description && (
                                    <TextHighlight 
                                      text={result.description
                                        .replace(/<p><\/p>/g, '') // Remove empty paragraphs
                                        .replace(/<\/p><p>/g, ' • ') // Replace paragraph breaks with dots
                                        .replace(/<[^>]+>/g, '') // Remove all other HTML tags
                                        .replace(/\s+/g, ' ') // Normalize whitespace
                                        .trim()
                                      }
                                      query={query}
                                      className="text-xs text-muted-foreground/70 truncate"
                                    />
                                  )}
                                  {result.path && (
                                    <div className="flex items-center gap-1">
                                      <TextHighlight 
                                        text={result.path}
                                        query={query}
                                        className="text-[10px] text-muted-foreground/50 truncate font-medium"
                                      />
                                    </div>
                                  )}
                                </div>
                                {result.shortcut && (
                                  <kbd className={cn(
                                    "ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded select-none",
                                    "bg-muted/30 dark:bg-muted/20",
                                    "text-muted-foreground/50 dark:text-muted-foreground/40",
                                    "border border-border/30 dark:border-border/20",
                                    "group-aria-selected:bg-muted/50 dark:group-aria-selected:bg-muted/30",
                                    "transition-colors duration-150 ease-out"
                                  )}>
                                    {result.shortcut}
                                  </kbd>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )
                      ))}
                    </div>
                  ) : query ? (
                    <div className="p-8 text-sm text-muted-foreground text-center">
                      No results found
                    </div>
                  ) : (
                    <div className="p-8 text-sm text-muted-foreground text-center flex flex-col items-center gap-2">
                      <Keyboard className="h-12 w-12 text-muted-foreground/50" />
                      <div>
                        <p>Type to search across your workspace</p>
                        <p className="text-xs text-muted-foreground">Or type / to see available commands</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Command>
        </CommandDialog>
      )}
    </>
  );
}
