import { EventEmitter } from '../events/event-emitter';

interface ResourceLimits {
  maxMemoryMB: number;
  maxCPUPercent: number;
  maxStorageBytes: number;
  maxAPICallsPerMinute: number;
}

interface ResourceUsage {
  memoryUsage: number;
  cpuUsage: number;
  storageUsage: number;
  apiCallCount: number;
}

export class ResourceMonitor {
  private pluginUsage: Map<string, ResourceUsage> = new Map();
  private limits: ResourceLimits;
  private eventEmitter: EventEmitter;

  constructor(limits: ResourceLimits, eventEmitter: EventEmitter) {
    this.limits = limits;
    this.eventEmitter = eventEmitter;
  }

  initializePlugin(pluginId: string): void {
    this.pluginUsage.set(pluginId, {
      memoryUsage: 0,
      cpuUsage: 0,
      storageUsage: 0,
      apiCallCount: 0,
    });
  }

  trackAPICall(pluginId: string): boolean {
    const usage = this.pluginUsage.get(pluginId);
    if (!usage) return false;

    usage.apiCallCount++;
    if (usage.apiCallCount > this.limits.maxAPICallsPerMinute) {
      this.eventEmitter.emit('plugin:limit-exceeded', {
        pluginId,
        limit: 'API calls',
        current: usage.apiCallCount,
        max: this.limits.maxAPICallsPerMinute,
      });
      return false;
    }
    return true;
  }

  trackMemoryUsage(pluginId: string, bytes: number): boolean {
    const usage = this.pluginUsage.get(pluginId);
    if (!usage) return false;

    const mbUsed = bytes / (1024 * 1024);
    usage.memoryUsage = mbUsed;

    if (mbUsed > this.limits.maxMemoryMB) {
      this.eventEmitter.emit('plugin:limit-exceeded', {
        pluginId,
        limit: 'memory',
        current: mbUsed,
        max: this.limits.maxMemoryMB,
      });
      return false;
    }
    return true;
  }

  trackStorageUsage(pluginId: string, bytes: number): boolean {
    const usage = this.pluginUsage.get(pluginId);
    if (!usage) return false;

    usage.storageUsage = bytes;
    if (bytes > this.limits.maxStorageBytes) {
      this.eventEmitter.emit('plugin:limit-exceeded', {
        pluginId,
        limit: 'storage',
        current: bytes,
        max: this.limits.maxStorageBytes,
      });
      return false;
    }
    return true;
  }

  resetAPICallCount(pluginId: string): void {
    const usage = this.pluginUsage.get(pluginId);
    if (usage) {
      usage.apiCallCount = 0;
    }
  }

  getUsage(pluginId: string): ResourceUsage | undefined {
    return this.pluginUsage.get(pluginId);
  }

  cleanup(pluginId: string): void {
    this.pluginUsage.delete(pluginId);
  }
}
