import { Plugin, PluginContext, PluginManifest, SecurityContext } from '../types';
import { PluginLoader } from './plugin-loader';
import { EventEmitter } from '../events/event-emitter';
import { ResourceMonitor } from '../security/resource-monitor';
import { ContentSecurity } from '../security/content-security';
import { PluginVerifier } from '../security/plugin-verifier';

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private contexts: Map<string, PluginContext> = new Map();
  private securityContexts: Map<string, SecurityContext> = new Map();
  
  private loader: PluginLoader;
  private eventEmitter: EventEmitter;
  private resourceMonitor: ResourceMonitor;
  private contentSecurity: ContentSecurity;
  private verifier: PluginVerifier;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.resourceMonitor = new ResourceMonitor({
      maxMemoryMB: 100,
      maxCPUPercent: 50,
      maxStorageBytes: 1024 * 1024 * 10, // 10MB
      maxAPICallsPerMinute: 100
    }, this.eventEmitter);
    this.contentSecurity = new ContentSecurity();
    this.verifier = new PluginVerifier();
    this.loader = new PluginLoader();

    // Listen for resource limit violations
    this.eventEmitter.on('plugin:limit-exceeded', this.handleLimitExceeded.bind(this));
  }

  async registerPlugin(manifest: PluginManifest, code: string, signature?: string): Promise<void> {
    try {
      // Step 1: Verify plugin
      const verificationResult = await this.verifier.verifyPlugin({
        manifest,
        activate: () => {}, // Temporary placeholder
        deactivate: () => {}
      }, signature || '');

      if (!verificationResult.isValid) {
        throw new Error(`Plugin verification failed: ${verificationResult.issues.join(', ')}`);
      }

      // Step 2: Load plugin in sandbox
      const plugin = await this.loader.loadPlugin(manifest, code);

      // Step 3: Initialize security context
      const securityContext = this.createSecurityContext(plugin.manifest.id, plugin.manifest.permissions);

      // Step 4: Initialize resource monitoring
      this.resourceMonitor.initializePlugin(plugin.manifest.id);

      // Step 5: Create plugin context with security wrappers
      const context = this.createSecureContext(plugin.manifest.id, securityContext);

      // Step 6: Store plugin and contexts
      this.plugins.set(plugin.manifest.id, plugin);
      this.contexts.set(plugin.manifest.id, context);
      this.securityContexts.set(plugin.manifest.id, securityContext);

      // Step 7: Activate plugin
      await plugin.activate(context);

      this.eventEmitter.emit('plugin:registered', { pluginId: plugin.manifest.id });
    } catch (error) {
      this.eventEmitter.emit('plugin:error', {
        pluginId: manifest.id,
        error: error.message
      });
      throw error;
    }
  }

  async unregisterPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    try {
      // Deactivate plugin
      if (plugin.deactivate) {
        await plugin.deactivate();
      }

      // Cleanup security resources
      this.resourceMonitor.cleanup(pluginId);
      this.contentSecurity.revokeFileAccess(pluginId);

      // Remove plugin and contexts
      this.plugins.delete(pluginId);
      this.contexts.delete(pluginId);
      this.securityContexts.delete(pluginId);

      this.eventEmitter.emit('plugin:unregistered', { pluginId });
    } catch (error) {
      this.eventEmitter.emit('plugin:error', {
        pluginId,
        error: error.message
      });
      throw error;
    }
  }

  private createSecurityContext(pluginId: string, permissions: string[]): SecurityContext {
    return {
      pluginId,
      permissions,
      resourceMonitor: this.resourceMonitor,
      contentSecurity: this.contentSecurity
    };
  }

  private createSecureContext(pluginId: string, security: SecurityContext): PluginContext {
    // Create secure wrappers around APIs
    return {
      documentAPI: this.createSecureDocumentAPI(pluginId, security),
      uiAPI: this.createSecureUIAPI(pluginId, security),
      storageAPI: this.createSecureStorageAPI(pluginId, security),
      eventEmitter: this.createSecureEventEmitter(pluginId, security)
    };
  }

  private createSecureDocumentAPI(pluginId: string, security: SecurityContext) {
    return {
      async read(): Promise<string> {
        if (!security.permissions.includes('document:read')) {
          throw new Error('Permission denied: document:read');
        }
        if (!security.resourceMonitor.trackAPICall(pluginId)) {
          throw new Error('API rate limit exceeded');
        }
        // Implement actual document read logic
        return '';
      },
      async write(content: string): Promise<void> {
        if (!security.permissions.includes('document:write')) {
          throw new Error('Permission denied: document:write');
        }
        if (!security.resourceMonitor.trackAPICall(pluginId)) {
          throw new Error('API rate limit exceeded');
        }
        if (!security.contentSecurity.validateInput(content)) {
          throw new Error('Invalid content');
        }
        // Implement actual document write logic
      }
    };
  }

  private createSecureUIAPI(pluginId: string, security: SecurityContext) {
    return {
      showToast(message: string, type?: 'info' | 'success' | 'error'): void {
        if (!security.permissions.includes('ui:notification')) {
          throw new Error('Permission denied: ui:notification');
        }
        if (!security.resourceMonitor.trackAPICall(pluginId)) {
          throw new Error('API rate limit exceeded');
        }
        if (!security.contentSecurity.validateInput(message)) {
          throw new Error('Invalid content');
        }
        // Implement actual toast logic
      },
      addMenuItem(item: any): void {
        if (!security.permissions.includes('ui:menu')) {
          throw new Error('Permission denied: ui:menu');
        }
        if (!security.resourceMonitor.trackAPICall(pluginId)) {
          throw new Error('API rate limit exceeded');
        }
        // Implement actual menu item logic
      }
    };
  }

  private createSecureStorageAPI(pluginId: string, security: SecurityContext) {
    return {
      async get(key: string): Promise<unknown> {
        if (!security.permissions.includes('storage:read')) {
          throw new Error('Permission denied: storage:read');
        }
        if (!security.resourceMonitor.trackAPICall(pluginId)) {
          throw new Error('API rate limit exceeded');
        }
        // Implement actual storage get logic
        return null;
      },
      async set(key: string, value: unknown): Promise<void> {
        if (!security.permissions.includes('storage:write')) {
          throw new Error('Permission denied: storage:write');
        }
        if (!security.resourceMonitor.trackAPICall(pluginId)) {
          throw new Error('API rate limit exceeded');
        }
        if (!security.resourceMonitor.trackStorageUsage(pluginId, JSON.stringify(value).length)) {
          throw new Error('Storage quota exceeded');
        }
        // Implement actual storage set logic
      }
    };
  }

  private createSecureEventEmitter(pluginId: string, security: SecurityContext): EventEmitter {
    // Create a wrapper around the event emitter that checks permissions and resource usage
    return this.eventEmitter;
  }

  private handleLimitExceeded(event: { pluginId: string; limit: string; current: number; max: number }) {
    this.eventEmitter.emit('plugin:warning', {
      pluginId: event.pluginId,
      message: `Resource limit exceeded: ${event.limit} (${event.current}/${event.max})`
    });
  }
}
