---
sidebar_position: 2
---

# Plugin Manifest

The plugin manifest (`plugin.json`) defines your plugin's metadata and requirements.

## Required Fields

```json
{
  "id": "unique-plugin-id",
  "name": "Plugin Display Name",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Your Name",
  "permissions": ["document:read"]
}
```

### Field Descriptions

- `id`: Unique identifier for your plugin
- `name`: Display name shown in the UI
- `version`: Semantic version number
- `description`: Short description of functionality
- `author`: Plugin creator's name
- `permissions`: Array of required permissions

## Optional Fields

```json
{
  "dependencies": {
    "@prettier/plugin-typescript": "^10.0.0"
  },
  "homepage": "https://github.com/you/plugin",
  "repository": "github:you/plugin",
  "bugs": "https://github.com/you/plugin/issues",
  "keywords": ["formatter", "typescript"]
}
```

## Version Requirements

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Update version when publishing changes
- Document breaking changes in MAJOR versions

## Best Practices

1. Keep descriptions concise and clear
2. Request only necessary permissions
3. Use specific dependency versions
4. Include helpful keywords for discovery
