import { createVerify } from 'crypto';
import axios from 'axios';
import { Plugin, PluginManifest } from '../types';

interface VerificationResult {
  isValid: boolean;
  issues: string[];
}

export class PluginVerifier {
  private trustedPublicKeys: Map<string, string>;
  private knownVulnerabilities: Set<string>;

  constructor() {
    this.trustedPublicKeys = new Map();
    this.knownVulnerabilities = new Set();
  }

  async verifyPlugin(plugin: Plugin, signature: string): Promise<VerificationResult> {
    const issues: string[] = [];

    // Verify digital signature
    if (!this.verifySignature(plugin, signature)) {
      issues.push('Invalid plugin signature');
    }

    // Check for known vulnerabilities
    const vulnerabilities = await this.checkVulnerabilities(plugin);
    if (vulnerabilities.length > 0) {
      issues.push(...vulnerabilities);
    }

    // Verify dependencies
    const dependencyIssues = await this.verifyDependencies(plugin.manifest);
    if (dependencyIssues.length > 0) {
      issues.push(...dependencyIssues);
    }

    // Verify source code integrity
    if (!await this.verifySourceIntegrity(plugin)) {
      issues.push('Source code integrity check failed');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  private verifySignature(plugin: Plugin, signature: string): boolean {
    const publicKey = this.trustedPublicKeys.get(plugin.manifest.author);
    if (!publicKey) return false;

    try {
      const verify = createVerify('SHA256');
      verify.update(JSON.stringify(plugin.manifest));
      return verify.verify(publicKey, signature, 'base64');
    } catch {
      return false;
    }
  }

  private async checkVulnerabilities(plugin: Plugin): Promise<string[]> {
    const issues: string[] = [];
    
    // Check plugin version against known vulnerable versions
    if (this.knownVulnerabilities.has(`${plugin.manifest.id}@${plugin.manifest.version}`)) {
      issues.push(`Known vulnerability in plugin version ${plugin.manifest.version}`);
    }

    return issues;
  }

  private async verifyDependencies(manifest: PluginManifest): Promise<string[]> {
    const issues: string[] = [];
    
    if (!manifest.dependencies) return issues;

    for (const [dep, version] of Object.entries(manifest.dependencies)) {
      try {
        // Check if dependency exists in npm registry
        const response = await axios.get(`https://registry.npmjs.org/${dep}/${version}`);
        
        // Check if version has known vulnerabilities
        const vulnResponse = await axios.get(
          `https://registry.npmjs.org/-/npm/v1/security/advisories/search?package=${dep}`
        );

        if (vulnResponse.data.objects.some((vuln: any) => 
          vuln.affected_versions.includes(version)
        )) {
          issues.push(`Dependency ${dep}@${version} has known vulnerabilities`);
        }
      } catch {
        issues.push(`Unable to verify dependency ${dep}@${version}`);
      }
    }

    return issues;
  }

  private async verifySourceIntegrity(plugin: Plugin): Promise<boolean> {
    // Compare source code hash with registered hash
    const sourceHash = this.computeSourceHash(plugin);
    return sourceHash === plugin.manifest.sourceHash;
  }

  private computeSourceHash(plugin: Plugin): string {
    // Implement source code hashing logic
    return '';  // Placeholder
  }

  addTrustedPublicKey(author: string, publicKey: string): void {
    this.trustedPublicKeys.set(author, publicKey);
  }

  addKnownVulnerability(pluginId: string, version: string): void {
    this.knownVulnerabilities.add(`${pluginId}@${version}`);
  }
}
