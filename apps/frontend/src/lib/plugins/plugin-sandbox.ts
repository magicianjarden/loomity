import { PluginManifest } from './types';

interface SandboxContext {
  allowedAPIs: string[];
  maxMemoryUsage: number;
  timeout: number;
}

export class PluginSandbox {
  private iframe: HTMLIFrameElement | null = null;
  private pluginId: string;
  private manifest: PluginManifest;
  private context: SandboxContext;

  constructor(pluginId: string, manifest: PluginManifest) {
    this.pluginId = pluginId;
    this.manifest = manifest;
    this.context = {
      allowedAPIs: manifest.permissions || [],
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
      timeout: 5000, // 5 seconds
    };
  }

  public async initialize(): Promise<void> {
    this.iframe = document.createElement('iframe');
    this.iframe.sandbox.add('allow-scripts');
    this.iframe.style.display = 'none';
    document.body.appendChild(this.iframe);

    // Create secure messaging channel
    const channel = new MessageChannel();
    
    // Set up restricted API access
    const restrictedWindow = {
      localStorage: this.createRestrictedStorage(),
      fetch: this.createRestrictedFetch(),
      setTimeout: this.createRestrictedTimeout(),
      console: this.createRestrictedConsole(),
    };

    // Inject restricted APIs into sandbox
    this.iframe.contentWindow?.postMessage({ type: 'init', apis: restrictedWindow }, '*', [
      channel.port1,
    ]);
  }

  private createRestrictedStorage() {
    const prefix = `plugin_${this.pluginId}_`;
    return {
      getItem: (key: string) => localStorage.getItem(prefix + key),
      setItem: (key: string, value: string) => {
        // Check storage quota
        const usage = this.calculateStorageUsage();
        if (usage > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('Storage quota exceeded');
        }
        localStorage.setItem(prefix + key, value);
      },
      removeItem: (key: string) => localStorage.removeItem(prefix + key),
      clear: () => {
        Object.keys(localStorage)
          .filter(key => key.startsWith(prefix))
          .forEach(key => localStorage.removeItem(key));
      },
    };
  }

  private createRestrictedFetch() {
    return async (url: string, options: RequestInit = {}) => {
      // Check if URL is in allowed domains
      if (!this.isAllowedDomain(url)) {
        throw new Error('Network request to unauthorized domain');
      }

      // Add rate limiting headers
      options.headers = {
        ...options.headers,
        'X-Plugin-ID': this.pluginId,
      };

      return fetch(url, options);
    };
  }

  private createRestrictedTimeout() {
    return (callback: Function, delay: number) => {
      if (delay > this.context.timeout) {
        throw new Error('Timeout duration exceeds maximum allowed');
      }
      return setTimeout(callback, delay);
    };
  }

  private createRestrictedConsole() {
    return {
      log: (...args: any[]) => console.log(`[Plugin: ${this.pluginId}]`, ...args),
      error: (...args: any[]) => console.error(`[Plugin: ${this.pluginId}]`, ...args),
      warn: (...args: any[]) => console.warn(`[Plugin: ${this.pluginId}]`, ...args),
    };
  }

  private isAllowedDomain(url: string): boolean {
    try {
      const domain = new URL(url).hostname;
      return this.manifest.allowedDomains?.includes(domain) || false;
    } catch {
      return false;
    }
  }

  private calculateStorageUsage(): number {
    const prefix = `plugin_${this.pluginId}_`;
    return Object.entries(localStorage)
      .filter(([key]) => key.startsWith(prefix))
      .reduce((total, [, value]) => total + (value?.length || 0), 0);
  }

  public async executeCode(code: string): Promise<any> {
    if (!this.iframe) {
      throw new Error('Sandbox not initialized');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Plugin execution timed out'));
      }, this.context.timeout);

      this.iframe?.contentWindow?.postMessage(
        { type: 'execute', code },
        '*',
        []
      );

      window.addEventListener('message', (event) => {
        if (event.source === this.iframe?.contentWindow) {
          clearTimeout(timeout);
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }
        }
      });
    });
  }

  public destroy(): void {
    if (this.iframe) {
      document.body.removeChild(this.iframe);
      this.iframe = null;
    }
  }
}
