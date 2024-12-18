---
sidebar_position: 2
---

# Document Events

Events related to document changes and operations.

## Available Events

### Content Events
- `document:change` - Document content changed
- `document:save` - Document was saved
- `document:open` - Document was opened
- `document:close` - Document was closed

### Selection Events
- `document:selection` - Selection changed
- `document:cursor` - Cursor position changed

### Format Events
- `document:format` - Document was formatted
- `document:language` - Document language changed

## Usage

```typescript
export default {
  activate: (context) => {
    // Watch for changes
    context.api.on('document:change', (data) => {
      console.log('Document changed:', data.documentId);
    });
    
    // Watch for saves
    context.api.on('document:save', (data) => {
      context.api.ui.showToast('Document saved!');
    });
    
    // Watch selection
    context.api.on('document:selection', (data) => {
      console.log('Selected text:', data.text);
    });
  }
};
```

## Event Data Types

```typescript
interface DocumentEventData {
  documentId: string;
  timestamp: number;
}

interface SelectionEventData extends DocumentEventData {
  text: string;
  start: number;
  end: number;
}
```

## Best Practices

1. Debounce frequent events
2. Handle large documents
3. Clean up listeners
4. Validate event data
