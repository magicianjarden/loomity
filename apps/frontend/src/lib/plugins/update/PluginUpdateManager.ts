import { PluginManifest } from '../types/PluginManifest';
import { PluginVersionManager } from '../version/PluginVersionManager';

interface UpdateProgress {
  status: 'downloading' | 'verifying' | 'installing' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

type ProgressCallback = (progress: UpdateProgress) => void;

export class PluginUpdateManager {
  private versionManager: PluginVersionManager;

  constructor(
    private readonly manifest: PluginManifest,
    private readonly options: {
      autoUpdate?: boolean;
      updateCheckInterval?: number;
    } = {}
  ) {
    this.versionManager = new PluginVersionManager(manifest);
    
    if (options.autoUpdate) {
      this.startAutoUpdateCheck(options.updateCheckInterval || 3600000); // Default: 1 hour
    }
  }

  private startAutoUpdateCheck(interval: number): void {
    setInterval(async () => {
      const update = await this.versionManager.checkForUpdates();
      if (update) {
        this.emit('update-available', update);
      }
    }, interval);
  }

  async downloadUpdate(
    version: string,
    onProgress?: ProgressCallback
  ): Promise<ArrayBuffer> {
    try {
      onProgress?.({
        status: 'downloading',
        progress: 0,
      });

      const response = await fetch(`/api/plugins/${this.manifest.id}/download/${version}`);
      
      if (!response.ok) {
        throw new Error('Failed to download update');
      }

      const reader = response.body?.getReader();
      const contentLength = Number(response.headers.get('Content-Length')) || 0;
      
      if (!reader) {
        throw new Error('Failed to initialize download');
      }

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        chunks.push(value);
        receivedLength += value.length;

        onProgress?.({
          status: 'downloading',
          progress: (receivedLength / contentLength) * 100,
        });
      }

      const allChunks = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      onProgress?.({
        status: 'completed',
        progress: 100,
      });

      return allChunks.buffer;
    } catch (error) {
      onProgress?.({
        status: 'failed',
        progress: 0,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async verifyUpdate(
    updateData: ArrayBuffer,
    expectedHash: string,
    onProgress?: ProgressCallback
  ): Promise<boolean> {
    try {
      onProgress?.({
        status: 'verifying',
        progress: 0,
      });

      const hashBuffer = await crypto.subtle.digest('SHA-256', updateData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      onProgress?.({
        status: 'verifying',
        progress: 100,
      });

      return hashHex === expectedHash;
    } catch (error) {
      onProgress?.({
        status: 'failed',
        progress: 0,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async installUpdate(
    updateData: ArrayBuffer,
    onProgress?: ProgressCallback
  ): Promise<void> {
    try {
      onProgress?.({
        status: 'installing',
        progress: 0,
      });

      // Convert ArrayBuffer to Blob
      const blob = new Blob([updateData], { type: 'application/zip' });
      const formData = new FormData();
      formData.append('update', blob);

      const response = await fetch(`/api/plugins/${this.manifest.id}/install`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to install update');
      }

      onProgress?.({
        status: 'completed',
        progress: 100,
      });
    } catch (error) {
      onProgress?.({
        status: 'failed',
        progress: 0,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  private emit(event: string, data: unknown): void {
    // Implement event emission logic
    window.dispatchEvent(new CustomEvent(`plugin:${this.manifest.id}:${event}`, {
      detail: data,
    }));
  }
}
