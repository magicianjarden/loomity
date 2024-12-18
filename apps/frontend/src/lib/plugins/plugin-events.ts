import { EventEmitter } from 'events';

export type PluginEventCallback = (...args: any[]) => void | Promise<void>;

export interface PluginEventMap {
  'user:login': (userId: string) => void;
  'user:logout': () => void;
  'content:create': (contentId: string, content: any) => void;
  'content:update': (contentId: string, content: any) => void;
  'content:delete': (contentId: string) => void;
  'theme:change': (themeId: string) => void;
  'plugin:beforeInstall': (pluginId: string) => void;
  'plugin:afterInstall': (pluginId: string) => void;
  'plugin:beforeUninstall': (pluginId: string) => void;
  'plugin:afterUninstall': (pluginId: string) => void;
  'plugin:error': (pluginId: string, error: Error) => void;
}

export class PluginEventSystem {
  private static instance: PluginEventSystem;
  private emitter: EventEmitter;
  private registeredEvents: Map<string, Set<string>> = new Map();

  private constructor() {
    this.emitter = new EventEmitter();
    // Increase max listeners to handle multiple plugins
    this.emitter.setMaxListeners(100);
  }

  public static getInstance(): PluginEventSystem {
    if (!PluginEventSystem.instance) {
      PluginEventSystem.instance = new PluginEventSystem();
    }
    return PluginEventSystem.instance;
  }

  public registerPluginEvents(pluginId: string, events: Array<keyof PluginEventMap>) {
    const pluginEvents = this.registeredEvents.get(pluginId) || new Set();
    events.forEach(event => pluginEvents.add(event));
    this.registeredEvents.set(pluginId, pluginEvents);
  }

  public unregisterPluginEvents(pluginId: string) {
    const events = this.registeredEvents.get(pluginId);
    if (events) {
      events.forEach(event => {
        this.emitter.removeAllListeners(`${pluginId}:${event}`);
      });
      this.registeredEvents.delete(pluginId);
    }
  }

  public on<T extends keyof PluginEventMap>(
    pluginId: string,
    event: T,
    callback: PluginEventMap[T]
  ) {
    const eventName = `${pluginId}:${event}`;
    this.emitter.on(eventName, callback);
  }

  public emit<T extends keyof PluginEventMap>(
    event: T,
    ...args: Parameters<PluginEventMap[T]>
  ) {
    this.registeredEvents.forEach((events, pluginId) => {
      if (events.has(event)) {
        const eventName = `${pluginId}:${event}`;
        this.emitter.emit(eventName, ...args);
      }
    });
  }

  public removeListener<T extends keyof PluginEventMap>(
    pluginId: string,
    event: T,
    callback: PluginEventMap[T]
  ) {
    const eventName = `${pluginId}:${event}`;
    this.emitter.removeListener(eventName, callback);
  }
}

export const pluginEvents = PluginEventSystem.getInstance();
