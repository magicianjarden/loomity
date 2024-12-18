---
sidebar_position: 3
---

# Installation

Learn how to install and set up your development environment for Loomity plugin development.

## System Requirements

- Node.js (version 18 or higher)
- npm or yarn
- Git (recommended)

## Development Tools

1. **Install the Loomity CLI**:
```bash
npm install -g @loomity/cli
```

2. **Install TypeScript**:
```bash
npm install -g typescript
```

## Project Setup

1. **Create a New Plugin Project**:
```bash
loomity create-plugin my-plugin
```

2. **Install Dependencies**:
```bash
cd my-plugin
npm install
```

## Editor Setup

We recommend using Visual Studio Code with the following extensions:

- TypeScript and JavaScript Language Features
- ESLint
- Prettier

## Configuration Files

1. **TypeScript Configuration** (`tsconfig.json`):
```json
{
  "extends": "@loomity/typescript-config/plugin.json",
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

2. **ESLint Configuration** (`.eslintrc.js`):
```javascript
module.exports = {
  extends: ['@loomity/eslint-config/plugin'],
};
```

## Next Steps

- Follow the [Quick Start Guide](quick-start.md)
- Learn about [Plugin Development](guides/creating-plugins.md)
- Explore [Example Plugins](examples/basic-plugin.md)
