---
sidebar_position: 2
---

# UI Plugin Example

A plugin that demonstrates UI integration capabilities.

## Plugin Files

### plugin.json
```json
{
  "id": "theme-switcher",
  "name": "Theme Switcher",
  "version": "1.0.0",
  "description": "Switch between light and dark themes",
  "author": "Your Name",
  "permissions": [
    "ui:menu",
    "ui:toast",
    "storage:read",
    "storage:write"
  ]
}
```

### src/index.ts
```typescript
import type { Plugin } from '@loomity/core';
import { ThemeDialog } from './components/ThemeDialog';

const plugin: Plugin = {
  activate: async (context) => {
    // Add menu item
    context.api.ui.addMenuItem({
      id: 'theme-switcher',
      label: 'Switch Theme',
      shortcut: 'Cmd+Shift+T',
      onClick: () => {
        context.api.ui.showModal({
          title: 'Theme Settings',
          content: <ThemeDialog />
        });
      }
    });
    
    // Load saved theme
    const theme = await context.api.storage.get('theme');
    if (theme) {
      applyTheme(theme);
    }
  }
};

export default plugin;
```

### src/components/ThemeDialog.tsx
```typescript
import { useState } from 'react';
import { Button, Select } from '@loomity/ui';

export function ThemeDialog() {
  const [theme, setTheme] = useState('light');
  
  return (
    <div className="p-4">
      <Select
        value={theme}
        onChange={setTheme}
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' }
        ]}
      />
      <Button
        onClick={() => {
          applyTheme(theme);
          context.api.ui.showToast('Theme updated!');
        }}
      >
        Apply Theme
      </Button>
    </div>
  );
}
```

## Features Demonstrated

1. UI components
2. Modal dialogs
3. Menu integration
4. Settings storage
5. User preferences
6. Event handling

## Best Practices

1. Use Loomity UI components
2. Follow design patterns
3. Save user preferences
4. Provide keyboard shortcuts
5. Show feedback for actions

## Next Steps

1. Add more themes
2. Custom CSS
3. Theme scheduling
4. User presets
