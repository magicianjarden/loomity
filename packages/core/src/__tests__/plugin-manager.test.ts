import { PluginManager } from '../plugin/plugin-manager';
import { Plugin } from '../types';

describe('PluginManager', () => {
  let pluginManager: PluginManager;

  beforeEach(() => {
    pluginManager = new PluginManager();
  });

  const mockPlugin: Plugin = {
    id: 'test-plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    description: 'A test plugin',
    author: 'Test Author',
    permissions: ['document:read'],
  };

  describe('registerPlugin', () => {
    it('should register a valid plugin', async () => {
      await expect(pluginManager.registerPlugin(mockPlugin)).resolves.not.toThrow();
      expect(pluginManager.getPlugin('test-plugin')).toBe(mockPlugin);
    });

    it('should throw error when registering duplicate plugin', async () => {
      await pluginManager.registerPlugin(mockPlugin);
      await expect(pluginManager.registerPlugin(mockPlugin)).rejects.toThrow();
    });

    it('should create plugin context with API', async () => {
      await pluginManager.registerPlugin(mockPlugin);
      const context = pluginManager.getPluginContext('test-plugin');
      
      expect(context).toBeDefined();
      expect(context?.id).toBe('test-plugin');
      expect(context?.api).toBeDefined();
      expect(typeof context?.api.ui.showToast).toBe('function');
    });
  });

  describe('unregisterPlugin', () => {
    it('should unregister an existing plugin', async () => {
      await pluginManager.registerPlugin(mockPlugin);
      await expect(pluginManager.unregisterPlugin('test-plugin')).resolves.not.toThrow();
      expect(pluginManager.getPlugin('test-plugin')).toBeUndefined();
    });

    it('should throw error when unregistering non-existent plugin', async () => {
      await expect(pluginManager.unregisterPlugin('non-existent')).rejects.toThrow();
    });
  });
});
