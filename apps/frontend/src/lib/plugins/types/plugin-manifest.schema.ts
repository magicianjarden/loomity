import { z } from 'zod';

export const pluginManifestSchema = z.object({
  // Basic Information
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string(),
  author: z.string(),
  
  // URLs
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  license: z.string(),
  
  // Security
  requiredPermissions: z.array(z.string()),
  signature: z.string().optional(),
  certificateUrl: z.string().url().optional(),
  
  // Resource Limits
  resourceLimits: z.object({
    maxCPU: z.number().min(0).max(100).optional(),
    maxMemory: z.number().min(0).optional(),
    maxStorage: z.number().min(0).optional(),
    maxNetwork: z.number().min(0).optional(),
  }).optional(),
  
  // Entry Points
  main: z.string(),
  styles: z.array(z.string()).optional(),
  
  // Dependencies
  dependencies: z.record(z.string()).optional(),
  peerDependencies: z.record(z.string()).optional(),
  
  // Plugin Specific
  hooks: z.array(z.string()).optional(),
  events: z.array(z.string()).optional(),
  settings: z.object({
    schema: z.record(z.unknown()),
    defaults: z.record(z.unknown()),
  }).optional(),
  
  // Data Management
  dataSchema: z.object({
    version: z.number(),
    collections: z.record(z.unknown()),
  }).optional(),
  
  // Compatibility
  engines: z.object({
    node: z.string().optional(),
    npm: z.string().optional(),
    platform: z.array(z.string()).optional(),
  }).optional(),
  
  minimumHostVersion: z.string(),
});

export type PluginManifest = z.infer<typeof pluginManifestSchema>;

// Plugin package structure
export const pluginPackageSchema = z.object({
  manifest: pluginManifestSchema,
  files: z.record(z.string()),
  assets: z.record(z.string()).optional(),
});

export type PluginPackage = z.infer<typeof pluginPackageSchema>;
