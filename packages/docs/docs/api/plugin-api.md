---
sidebar_position: 1
---

# Plugin API Reference

The Plugin API provides the core functionality for interacting with the Loomity platform.

## Plugin Context

Every plugin receives a context object when activated:

```typescript
interface PluginContext {
  id: string;
  api: PluginAPI;
}
```

## Plugin API

The `PluginAPI` object provides access to various platform features:

### Document API

```typescript
interface DocumentAPI {
  read(): Promise<string>;
  write(content: string): Promise<void>;
}
```

### UI API

```typescript
interface UIAPI {
  showToast(message: string, type?: 'info' | 'success' | 'error'): void;
  addMenuItem(item: MenuItem): void;
}

interface MenuItem {
  id: string;
  label: string;
  onClick: () => void;
  icon?: string;
  shortcut?: string;
}
```

### Storage API

```typescript
interface StorageAPI {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
}
```

## Usage Example

```typescript
export default {
  id: 'example-plugin',
  // ... other plugin properties
  
  activate: (context) => {
    // Read document content
    const content = await context.api.document.read();
    
    // Show a toast notification
    context.api.ui.showToast('Document loaded!');
    
    // Add a menu item
    context.api.ui.addMenuItem({
      id: 'example-item',
      label: 'Example Action',
      onClick: () => {
        console.log('Menu item clicked!');
      }
    });
  }
};
```

## Error Handling

All API methods that can fail will return a Promise and should be properly handled:

```typescript
try {
  await context.api.document.write('New content');
} catch (error) {
  context.api.ui.showToast('Failed to write document', 'error');
}
```

## Best Practices

1. Always check permissions before using APIs
2. Handle errors gracefully
3. Clean up resources in deactivate
4. Use typed interfaces for better development experience
