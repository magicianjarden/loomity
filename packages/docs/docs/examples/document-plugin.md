---
sidebar_position: 3
---

# Document Plugin Example

A plugin that demonstrates document manipulation capabilities.

## Plugin Files

### plugin.json
```json
{
  "id": "auto-formatter",
  "name": "Auto Formatter",
  "version": "1.0.0",
  "description": "Automatically format documents on save",
  "author": "Your Name",
  "permissions": [
    "document:read",
    "document:write",
    "ui:toast"
  ],
  "dependencies": {
    "@prettier/plugin-typescript": "^10.0.0"
  }
}
```

### src/index.ts
```typescript
import type { Plugin } from '@loomity/core';
import { format } from 'prettier';

const plugin: Plugin = {
  activate: async (context) => {
    // Format on save
    context.api.on('document:save', async () => {
      try {
        // Get current content
        const content = await context.api.document.read();
        
        // Format content
        const formatted = await format(content, {
          parser: 'typescript',
          plugins: ['@prettier/plugin-typescript']
        });
        
        // Write back
        await context.api.document.write(formatted);
        
        // Show success
        context.api.ui.showToast('Document formatted!');
      } catch (error) {
        context.api.ui.showToast(
          'Format failed: ' + error.message,
          'error'
        );
      }
    });
  }
};

export default plugin;
```

## Features Demonstrated

1. Document events
2. Content formatting
3. Error handling
4. Dependencies usage
5. User feedback

## Implementation Details

1. **Event Handling**
   - Listen for save events
   - Process document content
   - Handle errors gracefully

2. **Formatting**
   - Use Prettier API
   - Configure parser
   - Apply formatting rules

3. **User Experience**
   - Show progress
   - Provide feedback
   - Handle failures

## Best Practices

1. Efficient processing
2. Error recovery
3. User feedback
4. Clean formatting
5. Language detection

## Next Steps

1. Add format options
2. Support more languages
3. Custom rules
4. Format selection
5. Format on demand
