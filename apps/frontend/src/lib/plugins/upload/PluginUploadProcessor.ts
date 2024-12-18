import { pluginManifestSchema, pluginPackageSchema, PluginPackage } from '../types/plugin-manifest.schema';
import { PluginCompatibilityChecker } from '../compatibility/PluginCompatibilityChecker';

interface UploadValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  manifest?: any;
}

interface ProcessedPlugin {
  manifest: any;
  hash: string;
  size: number;
  dependencies: string[];
  permissions: string[];
}

export class PluginUploadProcessor {
  constructor(
    private readonly options: {
      maxSize?: number;
      allowedFileTypes?: string[];
      requiredFields?: string[];
    } = {}
  ) {}

  async validateUpload(file: File): Promise<UploadValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (this.options.maxSize && file.size > this.options.maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${this.options.maxSize} bytes`);
    }

    // Check file type
    if (
      this.options.allowedFileTypes &&
      !this.options.allowedFileTypes.includes(file.type)
    ) {
      errors.push(`Invalid file type. Allowed types: ${this.options.allowedFileTypes.join(', ')}`);
    }

    try {
      // Read and parse the plugin package
      const content = await file.text();
      const packageData = JSON.parse(content);

      // Validate against schema
      const result = pluginPackageSchema.safeParse(packageData);
      
      if (!result.success) {
        errors.push(...result.error.errors.map(err => err.message));
        return { isValid: false, errors, warnings };
      }

      // Check required fields
      if (this.options.requiredFields) {
        for (const field of this.options.requiredFields) {
          if (!result.data.manifest[field]) {
            errors.push(`Missing required field: ${field}`);
          }
        }
      }

      // Validate dependencies
      if (result.data.manifest.dependencies) {
        const missingDeps = await this.checkDependencies(
          result.data.manifest.dependencies
        );
        warnings.push(...missingDeps.map(dep => 
          `Missing dependency: ${dep}`
        ));
      }

      // Validate permissions
      if (result.data.manifest.requiredPermissions) {
        const invalidPerms = await this.checkPermissions(
          result.data.manifest.requiredPermissions
        );
        errors.push(...invalidPerms.map(perm =>
          `Invalid permission requested: ${perm}`
        ));
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        manifest: result.data.manifest,
      };
    } catch (error) {
      errors.push('Failed to parse plugin package: ' + (error as Error).message);
      return { isValid: false, errors, warnings };
    }
  }

  async processPlugin(file: File): Promise<ProcessedPlugin> {
    try {
      const content = await file.text();
      const packageData = JSON.parse(content) as PluginPackage;

      // Validate against schema first
      const result = pluginPackageSchema.safeParse(packageData);
      if (!result.success) {
        throw new Error('Invalid plugin package: ' + result.error.errors[0].message);
      }

      // Calculate hash
      const hash = await this.calculateHash(content);

      // Extract dependencies and permissions
      const dependencies = Object.keys(packageData.manifest.dependencies || {});
      const permissions = packageData.manifest.requiredPermissions || [];

      // Check compatibility
      const compatibilityChecker = new PluginCompatibilityChecker();
      const isCompatible = await compatibilityChecker.checkCompatibility(packageData.manifest);
      if (!isCompatible) {
        throw new Error('Plugin is not compatible with current platform version');
      }

      return {
        manifest: packageData.manifest,
        hash,
        size: file.size,
        dependencies,
        permissions,
      };
    } catch (error) {
      throw new Error('Failed to process plugin: ' + (error as Error).message);
    }
  }

  private async calculateHash(content: string): Promise<string> {
    // Use Web Crypto API instead of Node's crypto module for browser compatibility
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async checkDependencies(
    dependencies: Record<string, string>
  ): Promise<string[]> {
    const missingDeps: string[] = [];
    
    // Check each dependency
    for (const [dep, version] of Object.entries(dependencies)) {
      const exists = await this.checkDependencyExists(dep, version);
      if (!exists) {
        missingDeps.push(dep);
      }
    }

    return missingDeps;
  }

  private async checkDependencyExists(
    dependency: string,
    version: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `/api/marketplace/check-dependency?name=${dependency}&version=${version}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  private async checkPermissions(
    permissions: string[]
  ): Promise<string[]> {
    const invalidPerms: string[] = [];
    
    try {
      // Get available permissions
      const response = await fetch('/api/marketplace/available-permissions');
      if (!response.ok) {
        throw new Error('Failed to fetch available permissions');
      }
      
      const availablePermissions = await response.json();
      
      // Check each permission
      for (const permission of permissions) {
        if (!availablePermissions.includes(permission)) {
          invalidPerms.push(permission);
        }
      }
    } catch (error) {
      console.error('Failed to check permissions:', error);
      // Return all permissions as invalid if we can't verify them
      return permissions;
    }

    return invalidPerms;
  }
}
