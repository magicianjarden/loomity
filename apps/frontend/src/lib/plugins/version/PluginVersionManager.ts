import semver from 'semver';
import { PluginManifest } from '../types/PluginManifest';

interface VersionMetadata {
  version: string;
  releaseNotes: string;
  publishedAt: string;
  minimumHostVersion: string;
  sha256: string;
  downloadUrl: string;
  size: number;
  dependencies: Record<string, string>;
}

export class PluginVersionManager {
  private readonly pluginId: string;
  private readonly currentVersion: string;

  constructor(private readonly manifest: PluginManifest) {
    this.pluginId = manifest.id;
    this.currentVersion = manifest.version;
  }

  async checkForUpdates(): Promise<VersionMetadata | null> {
    try {
      const latestVersion = await this.getLatestCompatibleVersion();
      if (!latestVersion) return null;

      if (semver.gt(latestVersion.version, this.currentVersion)) {
        return latestVersion;
      }
      return null;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return null;
    }
  }

  async getLatestCompatibleVersion(): Promise<VersionMetadata | null> {
    const versions = await this.getAllVersions();
    const hostVersion = await this.getHostVersion();

    return versions.find(version => 
      semver.satisfies(hostVersion, version.minimumHostVersion) &&
      this.checkDependencyCompatibility(version.dependencies)
    ) || null;
  }

  private async getAllVersions(): Promise<VersionMetadata[]> {
    // Fetch from your plugin registry
    const response = await fetch(`/api/plugins/${this.pluginId}/versions`);
    if (!response.ok) {
      throw new Error('Failed to fetch plugin versions');
    }
    return response.json();
  }

  private async getHostVersion(): Promise<string> {
    const response = await fetch('/api/host/version');
    if (!response.ok) {
      throw new Error('Failed to fetch host version');
    }
    const { version } = await response.json();
    return version;
  }

  private async checkDependencyCompatibility(
    dependencies: Record<string, string>
  ): Promise<boolean> {
    const installedPlugins = await this.getInstalledPlugins();
    
    return Object.entries(dependencies).every(([pluginId, versionRange]) => {
      const installedVersion = installedPlugins[pluginId]?.version;
      return installedVersion && semver.satisfies(installedVersion, versionRange);
    });
  }

  private async getInstalledPlugins(): Promise<Record<string, PluginManifest>> {
    const response = await fetch('/api/plugins/installed');
    if (!response.ok) {
      throw new Error('Failed to fetch installed plugins');
    }
    return response.json();
  }

  async validateVersion(version: string): Promise<boolean> {
    return semver.valid(version) !== null;
  }

  async compareVersions(version1: string, version2: string): Promise<number> {
    return semver.compare(version1, version2);
  }
}
