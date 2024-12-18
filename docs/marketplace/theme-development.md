# Theme Development Guide

This guide will help you create themes for the Loomity marketplace. Themes can customize the look and feel of the editor and its components through a powerful theming system.

## Table of Contents
- [Getting Started](#getting-started)
- [Theme Structure](#theme-structure)
- [Theme Variables](#theme-variables)
- [Component Styling](#component-styling)
- [Best Practices](#best-practices)
- [Publishing](#publishing)

## Getting Started

To create a theme, you'll need to implement the `ThemeDefinition` interface:

```typescript
interface ThemeDefinition {
  metadata: ThemeMetadata;
  variables: ThemeVariables;
  customStyles?: string;
}
```

### Theme Metadata

```typescript
interface ThemeMetadata {
  id: string;          // Unique identifier for your theme
  name: string;        // Display name
  description: string; // Short description
  version: string;     // Semantic version (e.g., "1.0.0")
  author: string;      // Your name or organization
  tags: string[];      // Search tags
  preview: string;     // URL to theme preview image
}
```

## Theme Structure

Here's a basic theme template:

```typescript
export default {
  metadata: {
    id: "my-awesome-theme",
    name: "My Awesome Theme",
    description: "A beautiful theme for Loomity",
    version: "1.0.0",
    author: "Your Name",
    tags: ["dark", "modern"],
    preview: "https://example.com/theme-preview.png"
  },

  variables: {
    colors: {
      primary: "#0066cc",
      secondary: "#6c757d",
      background: "#ffffff",
      foreground: "#000000",
      muted: "#f8f9fa"
    },
    typography: {
      fontFamily: "system-ui, sans-serif",
      fontSize: {
        base: "16px",
        small: "14px",
        large: "18px"
      },
      lineHeight: {
        base: "1.5",
        heading: "1.2"
      }
    },
    spacing: {
      small: "0.5rem",
      medium: "1rem",
      large: "2rem"
    },
    borderRadius: {
      small: "0.25rem",
      medium: "0.5rem",
      large: "1rem"
    },
    shadows: {
      small: "0 1px 3px rgba(0,0,0,0.12)",
      medium: "0 4px 6px rgba(0,0,0,0.12)",
      large: "0 10px 15px rgba(0,0,0,0.12)"
    }
  },

  customStyles: `
    /* Optional: Add custom CSS */
    .editor-content {
      padding: var(--spacing-medium);
    }
  `
};
```

## Theme Variables

### Colors

The color system supports:
- Primary and secondary colors
- Background and foreground colors
- State colors (success, warning, error)
- Semantic colors (text, border, etc.)

```typescript
interface ColorVariables {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  muted: string;
  success?: string;
  warning?: string;
  error?: string;
  border?: string;
  [key: string]: string | undefined;
}
```

### Typography

Control font families, sizes, and line heights:

```typescript
interface TypographyVariables {
  fontFamily: string;
  fontSize: {
    base: string;
    small: string;
    large: string;
    [key: string]: string;
  };
  lineHeight: {
    base: string;
    heading: string;
    [key: string]: string;
  };
}
```

### Spacing

Define consistent spacing units:

```typescript
interface SpacingVariables {
  small: string;
  medium: string;
  large: string;
  [key: string]: string;
}
```

### Border Radius

Control component corner rounding:

```typescript
interface BorderRadiusVariables {
  small: string;
  medium: string;
  large: string;
  [key: string]: string;
}
```

### Shadows

Define elevation levels:

```typescript
interface ShadowVariables {
  small: string;
  medium: string;
  large: string;
  [key: string]: string;
}
```

## Component Styling

Themes automatically style core components through CSS variables:

### Buttons

```css
.button {
  background-color: var(--color-primary);
  border-radius: var(--radius-medium);
  padding: var(--spacing-small) var(--spacing-medium);
  box-shadow: var(--shadow-small);
}
```

### Typography

```css
body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: var(--color-foreground);
  background-color: var(--color-background);
}
```

## Best Practices

1. **Color Accessibility**
   - Ensure sufficient contrast ratios
   - Test with color blindness simulators
   - Provide dark/light mode variants

2. **Consistency**
   - Use theme variables consistently
   - Follow spacing scale
   - Maintain visual hierarchy

3. **Performance**
   - Minimize custom CSS
   - Use system fonts when possible
   - Optimize images

4. **Responsive Design**
   - Test on different screen sizes
   - Use relative units
   - Consider mobile-first approach

## Publishing

1. **Prepare Your Theme**
   - Test in different browsers
   - Update version number
   - Create preview images

2. **Package Structure**
   ```
   my-theme/
   ├── package.json
   ├── README.md
   ├── src/
   │   └── index.ts
   └── preview/
       └── theme-preview.png
   ```

3. **Submit to Marketplace**
   - Create a marketplace account
   - Submit your theme for review
   - Provide required metadata and previews

### Publishing API

```typescript
import { marketplaceSDK } from '@loomity/marketplace';

await marketplaceSDK.publishItem({
  type: 'theme',
  name: 'My Theme',
  description: 'Theme description',
  version: '1.0.0',
  content: myThemeDefinition,
  previewImages: ['url1', 'url2'],
  tags: ['dark', 'modern']
});
```

## Example Themes

Check out these example themes:
- [Modern Dark](examples/modern-dark)
- [Light Professional](examples/light-professional)
- [Vintage Paper](examples/vintage-paper)
