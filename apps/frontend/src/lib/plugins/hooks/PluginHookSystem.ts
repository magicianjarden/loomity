import { PluginManifest } from '../types/PluginManifest';

type HookCallback<T = unknown, R = void> = (data: T) => Promise<R> | R;

interface HookMetadata {
  pluginId: string;
  priority: number;
  timeout?: number;
}

interface RegisteredHook<T = unknown, R = void> {
  callback: HookCallback<T, R>;
  metadata: HookMetadata;
}

export class PluginHookSystem {
  private static instance: PluginHookSystem;
  private hooks: Map<string, RegisteredHook[]>;
  private hookTimeouts: Map<string, number>;

  private constructor() {
    this.hooks = new Map();
    this.hookTimeouts = new Map();
  }

  static getInstance(): PluginHookSystem {
    if (!PluginHookSystem.instance) {
      PluginHookSystem.instance = new PluginHookSystem();
    }
    return PluginHookSystem.instance;
  }

  registerHook<T = unknown, R = void>(
    hookName: string,
    callback: HookCallback<T, R>,
    plugin: PluginManifest,
    options: {
      priority?: number;
      timeout?: number;
    } = {}
  ): () => void {
    const hook: RegisteredHook<T, R> = {
      callback,
      metadata: {
        pluginId: plugin.id,
        priority: options.priority || 10,
        timeout: options.timeout,
      },
    };

    const hooks = this.hooks.get(hookName) || [];
    hooks.push(hook);
    
    // Sort hooks by priority (higher priority first)
    hooks.sort((a, b) => b.metadata.priority - a.metadata.priority);
    
    this.hooks.set(hookName, hooks);

    // Update hook timeout if necessary
    if (options.timeout) {
      const currentTimeout = this.hookTimeouts.get(hookName) || 0;
      this.hookTimeouts.set(hookName, Math.max(currentTimeout, options.timeout));
    }

    // Return unregister function
    return () => {
      const hooksList = this.hooks.get(hookName) || [];
      const index = hooksList.findIndex(h => h === hook);
      if (index !== -1) {
        hooksList.splice(index, 1);
        if (hooksList.length === 0) {
          this.hooks.delete(hookName);
          this.hookTimeouts.delete(hookName);
        } else {
          this.hooks.set(hookName, hooksList);
        }
      }
    };
  }

  async executeHook<T = unknown, R = void>(
    hookName: string,
    data: T,
    options: {
      parallel?: boolean;
      stopOnError?: boolean;
      timeout?: number;
    } = {}
  ): Promise<R[]> {
    const hooks = this.hooks.get(hookName) || [];
    const timeout = options.timeout || this.hookTimeouts.get(hookName) || 5000;

    if (options.parallel) {
      return this.executeParallel<T, R>(hooks, data, timeout, options.stopOnError);
    } else {
      return this.executeSerial<T, R>(hooks, data, timeout, options.stopOnError);
    }
  }

  private async executeParallel<T, R>(
    hooks: RegisteredHook<T, R>[],
    data: T,
    timeout: number,
    stopOnError = false
  ): Promise<R[]> {
    const promises = hooks.map(hook =>
      this.executeHookWithTimeout(hook, data, timeout)
        .catch(error => {
          if (stopOnError) {
            throw error;
          }
          console.error(
            `Error in plugin ${hook.metadata.pluginId} hook:`,
            error
          );
          return null;
        })
    );

    return Promise.all(promises);
  }

  private async executeSerial<T, R>(
    hooks: RegisteredHook<T, R>[],
    data: T,
    timeout: number,
    stopOnError = false
  ): Promise<R[]> {
    const results: R[] = [];

    for (const hook of hooks) {
      try {
        const result = await this.executeHookWithTimeout(hook, data, timeout);
        results.push(result);
      } catch (error) {
        if (stopOnError) {
          throw error;
        }
        console.error(
          `Error in plugin ${hook.metadata.pluginId} hook:`,
          error
        );
        results.push(null as R);
      }
    }

    return results;
  }

  private async executeHookWithTimeout<T, R>(
    hook: RegisteredHook<T, R>,
    data: T,
    timeout: number
  ): Promise<R> {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => {
        reject(new Error(`Hook execution timed out after ${timeout}ms`));
      }, timeout)
    );

    const hookPromise = Promise.resolve(hook.callback(data));
    return Promise.race([hookPromise, timeoutPromise]);
  }

  getRegisteredHooks(): string[] {
    return Array.from(this.hooks.keys());
  }

  getHookSubscribers(hookName: string): string[] {
    const hooks = this.hooks.get(hookName) || [];
    return hooks.map(hook => hook.metadata.pluginId);
  }
}
