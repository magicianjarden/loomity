import { PluginManifest } from '../types/PluginManifest';

interface QueueMessage {
  id: string;
  source: string;
  target: string;
  type: string;
  payload: unknown;
  timestamp: number;
  priority: number;
  attempts: number;
  maxAttempts: number;
  deliveredAt?: number;
}

interface MessageHandler {
  pluginId: string;
  callback: (message: QueueMessage) => Promise<void>;
}

export class PluginMessageQueue {
  private static instance: PluginMessageQueue;
  private queue: QueueMessage[];
  private handlers: Map<string, MessageHandler[]>;
  private processing: boolean;
  private readonly maxQueueSize: number;
  private readonly processInterval: number;

  private constructor(options: {
    maxQueueSize?: number;
    processInterval?: number;
  } = {}) {
    this.queue = [];
    this.handlers = new Map();
    this.processing = false;
    this.maxQueueSize = options.maxQueueSize || 1000;
    this.processInterval = options.processInterval || 100;
    this.startProcessing();
  }

  static getInstance(options?: {
    maxQueueSize?: number;
    processInterval?: number;
  }): PluginMessageQueue {
    if (!PluginMessageQueue.instance) {
      PluginMessageQueue.instance = new PluginMessageQueue(options);
    }
    return PluginMessageQueue.instance;
  }

  async enqueue(
    message: Omit<QueueMessage, 'id' | 'timestamp' | 'attempts'>,
    source: PluginManifest
  ): Promise<string> {
    if (this.queue.length >= this.maxQueueSize) {
      throw new Error('Message queue is full');
    }

    const queueMessage: QueueMessage = {
      ...message,
      id: this.generateMessageId(),
      source: source.id,
      timestamp: Date.now(),
      attempts: 0,
    };

    // Insert message based on priority
    const insertIndex = this.queue.findIndex(
      m => m.priority < queueMessage.priority
    );
    if (insertIndex === -1) {
      this.queue.push(queueMessage);
    } else {
      this.queue.splice(insertIndex, 0, queueMessage);
    }

    return queueMessage.id;
  }

  registerHandler(
    messageType: string,
    callback: (message: QueueMessage) => Promise<void>,
    plugin: PluginManifest
  ): () => void {
    const handler: MessageHandler = {
      pluginId: plugin.id,
      callback,
    };

    const handlers = this.handlers.get(messageType) || [];
    handlers.push(handler);
    this.handlers.set(messageType, handlers);

    return () => {
      const handlerList = this.handlers.get(messageType) || [];
      const index = handlerList.findIndex(h => h === handler);
      if (index !== -1) {
        handlerList.splice(index, 1);
        if (handlerList.length === 0) {
          this.handlers.delete(messageType);
        } else {
          this.handlers.set(messageType, handlerList);
        }
      }
    };
  }

  private async startProcessing(): Promise<void> {
    if (this.processing) return;

    this.processing = true;
    while (true) {
      if (this.queue.length === 0) {
        await new Promise(resolve => setTimeout(resolve, this.processInterval));
        continue;
      }

      const message = this.queue[0];
      const handlers = this.handlers.get(message.type) || [];

      if (handlers.length === 0) {
        // No handlers for this message type, remove it
        this.queue.shift();
        continue;
      }

      try {
        await Promise.all(
          handlers.map(handler => this.deliverMessage(message, handler))
        );
        message.deliveredAt = Date.now();
        this.queue.shift();
      } catch (error) {
        message.attempts++;
        if (message.attempts >= message.maxAttempts) {
          // Message failed too many times, remove it
          this.queue.shift();
          console.error(
            `Message ${message.id} failed after ${message.attempts} attempts:`,
            error
          );
        } else {
          // Move message to the end of its priority level
          this.queue.shift();
          const insertIndex = this.queue.findIndex(
            m => m.priority < message.priority
          );
          if (insertIndex === -1) {
            this.queue.push(message);
          } else {
            this.queue.splice(insertIndex, 0, message);
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, this.processInterval));
    }
  }

  private async deliverMessage(
    message: QueueMessage,
    handler: MessageHandler
  ): Promise<void> {
    if (
      message.target &&
      message.target !== '*' &&
      message.target !== handler.pluginId
    ) {
      return;
    }

    await handler.callback(message);
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getQueueStatus(): {
    length: number;
    handlers: number;
    processing: boolean;
  } {
    return {
      length: this.queue.length,
      handlers: Array.from(this.handlers.values()).reduce(
        (acc, handlers) => acc + handlers.length,
        0
      ),
      processing: this.processing,
    };
  }

  clearQueue(): void {
    this.queue = [];
  }
}
