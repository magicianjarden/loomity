import { createHash } from 'crypto';
import { sanitizeHtml } from 'sanitize-html';

export class ContentSecurity {
  private trustedHosts: Set<string>;
  private fileAccessPaths: Map<string, Set<string>>;

  constructor() {
    this.trustedHosts = new Set(['api.loomity.com']);
    this.fileAccessPaths = new Map();
  }

  sanitizeHTML(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'code', 'pre'],
      allowedAttributes: {
        'a': ['href', 'target'],
        'code': ['class']
      },
      allowedSchemes: ['http', 'https', 'mailto']
    });
  }

  validateURL(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return this.trustedHosts.has(parsedUrl.hostname);
    } catch {
      return false;
    }
  }

  validateFileAccess(pluginId: string, filePath: string): boolean {
    const allowedPaths = this.fileAccessPaths.get(pluginId);
    if (!allowedPaths) return false;

    return Array.from(allowedPaths).some(allowedPath => 
      filePath.startsWith(allowedPath)
    );
  }

  grantFileAccess(pluginId: string, path: string): void {
    if (!this.fileAccessPaths.has(pluginId)) {
      this.fileAccessPaths.set(pluginId, new Set());
    }
    this.fileAccessPaths.get(pluginId)?.add(path);
  }

  revokeFileAccess(pluginId: string, path?: string): void {
    if (path) {
      this.fileAccessPaths.get(pluginId)?.delete(path);
    } else {
      this.fileAccessPaths.delete(pluginId);
    }
  }

  validateInput(input: string): boolean {
    // Check for common injection patterns
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /data:/gi,
      /vbscript:/gi,
      /on\w+=/gi
    ];

    return !dangerousPatterns.some(pattern => pattern.test(input));
  }

  computeHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  verifyIntegrity(content: string, expectedHash: string): boolean {
    const actualHash = this.computeHash(content);
    return actualHash === expectedHash;
  }
}
