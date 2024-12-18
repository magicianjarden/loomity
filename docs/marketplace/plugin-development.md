# Plugin Development Guide

This guide will help you create plugins for the Loomity marketplace. Plugins can extend the editor's functionality, add new UI elements, and integrate with external services.

## Table of Contents
- [Getting Started](#getting-started)
- [Plugin Structure](#plugin-structure)
- [Plugin API](#plugin-api)
- [UI Integration](#ui-integration)
- [Best Practices](#best-practices)
- [Publishing](#publishing)

## Getting Started

To create a plugin, you'll need to implement the `PluginDefinition` interface:

```typescript
interface PluginDefinition {
  metadata: PluginMetadata;
  initialize: (context: PluginContext) => Promise<void>;
  activate: () => Promise<void>;
  deactivate: () => Promise<void>;
  getAPI?: () => PluginAPI;
}
```

### Plugin Metadata

```typescript
interface PluginMetadata {
  id: string;          // Unique identifier for your plugin
  name: string;        // Display name
  description: string; // Short description
  version: string;     // Semantic version (e.g., "1.0.0")
  author: string;      // Your name or organization
  category: string;    // Plugin category (e.g., "editor", "integration")
  tags: string[];      // Search tags
  minEditorVersion: string; // Minimum editor version required
}
```

## Plugin Structure

Here's a basic plugin template:

```typescript
export default {
  metadata: {
    id: "my-awesome-plugin",
    name: "My Awesome Plugin",
    description: "Does something awesome",
    version: "1.0.0",
    author: "Your Name",
    category: "editor",
    tags: ["awesome", "editor"],
    minEditorVersion: "1.0.0"
  },

  async initialize(context: PluginContext) {
    // Set up your plugin
    // Access editor, workspace, and user info from context
    this.editor = context.editor;
    this.workspace = context.workspace;
  },

  async activate() {
    // Plugin is being enabled
    // Register commands, UI elements, etc.
  },

  async deactivate() {
    // Plugin is being disabled
    // Clean up resources, remove UI elements
  },

  getAPI() {
    // Optional: Expose plugin functionality to other plugins
    return {
      doSomethingAwesome: () => {
        // Implementation
      }
    };
  }
};
```

## Plugin API

The `PluginContext` provides access to core editor functionality:

```typescript
interface PluginContext {
  editor: Editor;      // TipTap editor instance
  workspace: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    email: string;
  };
}
```

### Editor Manipulation

```typescript
// Insert content at current position
context.editor.insertContent("Hello World");

// Replace content in range
context.editor.replaceContent(from, to, "New content");

// Get current content
const content = context.editor.getContent();
```

### Commands and Events

```typescript
// Register a command
pluginAPI.registerCommand("myCommand", (args) => {
  // Command implementation
});

// Listen for events
pluginAPI.on("documentChange", (data) => {
  // Handle document changes
});
```

## UI Integration

Plugins can add UI elements in several locations:

### Toolbar Items

```typescript
pluginAPI.registerToolbarItem({
  id: "my-button",
  title: "My Button",
  icon: <MyIcon />,
  action: () => {
    // Button click handler
  },
  isActive: () => {
    // Return true if button should be highlighted
    return false;
  }
});
```

### Sidebar Items

```typescript
pluginAPI.registerSidebarItem({
  id: "my-sidebar",
  title: "My Sidebar",
  component: MySidebarComponent,
  position: "right" // or "left"
});
```

### Menu Items

```typescript
pluginAPI.registerMenuItem({
  id: "my-menu-item",
  title: "My Menu Item",
  action: () => {
    // Menu item click handler
  },
  shortcut: "Cmd+Shift+M",
  category: "Tools"
});
```

## Best Practices

1. **Performance**
   - Initialize resources only when needed
   - Clean up when deactivated
   - Use debouncing for frequent operations

2. **Error Handling**
   - Catch and handle errors gracefully
   - Provide meaningful error messages
   - Don't let errors crash the editor

3. **State Management**
   - Use plugin storage for persistent data
   - Clean up state when deactivated
   - Don't interfere with other plugins

4. **User Experience**
   - Follow editor UI/UX guidelines
   - Provide feedback for actions
   - Support keyboard shortcuts

## Publishing

1. **Prepare Your Plugin**
   - Test thoroughly
   - Update version number
   - Write clear documentation

2. **Package Structure**
   ```
   my-plugin/
   ├── package.json
   ├── README.md
   ├── src/
   │   └── index.ts
   └── dist/
       └── index.js
   ```

3. **Submit to Marketplace**
   - Create a marketplace account
   - Submit your plugin for review
   - Provide required metadata and screenshots

### Publishing API

```typescript
import { marketplaceSDK } from '@loomity/marketplace';

await marketplaceSDK.publishItem({
  type: 'plugin',
  name: 'My Plugin',
  description: 'Plugin description',
  version: '1.0.0',
  content: myPluginCode,
  previewImages: ['url1', 'url2'],
  tags: ['editor', 'tools']
});
```

## Example Plugins

Check out these example plugins:
- [Mermaid Diagrams](examples/mermaid-plugin)
- [KaTeX Math](examples/katex-plugin)
- [Code Diff](examples/code-diff-plugin)
