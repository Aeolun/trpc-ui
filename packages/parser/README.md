# trpc-router-parser

Most of this code has been taken wholesale from trpc-ui/trpc-panel. I felt it would be really helpful for a lot of applications to have it separate.

## What is this?

This package provides utilities for parsing tRPC routers and procedures into structured data that can be used by UI tools or other applications. It extracts metadata, input schemas, and type information from your tRPC API.

## Features

- Parse tRPC routers into structured objects representing your API's shape
- Extract input schemas as JSON Schema
- Support for queries, mutations, and subscriptions
- Parse Zod validation schemas into structured type definitions
- Preserve metadata like descriptions from your tRPC procedures

## Usage

```typescript
import { parseRouterWithOptions } from 'trpc-router-parser';
import { appRouter } from './your-trpc-router';

const parsedRouter = parseRouterWithOptions(appRouter, {
  logFailedProcedureParse: true,
  transformer: 'superjson'
});

// parsedRouter now contains a structured representation of your tRPC API
```

The parsed output contains detailed information about:
- Router structure and hierarchy
- Procedure types (query/mutation/subscription)
- Input validation schemas
- Type information for inputs

This is useful for generating documentation, building UI tools, or analyzing your API structure programmatically.

## License

MIT
