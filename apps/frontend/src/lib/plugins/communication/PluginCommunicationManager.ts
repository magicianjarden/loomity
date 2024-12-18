import { PluginManifest } from '../types/PluginManifest';
import { PluginEventBus } from './PluginEventBus';
import { PluginHookSystem } from '../hooks/PluginHookSystem';
import { PluginMessageQueue } from './PluginMessageQueue';

export class PluginCommunicationManager {
  private readonly eventBus: PluginEventBus;
  private readonly hookSystem: PluginHookSystem;
  private readonly messageQueue: PluginMessageQueue;
  private readonly manifest: PluginManifest;

  constructor(
    manifest: PluginManifest,
    options: {
      queueSize?: number;
      processInterval?: number;
    } = {}
  ) {
    this.manifest = manifest;
    this.eventBus = PluginEventBus.getInstance();
    this.hookSystem = PluginHookSystem.getInstance();
    this.messageQueue = PluginMessageQueue.getInstance(options);
  }

  // Event System Methods
  async emit(eventName: string, data: unknown): Promise<void> {
    await this.eventBus.publish(eventName, data, this.manifest);
  }

  on(
    eventName: string,
    callback: (data: unknown) => void | Promise<void>,
    options: {
      filter?: (data: unknown) => boolean;
      receiveHistory?: boolean;
    } = {}
  ): () => void {
    return this.eventBus.subscribe(
      eventName,
      callback,
      this.manifest,
      options
    );
  }

  // Hook System Methods
  registerHook<T = unknown, R = void>(
    hookName: string,
    callback: (data: T) => Promise<R> | R,
    options: {
      priority?: number;
      timeout?: number;
    } = {}
  ): () => void {
    return this.hookSystem.registerHook(
      hookName,
      callback,
      this.manifest,
      options
    );
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
    return this.hookSystem.executeHook(hookName, data, options);
  }

  // Message Queue Methods
  async sendMessage(
    message: {
      target: string;
      type: string;
      payload: unknown;
      priority?: number;
      maxAttempts?: number;
    }
  ): Promise<string> {
    return this.messageQueue.enqueue(
      {
        ...message,
        priority: message.priority || 0,
        maxAttempts: message.maxAttempts || 3,
      },
      this.manifest
    );
  }

  onMessage(
    messageType: string,
    callback: (message: unknown) => Promise<void>
  ): () => void {
    return this.messageQueue.registerHandler(
      messageType,
      callback,
      this.manifest
    );
  }

  // Utility Methods
  getEventNames(): string[] {
    return this.eventBus.getEventNames();
  }

  getRegisteredHooks(): string[] {
    return this.hookSystem.getRegisteredHooks();
  }

  getQueueStatus(): {
    length: number;
    handlers: number;
    processing: boolean;
  } {
    return this.messageQueue.getQueueStatus();
  }

  // Cleanup Method
  cleanup(): void {
    this.eventBus.clearHistory();
    this.messageQueue.clearQueue();
  }
}
