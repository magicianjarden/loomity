export type PluginPermission =
  // Storage Permissions
  | 'storage:read'
  | 'storage:write'
  
  // Network Permissions
  | 'network:http'
  | 'network:websocket'
  
  // UI Permissions
  | 'ui:notifications'
  | 'ui:modal'
  | 'ui:sidebar'
  
  // System Permissions
  | 'system:clipboard'
  | 'system:file'
  | 'system:audio'
  
  // Plugin Permissions
  | 'plugins:read'
  | 'plugins:write'
  | 'plugins:communicate'
  
  // User Data Permissions
  | 'user:profile:read'
  | 'user:profile:write'
  | 'user:preferences:read'
  | 'user:preferences:write';

export interface PermissionDescriptor {
  permission: PluginPermission;
  description: string;
  dangerous: boolean;
  icon: string;
}

export const PERMISSION_DESCRIPTORS: Record<PluginPermission, PermissionDescriptor> = {
  'storage:read': {
    permission: 'storage:read',
    description: 'Read data from plugin storage',
    dangerous: false,
    icon: 'database'
  },
  'storage:write': {
    permission: 'storage:write',
    description: 'Write data to plugin storage',
    dangerous: true,
    icon: 'database-backup'
  },
  // Add descriptors for other permissions...
};
