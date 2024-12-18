export const availablePermissions = [
  // Document Permissions
  'document:read',        // Read document content
  'document:write',       // Write/modify document content
  'document:create',      // Create new documents
  'document:delete',      // Delete documents
  'document:share',       // Share documents with others
  
  // UI Permissions
  'ui:menu',             // Add items to menus
  'ui:toolbar',          // Add items to toolbar
  'ui:toast',            // Show toast notifications
  'ui:sidebar',          // Add sidebar panels
  'ui:modal',            // Show modal dialogs
  
  // Storage Permissions
  'storage:read',        // Read from plugin storage
  'storage:write',       // Write to plugin storage
  
  // Network Permissions
  'network:http',        // Make HTTP requests
  'network:websocket',   // Use WebSocket connections
  
  // System Permissions
  'system:clipboard',    // Access clipboard
  'system:filesystem',   // Access filesystem
  'system:shell',        // Execute shell commands
  
  // Plugin Permissions
  'plugin:install',      // Install other plugins
  'plugin:uninstall',    // Uninstall plugins
  'plugin:update',       // Update plugins
  
  // User Permissions
  'user:read',          // Read user data
  'user:write',         // Modify user data
  'user:preferences',   // Access user preferences
] as const;

export type Permission = typeof availablePermissions[number];

export const permissionDescriptions: Record<Permission, string> = {
  'document:read': 'Read document content',
  'document:write': 'Write/modify document content',
  'document:create': 'Create new documents',
  'document:delete': 'Delete documents',
  'document:share': 'Share documents with others',
  
  'ui:menu': 'Add items to menus',
  'ui:toolbar': 'Add items to toolbar',
  'ui:toast': 'Show toast notifications',
  'ui:sidebar': 'Add sidebar panels',
  'ui:modal': 'Show modal dialogs',
  
  'storage:read': 'Read from plugin storage',
  'storage:write': 'Write to plugin storage',
  
  'network:http': 'Make HTTP requests',
  'network:websocket': 'Use WebSocket connections',
  
  'system:clipboard': 'Access clipboard',
  'system:filesystem': 'Access filesystem',
  'system:shell': 'Execute shell commands',
  
  'plugin:install': 'Install other plugins',
  'plugin:uninstall': 'Uninstall plugins',
  'plugin:update': 'Update plugins',
  
  'user:read': 'Read user data',
  'user:write': 'Modify user data',
  'user:preferences': 'Access user preferences',
};
