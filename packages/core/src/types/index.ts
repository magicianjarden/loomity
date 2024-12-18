export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  permissions: PluginPermission[];
  dependencies?: Record<string, string>;
  sourceHash?: string;
  resourceLimits?: ResourceLimits;
}

export interface Plugin {
  manifest: PluginManifest;
  activate: (context: PluginContext) => Promise<void> | void;
  deactivate?: () => Promise<void> | void;
}

export interface PluginContext {
  documentAPI: DocumentAPI;
  uiAPI: UIAPI;
  storageAPI: StorageAPI;
  eventEmitter: EventEmitter;
}

export interface ResourceLimits {
  maxMemoryMB: number;
  maxCPUPercent: number;
  maxStorageBytes: number;
  maxAPICallsPerMinute: number;
}

export interface SecurityContext {
  pluginId: string;
  permissions: PluginPermission[];
  resourceMonitor: ResourceMonitor;
  contentSecurity: ContentSecurity;
}

export type PluginPermission = 
  | 'document:read'
  | 'document:write'
  | 'ui:notification'
  | 'ui:modal'
  | 'ui:menu'
  | 'storage:read'
  | 'storage:write'
  | 'network:outbound'
  | 'file:read'
  | 'file:write';

export interface PluginVerificationResult {
  isValid: boolean;
  issues: string[];
  signature?: string;
  sourceHash?: string;
}

export interface DocumentAPI {
  read: () => Promise<string>;
  write: (content: string) => Promise<void>;
}

export interface UIAPI {
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  addMenuItem: (item: MenuItem) => void;
}

export interface StorageAPI {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
}

export interface MenuItem {
  id: string;
  label: string;
  onClick: () => void;
  icon?: string;
  shortcut?: string;
}

export interface EventEmitter {
  // Add event emitter properties and methods here
}

export interface ResourceMonitor {
  // Add resource monitor properties and methods here
}

export interface ContentSecurity {
  // Add content security properties and methods here
}
