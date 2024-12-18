import { create } from 'zustand';
import { PluginManifest } from '../types/PluginManifest';

interface PluginState {
  id: string;
  version: string;
  enabled: boolean;
  loading: boolean;
  error: Error | null;
  data: Record<string, unknown>;
}

interface PluginStateStore {
  plugins: Record<string, PluginState>;
  setPluginState: (pluginId: string, state: Partial<PluginState>) => void;
  removePlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => PluginState | undefined;
}

export const usePluginStore = create<PluginStateStore>((set, get) => ({
  plugins: {},
  
  setPluginState: (pluginId, state) => 
    set((store) => ({
      plugins: {
        ...store.plugins,
        [pluginId]: {
          ...store.plugins[pluginId],
          ...state,
        },
      },
    })),
    
  removePlugin: (pluginId) =>
    set((store) => {
      const { [pluginId]: removed, ...rest } = store.plugins;
      return { plugins: rest };
    }),
    
  getPlugin: (pluginId) => get().plugins[pluginId],
}));

export class PluginStateManager {
  private readonly pluginId: string;

  constructor(private readonly manifest: PluginManifest) {
    this.pluginId = manifest.id;
  }

  initialize(): void {
    usePluginStore.getState().setPluginState(this.pluginId, {
      id: this.pluginId,
      version: this.manifest.version,
      enabled: false,
      loading: false,
      error: null,
      data: {},
    });
  }

  setState<T extends keyof PluginState>(
    key: T,
    value: PluginState[T]
  ): void {
    usePluginStore.getState().setPluginState(this.pluginId, {
      [key]: value,
    } as Partial<PluginState>);
  }

  getState(): PluginState | undefined {
    return usePluginStore.getState().getPlugin(this.pluginId);
  }

  setData<T>(key: string, value: T): void {
    const currentState = this.getState();
    if (currentState) {
      this.setState('data', {
        ...currentState.data,
        [key]: value,
      });
    }
  }

  getData<T>(key: string): T | undefined {
    const currentState = this.getState();
    return currentState?.data[key] as T | undefined;
  }

  cleanup(): void {
    usePluginStore.getState().removePlugin(this.pluginId);
  }
}
