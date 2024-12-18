import { PluginManifest } from '../types/PluginManifest';

type EventCallback = (data: unknown) => void | Promise<void>;

interface EventSubscription {
  pluginId: string;
  callback: EventCallback;
  filter?: (data: unknown) => boolean;
}

export class PluginEventBus {
  private static instance: PluginEventBus;
  private subscribers: Map<string, EventSubscription[]>;
  private eventHistory: Map<string, unknown[]>;
  private readonly maxHistorySize = 100;

  private constructor() {
    this.subscribers = new Map();
    this.eventHistory = new Map();
  }

  static getInstance(): PluginEventBus {
    if (!PluginEventBus.instance) {
      PluginEventBus.instance = new PluginEventBus();
    }
    return PluginEventBus.instance;
  }

  async publish(
    eventName: string,
    data: unknown,
    source: PluginManifest
  ): Promise<void> {
    const fullEventName = `${source.id}:${eventName}`;
    
    // Store in history
    this.storeInHistory(fullEventName, data);

    // Notify subscribers
    const subscribers = this.subscribers.get(fullEventName) || [];
    const promises = subscribers
      .filter(sub => !sub.filter || sub.filter(data))
      .map(sub => this.notifySubscriber(sub, data));

    await Promise.all(promises);
  }

  subscribe(
    eventName: string,
    callback: EventCallback,
    subscriber: PluginManifest,
    options: {
      filter?: (data: unknown) => boolean;
      receiveHistory?: boolean;
    } = {}
  ): () => void {
    const subscription: EventSubscription = {
      pluginId: subscriber.id,
      callback,
      filter: options.filter,
    };

    const subscribers = this.subscribers.get(eventName) || [];
    subscribers.push(subscription);
    this.subscribers.set(eventName, subscribers);

    // Send historical events if requested
    if (options.receiveHistory) {
      const history = this.eventHistory.get(eventName) || [];
      history
        .filter(data => !options.filter || options.filter(data))
        .forEach(data => callback(data));
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(eventName) || [];
      const index = subs.findIndex(sub => sub === subscription);
      if (index !== -1) {
        subs.splice(index, 1);
        if (subs.length === 0) {
          this.subscribers.delete(eventName);
        } else {
          this.subscribers.set(eventName, subs);
        }
      }
    };
  }

  private async notifySubscriber(
    subscription: EventSubscription,
    data: unknown
  ): Promise<void> {
    try {
      await subscription.callback(data);
    } catch (error) {
      console.error(
        `Error notifying plugin ${subscription.pluginId}:`,
        error
      );
    }
  }

  private storeInHistory(eventName: string, data: unknown): void {
    const history = this.eventHistory.get(eventName) || [];
    history.push(data);
    
    // Maintain history size limit
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
    
    this.eventHistory.set(eventName, history);
  }

  clearHistory(eventName?: string): void {
    if (eventName) {
      this.eventHistory.delete(eventName);
    } else {
      this.eventHistory.clear();
    }
  }

  getSubscriberCount(eventName: string): number {
    return this.subscribers.get(eventName)?.length || 0;
  }

  getEventNames(): string[] {
    return Array.from(this.subscribers.keys());
  }
}
