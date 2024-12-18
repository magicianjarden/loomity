---
sidebar_position: 2
---

# Document API

The Document API provides methods for reading and modifying document content.

## Methods

### read()
Read the current document content.

```typescript
async function read(): Promise<string>
```

### write()
Write content to the current document.

```typescript
async function write(content: string): Promise<void>
```

## Events

- `document:change` - Fired when document content changes
- `document:save` - Fired when document is saved
- `document:close` - Fired when document is closed

## Examples

```typescript
export default {
  activate: async (context) => {
    // Read document
    const content = await context.api.document.read();
    
    // Modify content
    const modified = content.toUpperCase();
    
    // Write back
    await context.api.document.write(modified);
    
    // Listen for changes
    context.api.on('document:change', () => {
      console.log('Document changed');
    });
  }
};
```

## Error Handling

```typescript
try {
  const content = await context.api.document.read();
} catch (error) {
  if (error.code === 'DOCUMENT_NOT_FOUND') {
    // Handle missing document
  }
}
```

## Best Practices

1. Always handle errors
2. Use proper permissions
3. Clean up event listeners
4. Validate content before writing
