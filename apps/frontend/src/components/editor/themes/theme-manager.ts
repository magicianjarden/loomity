'use client';

import { editor } from 'monaco-editor';
import * as themes from './monaco-themes';

let themesInitialized = false;

// Map theme names to their definitions
const themeMap: Record<string, editor.IStandaloneThemeData> = {
  'monokai': themes.monokaiTheme,
  'dracula': themes.draculaTheme,
  'nord': themes.nordTheme,
  'aura': themes.auraTheme,
  'github-dark': themes.githubDarkTheme,
  'material-darker': themes.materialDarkerTheme,
  'night-owl': themes.nightOwlTheme,
  'solarized-dark': themes.solarizedDarkTheme,
  'tokyo-night': themes.tokyoNightTheme,
  'github-light': themes.githubLightTheme,
  'solarized-light': themes.solarizedLightTheme,
  'material-lighter': themes.materialLighterTheme,
  'min-light': themes.minLightTheme,
};

export const initializeThemes = async () => {
  if (typeof window === 'undefined' || themesInitialized) return;

  try {
    const monaco = await import('monaco-editor');
    
    // Define dark theme
    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1a1b26',
      },
    });

    // Define light theme
    monaco.editor.defineTheme('custom-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#ffffff',
      },
    });

    // Register all custom themes
    Object.entries(themeMap).forEach(([name, theme]) => {
      monaco.editor.defineTheme(name, theme);
    });

    themesInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Monaco themes:', error);
  }
};

export const setEditorTheme = async (editorInstance: typeof editor, themeName: string) => {
  if (typeof window === 'undefined') return;

  try {
    const monaco = await import('monaco-editor');
    
    // Handle built-in themes
    if (['vs-dark', 'vs', 'hc-black', 'hc-light'].includes(themeName)) {
      monaco.editor.setTheme(themeName);
      return;
    }

    // Handle custom themes
    if (themeMap[themeName]) {
      monaco.editor.setTheme(themeName);
      return;
    }

    // Fallback to vs-dark if theme not found
    console.warn(`Theme ${themeName} not found, falling back to vs-dark`);
    monaco.editor.setTheme('vs-dark');
  } catch (error) {
    console.error('Failed to set Monaco theme:', error);
  }
};
