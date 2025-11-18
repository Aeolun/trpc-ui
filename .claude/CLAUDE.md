# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

trpc-ui is a tool that automatically generates a testing UI and documentation for tRPC v11.0 endpoints. It parses tRPC routers and renders an interactive web interface for manually testing procedures.

This is a pnpm monorepo with three packages:
- **@aeolun/trpc-router-parser**: Core parser that inspects tRPC routers and extracts procedure metadata
- **@aeolun/trpc-ui**: Main package that renders the UI (React components + HTML generation)
- **@aeolun/test-trpc-panel**: Development test application with sample tRPC router

## Development Commands

### Installing Dependencies
```bash
pnpm install
```

### Building
```bash
# Build all packages (from root)
pnpm -r build

# Build individual packages
cd packages/parser && pnpm build
cd packages/trpc-ui && pnpm build
```

### Testing
```bash
# Run parser tests
cd packages/parser && pnpm test

# Run parser tests in watch mode
cd packages/parser && pnpm test:watch

# Run trpc-ui tests
cd packages/trpc-ui && pnpm test

# Run trpc-ui tests in watch mode
cd packages/trpc-ui && pnpm test:watch
```

### Development Server
```bash
# Run the test app with hot reload
cd packages/test-app && pnpm dev
```

This starts an Express server at http://localhost:3000 with livereload enabled. The test app renders the UI for a sample tRPC router defined in `packages/test-app/src/router.ts`.

### Other Commands
```bash
# Type check
cd packages/trpc-ui && pnpm tsc
cd packages/parser && pnpm tsc

# Watch mode for UI development (rebuilds React bundle)
cd packages/trpc-ui && pnpm dev

# Format code
pnpm biome format --write .

# Lint code
pnpm biome lint .
```

## Architecture

### Parser Package (`@aeolun/trpc-router-parser`)

The parser recursively walks a tRPC router tree and extracts metadata about procedures and nested routers.

- **Entry point**: `packages/parser/src/index.ts`
- **Router parsing**: `packages/parser/src/parseRouter.ts` - Recursively processes router structure
- **Procedure parsing**: `packages/parser/src/parseProcedure.ts` - Extracts metadata from individual procedures (input schemas, procedure type, meta)
- **Input mappers**: `packages/parser/src/input-mappers/` - Convert Zod schemas to JSON Schema for form generation
- **Type detection**: `packages/parser/src/routerType.ts` - Determines if a node is a router, procedure, or other

The parser produces a tree structure where each node is either a `ParsedRouter` (with children) or a `ParsedProcedure` (with input schema, type, path, etc.).

### UI Package (`@aeolun/trpc-ui`)

Generates a self-contained HTML page with embedded React application.

- **Entry point**: `packages/trpc-ui/src/index.ts`
- **Render function**: `packages/trpc-ui/src/render.ts` - Main `renderTrpcPanel()` function that:
  1. Parses the router using `@aeolun/trpc-router-parser`
  2. Reads pre-built React bundle, HTML template, and CSS
  3. Injects parsed router data and options into the bundle
  4. Returns complete HTML string with inline scripts and styles
- **React app**: `packages/trpc-ui/src/react-app/` - React components for the UI
  - `index.tsx` - Root component
  - `components/` - UI components (SideNav, form fields, etc.)
  - `components/form/fields/` - Field components for different Zod types

### Build Process (trpc-ui)

The build is controlled by `packages/trpc-ui/build.sh`:
1. TypeScript compilation (`tsc`)
2. Tailwind CSS processing (`npx tailwindcss`)
3. Copy HTML template
4. Bundle React app with esbuild (minified, tree-shaken)

The result is a single `bundle.js` file that gets embedded in the HTML at runtime.

### Data Flow

1. User calls `renderTrpcPanel(router, options)` from their backend
2. Parser walks the router tree and extracts procedure metadata
3. Render function injects parsed data into the pre-built React bundle
4. Returns complete HTML page as a string
5. User serves this HTML from an endpoint (e.g., `/panel`)
6. Browser loads the page, React app initializes with injected data
7. UI makes tRPC calls to the actual backend URL specified in options

### Key Concepts

- **Self-contained output**: The entire UI (HTML, CSS, JS) is returned as a single HTML string with no external dependencies
- **Zero overhead**: No additional schemas or metadata required beyond what tRPC already has
- **Zod-centric**: Input parsing relies on Zod schemas being present on procedures
- **Transformer support**: Supports superjson for serializing complex types (Dates, BigInt, etc.)
- **Router introspection**: Uses tRPC's internal router structure (`_def`, procedure definitions) to extract metadata

## Important Notes

- The project uses pnpm workspaces with a catalog for shared dependencies (defined in `pnpm-workspace.yaml`)
- Tests use vitest (not jest, despite some references in old docs)
- The parser only supports Zod input schemas (other validators are not supported)
- Changes to React components require rebuilding the bundle (`pnpm build` in packages/trpc-ui)
- The test app router (`packages/test-app/src/router.ts`) should not be committed with changes
