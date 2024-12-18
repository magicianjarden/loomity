import semver from 'semver';
import { PluginManifest } from '../types/PluginManifest';

interface SystemRequirements {
  os: string;
  arch: string;
  node: string;
  npm: string;
}

interface CompatibilityResult {
  compatible: boolean;
  issues: CompatibilityIssue[];
}

interface CompatibilityIssue {
  type: 'error' | 'warning';
  message: string;
  component: string;
}

export class PluginCompatibilityChecker {
  constructor(
    private readonly manifest: PluginManifest,
    private readonly systemInfo: SystemRequirements
  ) {}

  async checkCompatibility(): Promise<CompatibilityResult> {
    const issues: CompatibilityIssue[] = [];

    // Check host version compatibility
    const hostVersion = await this.getHostVersion();
    if (!this.checkHostVersionCompatibility(hostVersion)) {
      issues.push({
        type: 'error',
        message: `Plugin requires host version ${this.manifest.minimumHostVersion} or higher`,
        component: 'host',
      });
    }

    // Check system requirements
    if (this.manifest.engines) {
      if (this.manifest.engines.node && 
          !semver.satisfies(this.systemInfo.node, this.manifest.engines.node)) {
        issues.push({
          type: 'error',
          message: `Requires Node.js ${this.manifest.engines.node}`,
          component: 'node',
        });
      }

      if (this.manifest.engines.npm && 
          !semver.satisfies(this.systemInfo.npm, this.manifest.engines.npm)) {
        issues.push({
          type: 'warning',
          message: `Recommended npm version: ${this.manifest.engines.npm}`,
          component: 'npm',
        });
      }

      if (this.manifest.engines.platform && 
          !this.manifest.engines.platform.includes(this.systemInfo.os)) {
        issues.push({
          type: 'error',
          message: `Not compatible with ${this.systemInfo.os}`,
          component: 'platform',
        });
      }
    }

    // Check dependencies
    const dependencyIssues = await this.checkDependencies();
    issues.push(...dependencyIssues);

    // Check permissions
    const permissionIssues = await this.checkPermissions();
    issues.push(...permissionIssues);

    return {
      compatible: !issues.some(issue => issue.type === 'error'),
      issues,
    };
  }

  private async getHostVersion(): Promise<string> {
    const response = await fetch('/api/host/version');
    if (!response.ok) {
      throw new Error('Failed to fetch host version');
    }
    const { version } = await response.json();
    return version;
  }

  private checkHostVersionCompatibility(hostVersion: string): boolean {
    return semver.gte(hostVersion, this.manifest.minimumHostVersion) && 
           (!this.manifest.maximumHostVersion || 
            semver.lte(hostVersion, this.manifest.maximumHostVersion));
  }

  private async checkDependencies(): Promise<CompatibilityIssue[]> {
    const issues: CompatibilityIssue[] = [];
    const installedPlugins = await this.getInstalledPlugins();

    if (this.manifest.dependencies) {
      for (const [pluginId, versionRange] of Object.entries(this.manifest.dependencies)) {
        const installedVersion = installedPlugins[pluginId]?.version;
        
        if (!installedVersion) {
          issues.push({
            type: 'error',
            message: `Required plugin ${pluginId} is not installed`,
            component: 'dependency',
          });
        } else if (!semver.satisfies(installedVersion, versionRange)) {
          issues.push({
            type: 'error',
            message: `Plugin ${pluginId} version ${installedVersion} does not satisfy required range ${versionRange}`,
            component: 'dependency',
          });
        }
      }
    }

    return issues;
  }

  private async checkPermissions(): Promise<CompatibilityIssue[]> {
    const issues: CompatibilityIssue[] = [];
    const availablePermissions = await this.getAvailablePermissions();

    for (const permission of this.manifest.requiredPermissions) {
      if (!availablePermissions.includes(permission)) {
        issues.push({
          type: 'error',
          message: `Required permission "${permission}" is not available`,
          component: 'permission',
        });
      }
    }

    return issues;
  }

  private async getInstalledPlugins(): Promise<Record<string, PluginManifest>> {
    const response = await fetch('/api/plugins/installed');
    if (!response.ok) {
      throw new Error('Failed to fetch installed plugins');
    }
    return response.json();
  }

  private async getAvailablePermissions(): Promise<string[]> {
    const response = await fetch('/api/plugins/available-permissions');
    if (!response.ok) {
      throw new Error('Failed to fetch available permissions');
    }
    return response.json();
  }

  async validateDependencyGraph(): Promise<boolean> {
    try {
      const visited = new Set<string>();
      const recursionStack = new Set<string>();

      const hasCycle = await this.detectCycle(
        this.manifest.id,
        visited,
        recursionStack
      );

      return !hasCycle;
    } catch (error) {
      console.error('Error validating dependency graph:', error);
      return false;
    }
  }

  private async detectCycle(
    pluginId: string,
    visited: Set<string>,
    recursionStack: Set<string>
  ): Promise<boolean> {
    if (recursionStack.has(pluginId)) {
      return true; // Cycle detected
    }

    if (visited.has(pluginId)) {
      return false; // Already checked this path
    }

    visited.add(pluginId);
    recursionStack.add(pluginId);

    const plugin = await this.getPluginManifest(pluginId);
    if (plugin?.dependencies) {
      for (const dependencyId of Object.keys(plugin.dependencies)) {
        if (await this.detectCycle(dependencyId, visited, recursionStack)) {
          return true;
        }
      }
    }

    recursionStack.delete(pluginId);
    return false;
  }

  private async getPluginManifest(pluginId: string): Promise<PluginManifest | null> {
    try {
      const response = await fetch(`/api/plugins/${pluginId}/manifest`);
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch {
      return null;
    }
  }
}
