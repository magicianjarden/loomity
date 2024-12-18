---
sidebar_position: 4
---

# Storage API

The Storage API provides persistent storage capabilities for plugins.

## Methods

### get()
Retrieve stored data.

```typescript
async function get<T>(key: string): Promise<T | null>
```

### set()
Store data persistently.

```typescript
async function set<T>(key: string, value: T): Promise<void>
```

### remove()
Remove stored data.

```typescript
async function remove(key: string): Promise<void>
```

## Examples

```typescript
export default {
  activate: async (context) => {
    // Store settings
    await context.api.storage.set('settings', {
      theme: 'dark',
      fontSize: 14
    });
    
    // Retrieve settings
    const settings = await context.api.storage.get('settings');
    
    // Remove settings
    await context.api.storage.remove('settings');
  }
};
```

## Type Safety

```typescript
interface Settings {
  theme: 'light' | 'dark';
  fontSize: number;
}

// Type-safe storage
async function getSettings() {
  return context.api.storage.get<Settings>('settings');
}
```

## Best Practices

1. Use typed interfaces
2. Handle missing data
3. Validate before storing
4. Clean up on uninstall
5. Use namespaced keys
