import { PluginSystem } from './plugin-system';
import { PluginLoader } from './plugin-loader';
import { PluginVersionManager } from './plugin-version-manager';

let isInitialized = false;

// Initialize all plugin-related singletons
export function initializePluginSystem() {
  if (isInitialized) return;

  try {
    // Initialize in the correct order
    const loader = PluginLoader.getInstance();
    const versionManager = PluginVersionManager.getInstance();
    const system = PluginSystem.getInstance();

    isInitialized = true;

    return {
      pluginSystem: system,
      pluginLoader: loader,
      versionManager: versionManager,
    };
  } catch (error) {
    console.error('Failed to initialize plugin system:', error);
    throw error;
  }
}

// Get the initialized instances
export function getPluginSystem() {
  if (!isInitialized) {
    return initializePluginSystem();
  }

  return {
    pluginSystem: PluginSystem.getInstance(),
    pluginLoader: PluginLoader.getInstance(),
    versionManager: PluginVersionManager.getInstance(),
  };
}
