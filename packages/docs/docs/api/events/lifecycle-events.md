---
sidebar_position: 1
---

# Lifecycle Events

Events related to plugin lifecycle management.

## Available Events

### Plugin Events
- `plugin:registered` - Plugin has been registered
- `plugin:unregistered` - Plugin has been unregistered
- `plugin:activated` - Plugin has been activated
- `plugin:deactivated` - Plugin has been deactivated
- `plugin:error` - Plugin encountered an error

## Usage

```typescript
export default {
  activate: (context) => {
    // Listen for other plugin activations
    context.api.on('plugin:activated', (data) => {
      console.log(`Plugin ${data.pluginId} activated`);
    });
    
    // Listen for errors
    context.api.on('plugin:error', (error) => {
      context.api.ui.showToast(
        `Plugin error: ${error.message}`,
        'error'
      );
    });
  },
  
  deactivate: () => {
    // Clean up is handled automatically
  }
};
```

## Event Data Types

```typescript
interface PluginEventData {
  pluginId: string;
  timestamp: number;
}

interface PluginErrorData extends PluginEventData {
  error: Error;
  context?: any;
}
```

## Best Practices

1. Clean up listeners
2. Handle errors gracefully
3. Avoid circular dependencies
4. Log important events
