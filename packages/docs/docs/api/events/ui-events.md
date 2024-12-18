---
sidebar_position: 3
---

# UI Events

Events related to user interface interactions.

## Available Events

### Menu Events
- `ui:menu:click` - Menu item clicked
- `ui:menu:hover` - Menu item hovered
- `ui:menu:open` - Menu opened
- `ui:menu:close` - Menu closed

### Modal Events
- `ui:modal:open` - Modal opened
- `ui:modal:close` - Modal closed
- `ui:modal:action` - Modal action triggered

### Toast Events
- `ui:toast:show` - Toast notification shown
- `ui:toast:hide` - Toast notification hidden
- `ui:toast:action` - Toast action clicked

## Usage

```typescript
export default {
  activate: (context) => {
    // Watch menu clicks
    context.api.on('ui:menu:click', (data) => {
      console.log('Menu clicked:', data.itemId);
    });
    
    // Watch modal actions
    context.api.on('ui:modal:action', (data) => {
      if (data.action === 'confirm') {
        // Handle confirmation
      }
    });
    
    // Watch toast interactions
    context.api.on('ui:toast:action', (data) => {
      if (data.action === 'undo') {
        // Handle undo
      }
    });
  }
};
```

## Event Data Types

```typescript
interface UIEventData {
  timestamp: number;
  source: string;
}

interface MenuEventData extends UIEventData {
  itemId: string;
  parentId?: string;
}

interface ModalEventData extends UIEventData {
  modalId: string;
  action?: string;
}
```

## Best Practices

1. Handle all possible actions
2. Provide feedback for actions
3. Clean up listeners
4. Validate event data
