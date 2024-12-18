# Loomity Plugin Development Guide

This guide will help you create plugins for the Loomity platform. Plugins can extend the platform's functionality, add new features, and integrate with external services.

## Table of Contents
- [Getting Started](#getting-started)
- [Plugin Structure](#plugin-structure)
- [Plugin Manifest](#plugin-manifest)
- [Lifecycle Methods](#lifecycle-methods)
- [Configuration](#configuration)
- [Example Plugin](#example-plugin)
- [Publishing Guidelines](#publishing-guidelines)

## Getting Started

To create a plugin for Loomity, you'll need:
- Node.js 18 or higher
- TypeScript knowledge
- Understanding of React (for UI components)

## Plugin Structure

A basic plugin structure looks like this:

```typescript
interface PluginModule {
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onActivate?: () => Promise<void>;
  onDeactivate?: () => Promise<void>;
  onConfigChange?: (config: PluginConfiguration) => Promise<void>;
}
```

## Plugin Manifest

Every plugin requires a manifest file (`plugin.json`):

```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "A plugin that does awesome things",
  "author": "Your Name",
  "license": "MIT",
  "tags": ["utility", "productivity"],
  "configSchema": {
    "type": "object",
    "properties": {
      "apiKey": {
        "type": "string",
        "title": "API Key",
        "description": "Your API key for the service"
      },
      "enableFeature": {
        "type": "boolean",
        "title": "Enable Feature",
        "description": "Toggle this awesome feature",
        "default": true
      },
      "refreshInterval": {
        "type": "number",
        "title": "Refresh Interval",
        "description": "How often to refresh (in minutes)",
        "default": 5,
        "minimum": 1,
        "maximum": 60
      }
    },
    "required": ["apiKey"]
  }
}
```

## Lifecycle Methods

### onInstall
Called when the plugin is first installed. Use this to set up any initial state or resources.

```typescript
export async function onInstall(): Promise<void> {
  // Initialize plugin resources
  await setupDatabase();
  await createInitialState();
}
```

### onUninstall
Called when the plugin is being removed. Clean up any resources here.

```typescript
export async function onUninstall(): Promise<void> {
  // Clean up resources
  await removeData();
  await disconnectServices();
}
```

### onActivate
Called when the plugin is enabled by the user.

```typescript
export async function onActivate(): Promise<void> {
  // Start plugin features
  await startBackgroundTasks();
  await registerEventListeners();
}
```

### onDeactivate
Called when the plugin is disabled by the user.

```typescript
export async function onDeactivate(): Promise<void> {
  // Stop plugin features
  await stopBackgroundTasks();
  await removeEventListeners();
}
```

### onConfigChange
Called when the plugin's configuration is updated.

```typescript
export async function onConfigChange(config: PluginConfiguration): Promise<void> {
  // Handle configuration changes
  await updateServices(config);
  await refreshState(config);
}
```

## Configuration

Plugins can define their configuration schema in the manifest file. The schema follows JSON Schema format and supports:
- String inputs
- Number inputs
- Boolean toggles
- Select dropdowns
- Custom validation rules

## Example Plugin

Here's a complete example of a simple plugin that adds a custom dashboard widget:

```typescript
// plugin.ts
import { PluginModule, PluginConfiguration } from '@loomity/plugin-sdk';

interface WeatherConfig {
  apiKey: string;
  location: string;
  refreshInterval: number;
}

export class WeatherPlugin implements PluginModule {
  private refreshTimer?: NodeJS.Timer;
  private config: WeatherConfig;

  async onInstall(): Promise<void> {
    console.log('Weather plugin installed');
  }

  async onUninstall(): Promise<void> {
    this.clearRefreshTimer();
    console.log('Weather plugin uninstalled');
  }

  async onActivate(): Promise<void> {
    await this.startWeatherUpdates();
    console.log('Weather plugin activated');
  }

  async onDeactivate(): Promise<void> {
    this.clearRefreshTimer();
    console.log('Weather plugin deactivated');
  }

  async onConfigChange(config: PluginConfiguration): Promise<void> {
    this.config = config as WeatherConfig;
    await this.restartWeatherUpdates();
    console.log('Weather plugin configuration updated');
  }

  private async startWeatherUpdates(): Promise<void> {
    await this.updateWeather();
    this.refreshTimer = setInterval(
      () => this.updateWeather(),
      this.config.refreshInterval * 60 * 1000
    );
  }

  private async updateWeather(): Promise<void> {
    try {
      const response = await fetch(
        `https://api.weather.com/data?location=${this.config.location}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );
      const data = await response.json();
      // Update widget with weather data
    } catch (error) {
      console.error('Failed to update weather:', error);
    }
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  private async restartWeatherUpdates(): Promise<void> {
    this.clearRefreshTimer();
    await this.startWeatherUpdates();
  }
}
```

```json
// plugin.json
{
  "name": "weather-widget",
  "version": "1.0.0",
  "description": "Adds a weather widget to your dashboard",
  "author": "Your Name",
  "license": "MIT",
  "tags": ["widget", "weather", "dashboard"],
  "configSchema": {
    "type": "object",
    "properties": {
      "apiKey": {
        "type": "string",
        "title": "Weather API Key",
        "description": "Your API key from weather.com"
      },
      "location": {
        "type": "string",
        "title": "Location",
        "description": "City name or coordinates",
        "default": "New York"
      },
      "refreshInterval": {
        "type": "number",
        "title": "Refresh Interval",
        "description": "How often to update the weather (in minutes)",
        "default": 30,
        "minimum": 5,
        "maximum": 120
      }
    },
    "required": ["apiKey", "location"]
  }
}
```

## Publishing Guidelines

To publish your plugin to the Loomity Marketplace:

1. **Testing**
   - Test all lifecycle methods
   - Verify configuration changes
   - Check error handling
   - Test performance impact

2. **Documentation**
   - Provide clear installation instructions
   - Document all configuration options
   - Include usage examples
   - List any external dependencies

3. **Security**
   - Never expose sensitive credentials
   - Use secure API endpoints
   - Implement proper error handling
   - Follow security best practices

4. **Performance**
   - Minimize resource usage
   - Implement proper cleanup
   - Use efficient data structures
   - Cache when appropriate

5. **Submission**
   - Package your plugin
   - Create detailed marketplace listing
   - Submit for review
   - Respond to feedback

## Best Practices

1. **Error Handling**
   - Always use try-catch blocks
   - Provide meaningful error messages
   - Implement graceful fallbacks
   - Log errors appropriately

2. **State Management**
   - Use proper state containers
   - Implement proper cleanup
   - Handle state persistence
   - Manage side effects

3. **UI Integration**
   - Follow Loomity's design system
   - Make UI components responsive
   - Support dark/light themes
   - Use proper accessibility attributes

4. **Testing**
   - Write unit tests
   - Include integration tests
   - Test error scenarios
   - Verify cleanup procedures

## Support

For plugin development support:
- Join our Discord community
- Check the developer documentation
- Submit issues on GitHub
- Contact the plugin review team

Remember to keep your plugin updated and maintain compatibility with the latest version of Loomity.
