import { marketplaceSDK } from './marketplace-sdk';
import type { MarketplaceItem, ThemeContent } from './types';

export interface ThemeVariables {
  colors: Record<string, string>;
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    lineHeight: Record<string, string>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

export interface CompiledTheme {
  id: string;
  name: string;
  variables: ThemeVariables;
  cssVariables: Record<string, string>;
  styleSheet: string;
}

class ThemeSystem {
  private activeTheme: CompiledTheme | null = null;
  private themeCache: Map<string, CompiledTheme> = new Map();
  private styleElement: HTMLStyleElement | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'loomity-theme';
      document.head.appendChild(this.styleElement);
    }
  }

  async loadUserTheme(): Promise<void> {
    try {
      const installedItems = await marketplaceSDK.getUserInstalledItems();
      const themes = installedItems.filter(item => item.type === 'theme');
      
      // Use the first enabled theme, or default if none
      const activeTheme = themes.find(theme => {
        const installation = installedItems.find(i => i.id === theme.id);
        return installation?.enabled;
      });

      if (activeTheme) {
        await this.activateTheme(activeTheme.id);
      } else {
        this.loadDefaultTheme();
      }
    } catch (error) {
      console.error('Failed to load user theme:', error);
      this.loadDefaultTheme();
    }
  }

  private loadDefaultTheme(): void {
    const defaultTheme: CompiledTheme = {
      id: 'default',
      name: 'Default Theme',
      variables: {
        colors: {
          primary: '#0066cc',
          secondary: '#6c757d',
          background: '#ffffff',
          foreground: '#000000',
          muted: '#f8f9fa'
        },
        typography: {
          fontFamily: 'system-ui, sans-serif',
          fontSize: {
            base: '16px',
            small: '14px',
            large: '18px'
          },
          lineHeight: {
            base: '1.5',
            heading: '1.2'
          }
        },
        spacing: {
          small: '0.5rem',
          medium: '1rem',
          large: '2rem'
        },
        borderRadius: {
          small: '0.25rem',
          medium: '0.5rem',
          large: '1rem'
        },
        shadows: {
          small: '0 1px 3px rgba(0,0,0,0.12)',
          medium: '0 4px 6px rgba(0,0,0,0.12)',
          large: '0 10px 15px rgba(0,0,0,0.12)'
        }
      },
      cssVariables: {},
      styleSheet: ''
    };

    this.compileTheme(defaultTheme);
    this.applyTheme(defaultTheme);
  }

  async activateTheme(themeId: string): Promise<void> {
    try {
      // Check cache first
      if (this.themeCache.has(themeId)) {
        const theme = this.themeCache.get(themeId)!;
        this.applyTheme(theme);
        return;
      }

      // Load theme from marketplace
      const item = await marketplaceSDK.getItemById(themeId);
      const themeContent = item.content as ThemeContent;

      // Compile theme
      const compiledTheme = this.createCompiledTheme(item, themeContent);
      
      // Cache and apply
      this.themeCache.set(themeId, compiledTheme);
      this.applyTheme(compiledTheme);
    } catch (error) {
      console.error('Failed to activate theme:', error);
      this.loadDefaultTheme();
    }
  }

  private createCompiledTheme(item: MarketplaceItem, content: ThemeContent): CompiledTheme {
    const theme: CompiledTheme = {
      id: item.id,
      name: item.name,
      variables: {
        colors: content.colors,
        typography: content.typography,
        spacing: {
          small: '0.5rem',
          medium: '1rem',
          large: '2rem'
        },
        borderRadius: {
          small: '0.25rem',
          medium: '0.5rem',
          large: '1rem'
        },
        shadows: {
          small: '0 1px 3px rgba(0,0,0,0.12)',
          medium: '0 4px 6px rgba(0,0,0,0.12)',
          large: '0 10px 15px rgba(0,0,0,0.12)'
        }
      },
      cssVariables: {},
      styleSheet: ''
    };

    return this.compileTheme(theme);
  }

  private compileTheme(theme: CompiledTheme): CompiledTheme {
    // Convert theme variables to CSS variables
    const cssVariables: Record<string, string> = {};
    
    // Colors
    Object.entries(theme.variables.colors).forEach(([key, value]) => {
      cssVariables[`--color-${key}`] = value;
    });

    // Typography
    cssVariables['--font-family'] = theme.variables.typography.fontFamily;
    Object.entries(theme.variables.typography.fontSize).forEach(([key, value]) => {
      cssVariables[`--font-size-${key}`] = value;
    });
    Object.entries(theme.variables.typography.lineHeight).forEach(([key, value]) => {
      cssVariables[`--line-height-${key}`] = value;
    });

    // Spacing
    Object.entries(theme.variables.spacing).forEach(([key, value]) => {
      cssVariables[`--spacing-${key}`] = value;
    });

    // Border radius
    Object.entries(theme.variables.borderRadius).forEach(([key, value]) => {
      cssVariables[`--radius-${key}`] = value;
    });

    // Shadows
    Object.entries(theme.variables.shadows).forEach(([key, value]) => {
      cssVariables[`--shadow-${key}`] = value;
    });

    // Generate stylesheet
    const stylesheet = `
      :root {
        ${Object.entries(cssVariables)
          .map(([key, value]) => `${key}: ${value};`)
          .join('\n        ')}
      }

      /* Base styles */
      body {
        font-family: var(--font-family);
        font-size: var(--font-size-base);
        line-height: var(--line-height-base);
        color: var(--color-foreground);
        background-color: var(--color-background);
      }

      /* Component styles */
      .button {
        background-color: var(--color-primary);
        border-radius: var(--radius-medium);
        padding: var(--spacing-small) var(--spacing-medium);
        box-shadow: var(--shadow-small);
      }

      /* Add more component styles as needed */
    `;

    theme.cssVariables = cssVariables;
    theme.styleSheet = stylesheet;

    return theme;
  }

  private applyTheme(theme: CompiledTheme): void {
    if (this.styleElement) {
      this.styleElement.textContent = theme.styleSheet;
    }
    this.activeTheme = theme;
  }

  getActiveTheme(): CompiledTheme | null {
    return this.activeTheme;
  }

  getThemeVariables(): ThemeVariables | null {
    return this.activeTheme?.variables || null;
  }
}

// Export singleton instance
export const themeSystem = new ThemeSystem();
