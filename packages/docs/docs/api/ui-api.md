---
sidebar_position: 3
---

# UI API

The UI API allows plugins to interact with Loomity's user interface.

## Methods

### showToast()
Display a notification toast.

```typescript
function showToast(
  message: string,
  type?: 'info' | 'success' | 'error'
): void
```

### addMenuItem()
Add an item to the menu.

```typescript
function addMenuItem(item: MenuItem): void

interface MenuItem {
  id: string;
  label: string;
  onClick: () => void;
  icon?: string;
  shortcut?: string;
}
```

### showModal()
Display a modal dialog.

```typescript
function showModal(options: ModalOptions): void

interface ModalOptions {
  title: string;
  content: React.ReactNode;
  onClose?: () => void;
}
```

## Components

```typescript
import { Button, Input, Select } from '@loomity/ui';

function MyDialog() {
  return (
    <div>
      <Input placeholder="Enter text" />
      <Button>Submit</Button>
    </div>
  );
}
```

## Examples

```typescript
export default {
  activate: (context) => {
    // Show toast
    context.api.ui.showToast('Plugin activated!', 'success');
    
    // Add menu item
    context.api.ui.addMenuItem({
      id: 'my-action',
      label: 'Do Something',
      onClick: () => {
        // Handle click
      },
      shortcut: 'Cmd+Shift+P'
    });
    
    // Show modal
    context.api.ui.showModal({
      title: 'Hello',
      content: <MyDialog />
    });
  }
};
```

## Best Practices

1. Use consistent UI patterns
2. Handle user interactions gracefully
3. Clean up UI elements on deactivation
4. Follow accessibility guidelines
