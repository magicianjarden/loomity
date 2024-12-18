---
sidebar_position: 3
---

# Plugin Permissions

Understand how permissions work in Loomity plugins and how to use them securely.

## Available Permissions

### Document Permissions
- `document:read` - Read document content
- `document:write` - Modify document content
- `document:create` - Create new documents
- `document:delete` - Delete documents
- `document:share` - Share documents

### UI Permissions
- `ui:menu` - Add menu items
- `ui:toolbar` - Add toolbar items
- `ui:toast` - Show notifications
- `ui:sidebar` - Add sidebar panels
- `ui:modal` - Show modal dialogs

### Storage Permissions
- `storage:read` - Read from plugin storage
- `storage:write` - Write to plugin storage

### Network Permissions
- `network:http` - Make HTTP requests
- `network:websocket` - Use WebSocket connections

## Requesting Permissions

In your `plugin.json`:
```json
{
  "permissions": [
    "document:read",
    "ui:toast",
    "storage:read"
  ]
}
```

## Best Practices

1. **Principle of Least Privilege**
   - Request only necessary permissions
   - Avoid broad permissions when specific ones suffice

2. **Permission Checking**
   ```typescript
   if (context.hasPermission('document:write')) {
     await context.api.document.write(content);
   }
   ```

3. **Error Handling**
   ```typescript
   try {
     await context.api.document.write(content);
   } catch (error) {
     if (error.code === 'PERMISSION_DENIED') {
       // Handle permission error
     }
   }
   ```

## Security Considerations

1. **Data Access**
   - Use storage permissions carefully
   - Sanitize user input
   - Handle sensitive data appropriately

2. **UI Integration**
   - Validate user actions
   - Prevent UI manipulation exploits
   - Handle modal/toast spam

3. **Network Security**
   - Validate URLs
   - Use HTTPS
   - Handle CORS properly
