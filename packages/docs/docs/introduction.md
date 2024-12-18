---
sidebar_position: 1
---

# Introduction to Loomity Plugins

Welcome to the Loomity Plugin Documentation! This guide will help you understand how to create, test, and publish plugins for the Loomity platform.

## What are Loomity Plugins?

Loomity plugins are extensions that add new features and functionality to the Loomity platform. They can:
- Modify documents
- Add UI elements
- Process data
- Integrate with external services
- And much more!

## Plugin Architecture

Plugins in Loomity are built on a secure, sandboxed architecture that provides:

- **Isolation**: Each plugin runs in its own context
- **Security**: Permissions-based access to platform features
- **API Access**: Clean, typed APIs for interacting with Loomity
- **Event System**: Rich event system for reacting to platform changes

## Getting Started

To start building your first plugin, check out:
1. [Quick Start Guide](quick-start.md)
2. [Installation](installation.md)
3. [Creating Plugins](guides/creating-plugins.md)

## Example Plugin

Here's a simple example of a Loomity plugin:

```typescript
export default {
  id: 'my-first-plugin',
  name: 'My First Plugin',
  version: '1.0.0',
  description: 'A simple example plugin',
  author: 'Your Name',
  permissions: ['document:read', 'ui:toast'],
  
  activate: (context) => {
    context.api.ui.showToast('Plugin activated!');
  },
  
  deactivate: () => {
    console.log('Plugin deactivated');
  }
};
```

## Next Steps

- Learn about the [Plugin Manifest](guides/plugin-manifest.md)
- Understand [Permissions](guides/permissions.md)
- Explore the [API Reference](api/plugin-api.md)
