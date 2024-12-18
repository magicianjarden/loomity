---
sidebar_position: 4
---

# Managing Dependencies

Learn how to work with dependencies in Loomity plugins.

## Built-in Dependencies

Loomity provides several built-in dependencies that are always available:

### Core Libraries
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components

### Utility Libraries
- lodash
- date-fns
- zod

### Code Processing
- Prettier
- ESLint
- TypeScript compiler

## Declaring Dependencies

In your `plugin.json`:
```json
{
  "dependencies": {
    "@prettier/plugin-typescript": "^10.0.0",
    "@prettier/plugin-css": "^3.0.0"
  }
}
```

## Version Management

1. **Specifying Versions**
   - Use exact versions for stability
   - Use semver ranges carefully
   - Document version requirements

2. **Version Conflicts**
   - Handle dependency conflicts
   - Use peer dependencies
   - Test with different versions

## Best Practices

1. **Dependency Selection**
   - Use built-in dependencies when possible
   - Choose well-maintained packages
   - Consider bundle size

2. **Security**
   - Regular security updates
   - Audit dependencies
   - Use trusted sources

3. **Performance**
   - Minimize dependency count
   - Use tree-shaking friendly imports
   - Consider lazy loading

## Example Usage

```typescript
// Using built-in dependencies
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@loomity/ui';

// Define schema
const schema = z.object({
  name: z.string(),
  date: z.date()
});

// Format date
const formattedDate = format(new Date(), 'yyyy-MM-dd');

// Use UI components
function MyComponent() {
  return <Button>Click Me</Button>;
}
```
