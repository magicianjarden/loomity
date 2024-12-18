---
sidebar_position: 2
---

# Quick Start

Get started with Loomity plugin development in minutes.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Basic TypeScript knowledge

## Create a New Plugin

```bash
# Create a new plugin project
npx create-loomity-plugin my-first-plugin

# Navigate to the project
cd my-first-plugin

# Install dependencies
npm install
```

## Plugin Structure

Your plugin directory should look like this:

```
my-first-plugin/
├── src/
│   └── index.ts
├── plugin.json
├── package.json
└── tsconfig.json
```

## Write Your First Plugin

1. Edit `plugin.json`:

```json
{
  "id": "my-first-plugin",
  "name": "My First Plugin",
  "version": "1.0.0",
  "description": "My first Loomity plugin",
  "author": "Your Name",
  "permissions": ["document:read", "ui:toast"]
}
```

2. Edit `src/index.ts`:

```typescript
import type { Plugin } from '@loomity/core';

const plugin: Plugin = {
  activate: async (context) => {
    context.api.ui.showToast('Hello from my first plugin!');
  },
  
  deactivate: async () => {
    console.log('Plugin deactivated');
  }
};

export default plugin;
```

## Test Your Plugin

```bash
# Run tests
npm test

# Build the plugin
npm run build
```

## Next Steps

- Learn about [Plugin Manifest](guides/plugin-manifest.md)
- Explore [Available APIs](api/plugin-api.md)
- Check out [Example Plugins](examples/basic-plugin.md)
