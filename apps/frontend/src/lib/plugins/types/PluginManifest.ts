import { PluginPermission } from './PluginPermission';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  license: string;
  
  // Security
  requiredPermissions: PluginPermission[];
  signature?: string;
  certificateUrl?: string;
  
  // Resource Limits
  resourceLimits?: {
    maxCPU?: number;    // percentage
    maxMemory?: number; // bytes
    maxStorage?: number; // bytes
    maxNetwork?: number; // bytes per second
  };
  
  // Entry Points
  main: string;
  styles?: string[];
  assets?: string[];
  
  // Dependencies
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  
  // Plugin Specific
  hooks?: string[];
  events?: string[];
  settings?: {
    schema: Record<string, unknown>;
    defaults: Record<string, unknown>;
  };
  
  // Data Management
  dataSchema?: {
    version: number;
    collections: Record<string, unknown>;
  };
  
  // Compatibility
  engines?: {
    node?: string;
    npm?: string;
    platform?: string[];
  };
  
  minimumHostVersion: string;
  maximumHostVersion?: string;
}
