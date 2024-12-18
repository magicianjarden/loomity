---
sidebar_position: 1
---

# Creating Plugins

This guide will walk you through creating your first Loomity plugin.

## Plugin Structure

A Loomity plugin consists of:

1. A plugin manifest (`plugin.json`)
2. Source code files
3. Optional assets and resources

### Plugin Manifest

Every plugin needs a `plugin.json` file:

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "A description of my plugin",
  "author": "Your Name",
  "permissions": [
    "document:read",
    "ui:toast"
  ],
  "dependencies": {
    "@prettier/plugin-typescript": "^10.0.0"
  }
}
```

### Plugin Entry Point

Create your main plugin file (e.g., `index.ts`):

```typescript
import type { Plugin, PluginContext } from '@loomity/core';

const plugin: Plugin = {
  // Plugin manifest properties are automatically injected
  
  activate: async (context: PluginContext) => {
    // Plugin initialization code
    context.api.ui.showToast('Plugin activated!');
  },
  
  deactivate: async () => {
    // Cleanup code
  }
};

export default plugin;
```

## Development Workflow

1. **Setup Development Environment**
   ```bash
   npm create loomity-plugin my-plugin
   cd my-plugin
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Test Your Plugin**
   ```bash
   npm test
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Plugin Lifecycle

Plugins have several lifecycle events:

1. **Installation**: Plugin is uploaded and validated
2. **Activation**: Plugin is started and initialized
3. **Deactivation**: Plugin is stopped and cleaned up
4. **Uninstallation**: Plugin is removed from the system

## Best Practices

1. **Error Handling**
   ```typescript
   activate: async (context) => {
     try {
       const content = await context.api.document.read();
       // Process content
     } catch (error) {
       context.api.ui.showToast('Failed to read document', 'error');
     }
   }
   ```

2. **Resource Cleanup**
   ```typescript
   let cleanup: (() => void) | undefined;
   
   activate: async (context) => {
     cleanup = context.api.on('document:change', () => {
       // Handle document changes
     });
   },
   
   deactivate: async () => {
     cleanup?.();
   }
   ```

3. **Type Safety**
   ```typescript
   import { Plugin, PluginContext } from '@loomity/core';
   
   const plugin: Plugin = {
     // TypeScript will ensure your plugin matches the expected interface
   };
   ```

## Next Steps

- Learn about [Plugin Permissions](permissions.md)
- Explore the [API Reference](../api/plugin-api.md)
- Check out [Example Plugins](../examples/basic-plugin.md)
