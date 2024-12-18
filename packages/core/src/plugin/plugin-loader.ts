import { NodeVM } from 'vm2';
import { Plugin, PluginManifest } from '../types';

export class PluginLoader {
  private vm: NodeVM;

  constructor() {
    this.vm = new NodeVM({
      console: 'redirect',
      sandbox: {},
      require: {
        external: true,
        builtin: ['*'],
        root: './',
        context: 'sandbox'
      },
      wrapper: 'none',
      sourceExtensions: ['js', 'ts'],
      timeout: 1000, // 1 second timeout
    });
  }

  async loadPlugin(manifest: PluginManifest, code: string): Promise<Plugin> {
    try {
      // Validate manifest
      this.validateManifest(manifest);

      // Run the code in VM2 sandbox
      const sandboxedPlugin = this.vm.run(code, `plugin-${manifest.id}.js`);

      // Validate plugin structure
      this.validatePlugin(sandboxedPlugin);

      return {
        ...sandboxedPlugin,
        manifest
      };
    } catch (error) {
      throw new Error(`Failed to load plugin ${manifest.id}: ${error.message}`);
    }
  }

  private validateManifest(manifest: PluginManifest): void {
    if (!manifest.id || !manifest.name || !manifest.version) {
      throw new Error('Invalid plugin manifest');
    }
  }

  private validatePlugin(plugin: any): void {
    if (typeof plugin.activate !== 'function') {
      throw new Error('Plugin must export an activate function');
    }
    if (plugin.deactivate && typeof plugin.deactivate !== 'function') {
      throw new Error('Plugin deactivate must be a function if provided');
    }
  }
}
