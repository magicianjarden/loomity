---
sidebar_position: 1
---

# Basic Plugin Example

A simple plugin that demonstrates core functionality.

## Plugin Files

### plugin.json
```json
{
  "id": "hello-world",
  "name": "Hello World",
  "version": "1.0.0",
  "description": "A simple hello world plugin",
  "author": "Your Name",
  "permissions": [
    "ui:toast",
    "document:read"
  ]
}
```

### src/index.ts
```typescript
import type { Plugin } from '@loomity/core';

const plugin: Plugin = {
  activate: async (context) => {
    // Show welcome message
    context.api.ui.showToast('Hello World Plugin Activated!');
    
    // Read document
    const content = await context.api.document.read();
    console.log('Current document:', content);
    
    // Listen for changes
    context.api.on('document:change', () => {
      console.log('Document changed');
    });
  },
  
  deactivate: () => {
    console.log('Goodbye!');
  }
};

export default plugin;
```

## Features Demonstrated

1. Basic plugin structure
2. UI interaction (toast)
3. Document access
4. Event handling
5. Lifecycle methods

## Running the Plugin

1. Build the plugin:
```bash
npm run build
```

2. Install in Loomity:
```bash
loomity plugin install
```

## Next Steps

1. Add more features
2. Handle errors
3. Add settings
4. Improve UI
