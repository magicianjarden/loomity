import { useState, useCallback, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useCommandActions, CommandAction } from './use-command-actions';
import { useDebounce } from './use-debounce';

type SearchResult = {
  id: string;
  title: string;
  path?: string;
  type: 'document' | 'workspace' | 'folder' | 'file' | 'page' | 'command' | 'setting';
  action?: () => Promise<void>;
  requiresInput?: boolean;
  inputPlaceholder?: string;
  shortcut?: string;
  description?: string;
  lastModified?: string;
};

type CommandType = {
  id: string;
  title: string;
  description: string;
  shortcut: string;
  action: CommandAction;
};

export function useUniversalSearch(currentContext: string) {
  const supabase = createClientComponentClient();
  const commandActions = useCommandActions();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState<{
    active: boolean;
    action?: () => Promise<void>;
    placeholder?: string;
  }>({ active: false });

  const searchInProgress = useRef(false);

  const commands: CommandType[] = [
    {
      id: 'create-file',
      title: 'Create New File',
      description: 'Create a new file in the current directory',
      shortcut: '/c',
      action: commandActions.createFile
    },
    {
      id: 'delete-file',
      title: 'Delete File',
      description: 'Delete selected file',
      shortcut: '/d',
      action: commandActions.deleteFile
    },
    {
      id: 'settings',
      title: 'Open Settings',
      description: 'Open application settings',
      shortcut: '/s',
      action: commandActions.navigateToSettings
    },
    {
      id: 'help',
      title: 'Search Help',
      description: 'View search tips and shortcuts',
      shortcut: '/h',
      action: commandActions.showHelp
    },
    {
      id: 'search-files',
      title: 'Search Files',
      description: 'Search only files',
      shortcut: '/f',
      action: commandActions.searchFiles
    },
    {
      id: 'search-pages',
      title: 'Search Pages',
      description: 'Search only pages',
      shortcut: '/p',
      action: commandActions.searchPages
    },
    {
      id: 'search-docs',
      title: 'Search Documents',
      description: 'Search only documents',
      shortcut: '/docs',
      action: commandActions.searchDocuments
    }
  ];

  const searchCommands = useCallback((searchQuery: string) => {
    if (!searchQuery) return [];
    
    // If query starts with '/', search commands
    if (searchQuery.startsWith('/')) {
      return commands.filter(cmd => 
        cmd.shortcut.includes(searchQuery.toLowerCase()) ||
        cmd.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(cmd => ({
        id: cmd.id,
        title: cmd.title,
        type: 'command' as const,
        description: cmd.description,
        shortcut: cmd.shortcut,
        action: cmd.action.execute,
        requiresInput: cmd.action.requiresInput,
        inputPlaceholder: cmd.action.inputPlaceholder
      }));
    }
    return [];
  }, [commands]);

  const searchSettings = useCallback(async (searchQuery: string) => {
    if (!searchQuery) return [];
    
    // Mock settings search - replace with actual settings data
    const settings = [
      { id: 'theme', title: 'Theme Settings', path: '/settings/theme' },
      { id: 'profile', title: 'Profile Settings', path: '/settings/profile' },
      { id: 'notifications', title: 'Notification Settings', path: '/settings/notifications' },
      { id: 'security', title: 'Security Settings', path: '/settings/security' }
    ];

    return settings
      .filter(setting => 
        setting.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(setting => ({
        ...setting,
        type: 'setting' as const
      }));
  }, []);

  const searchDatabase = useCallback(async (searchQuery: string) => {
    if (!supabase || !searchQuery) return [];

    try {
      console.log('Searching for:', searchQuery);

      // First, let's try a simple ILIKE search to verify the content exists
      const { data: rawResults, error: rawError } = await supabase
        .from('documents')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .limit(10);

      console.log('Raw ILIKE results:', rawResults);

      // Then try the full-text search
      const formattedQuery = searchQuery.trim().split(/\s+/).map(word => word + ':*').join(' & ');
      console.log('Formatted FTS query:', formattedQuery);

      const { data: ftsResults, error: ftsError } = await supabase
        .from('documents')
        .select('*')
        .or(`title_search.fts.${formattedQuery},content_search.fts.${formattedQuery}`)
        .limit(10);

      console.log('FTS results:', ftsResults);

      if (rawError || ftsError) {
        console.error('Search errors:', { rawError, ftsError });
        throw rawError || ftsError;
      }

      // Use raw results for now until we fix FTS
      const data = rawResults;

      console.log('Final results:', data);
      if (data) {
        data.forEach(item => {
          console.log('Document details:', {
            id: item.id,
            title: item.title,
            contentPreview: item.content ? item.content.substring(0, 100) : 'No content',
            hasContent: !!item.content,
            contentLength: item.content?.length,
            matches: {
              title: item.title?.toLowerCase().includes(searchQuery.toLowerCase()),
              content: item.content?.toLowerCase().includes(searchQuery.toLowerCase())
            }
          });
        });
      }

      const stripHtml = (html: string) => {
        if (!html) return '';
        
        // First pass: handle paragraphs and basic cleanup
        let cleaned = html
          .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs with potential whitespace
          .replace(/<p><br\s*\/?><\/p>/g, '') // Remove paragraphs with just line breaks
          .replace(/<br\s*\/?>/g, ' ') // Convert br tags to spaces
          .replace(/<\/p>\s*<p>/g, ' • ') // Convert paragraph breaks to dots
          .replace(/\s+/g, ' '); // Normalize whitespace

        // Second pass: remove all HTML tags
        cleaned = cleaned.replace(/<[^>]+>/g, '');

        // Third pass: clean up whitespace and special characters
        cleaned = cleaned
          .replace(/&nbsp;/g, ' ')
          .replace(/\s*•\s*/g, ' • ') // Normalize bullet points
          .trim();

        return cleaned;
      };

      const mappedResults = data.map(item => {
        // Use is_workspace flag to determine type
        const resultType = item.is_workspace ? 'workspace' : 
                         item.type === 'doc' ? 'document' : 
                         item.type;

        // Find the matching content snippet if search matched content
        let description;
        if (item.content) {
          const cleanContent = stripHtml(item.content);
          
          if (cleanContent.toLowerCase().includes(searchQuery.toLowerCase())) {
            const index = cleanContent.toLowerCase().indexOf(searchQuery.toLowerCase());
            const start = Math.max(0, index - 50);
            const end = Math.min(cleanContent.length, index + searchQuery.length + 50);
            description = start > 0 ? '...' : '';
            description += cleanContent.slice(start, end);
            description += end < cleanContent.length ? '...' : '';
          } else {
            // If no match, just show the first 100 characters of clean content
            description = cleanContent.substring(0, 100) + (cleanContent.length > 100 ? '...' : '');
          }
        }

        return {
          id: item.id,
          title: item.title,
          path: item.path,
          type: resultType,
          lastModified: item.updated_at,
          description
        };
      });

      console.log('Mapped results:', mappedResults);
      return mappedResults;
    } catch (error) {
      console.error('Error searching database:', error);
      return [];
    }
  }, [supabase]);

  useEffect(() => {
    const search = async () => {
      if (searchInProgress.current || !debouncedQuery) return;
      
      searchInProgress.current = true;
      setLoading(true);
      
      try {
        const commandResults = searchCommands(debouncedQuery);
        const settingsResults = await searchSettings(debouncedQuery);
        const databaseResults = await searchDatabase(debouncedQuery);

        setResults([
          ...commandResults,
          ...settingsResults,
          ...databaseResults
        ]);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
        searchInProgress.current = false;
      }
    };

    search();
  }, [debouncedQuery, searchCommands, searchSettings, searchDatabase]);

  const executeCommand = async (result: SearchResult) => {
    if (result.requiresInput) {
      setInputMode({
        active: true,
        action: result.action,
        placeholder: result.inputPlaceholder
      });
    } else if (result.action) {
      await result.action();
    }
  };

  const handleInput = async (input: string) => {
    if (inputMode.action) {
      await inputMode.action(input);
      setInputMode({ active: false });
      setQuery('');
    }
  };

  return {
    query,
    setQuery,
    results,
    loading,
    inputMode,
    executeCommand,
    handleInput
  };
}
