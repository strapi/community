# Strapi Community

This monorepo contains all the code for Strapi's online Marketplace. It's structured as a pnpm workspace with multiple applications and shared packages.

## Project Overview

The Marketplace project consists of:

- A Next.js web application
- A Strapi application for content management
- An n8n application for automation
- A Meilisearch instance for searching

## Getting Started

### Prerequisites

- Node.js >=22
- pnpm 10.12.1 or later
- Docker Desktop

### Installation

```bash
# Install all dependencies
pnpm install
```

### Setup

#### ENV variables

Both the `web` and `cms` applications need a `.env` file to properly function. Go in to both applications and copy the `.env.example` in to a new `.env` file. 

#### API token

Go to the 'Full Access' API tokens section in Strapi and copy the API token. Afterwards you can paste the API token in to the `.env` of the `web` application as `CMS_BEARER_TOKEN`.

_The Full Access token is only used for local development. For any sort of production like environment we should use a custom access token._

_See [Full Access API token page](http://localhost:1337/admin/settings/api-tokens/2) in Strapi_

### Development

```bash
# Start all applications in development mode
pnpm dev

# Build all applications
pnpm build

# Run all tests
pnpm test

# Lint all code
pnpm lint

# Type checking
pnpm check-types

# Update dependencies interactively
pnpm update-dependencies
```

## Monorepo Structure

The monorepo is organized into two main directories:

### Apps

The `apps/` directory contains standalone applications:

```
apps/
├── cms/               # Strapi 5 application
├── web/               # Next.js 15 web application
├── search/            # Meilisearch instance
└── automation/               # n8n instance
```

### Packages

The `packages/` directory contains shared libraries and configuration:

```
packages/
├── strapi-client/ # A type-safe wrapper for `@strapi/client`
├── strapi-instantsearch/ # Instantsearch UI components using `@strapi/design-system`
└── typescript-config/ # Shared TypeScript configurations
```

## Applications

### Web App (`apps/web`)

The main Next.js 15 application using the App Router pattern. This is the primary customer-facing application.

See [Web App README](./apps/web/README.md) for more details.

### CMS (`apps/cms`)

A Strapi 5 application used to provide content for the Next.js application.

See [CMS README](./apps/cms/README.md) for more details.

### Search (`apps/search`)

A Meilisearch instance that is consumes content from Strapi and serves as a search index for the front-end.

See [CMS README](./apps/search/README.md) for more details.

### Automation (`apps/automation`)

A n8n instance that is used for automation of plugin publication, reviews etc.

See [CMS README](./apps/automation/README.md) for more details.

## Packages

### Strapi Client (`packages/strapi-client`)

A wrapper for the `@strapi/client` that add's type safety based on the types from the `cms` app.

See [Strapi Client README](./packages/strapi-client/README.md) for more details.

### Strapi Instantsearch (`packages/strapi-instantsearch`)

React Instantsearch UI components based on `@strapi/design-system` for branded search pages.

See [Strapi Instantsearch README](./packages/strapi-instantsearch/README.md) for more details.

### TypeScript Config (`packages/typescript-config`)

Shared TypeScript configurations for various project types (Next.js, Strapi, etc.).

## Technology Stack

- **Package Management**: pnpm workspaces
- **Build System**: Turborepo
- **Front-end Framework**: React 19 with Next.js 15
- **CMS**: Strapi 5
- **Search Index**: Meilisearch
- **Styling**: Strapi Design System
- **Testing**: Vitest for unit tests, Playwright for end-to-end tests
- **Linting/formatting**: Biome for consistent code style
- **Components**: Custom components based on shadcn/ui pattern
- **State Management**: Tanstack Query for server state
- **Type Checking**: TypeScript for static type checking
- **Dependency Management**: pnpm for package management and workspace management
- **Version Control**: Git for source code management
- **CI/CD**: Github Actions for continuous integration and deployment

### Project Conventions

- Use TypeScript for all code
- Follow the existing folder structure
- Add tests for all new functionality 

## Workspace Commands

The monorepo uses Turborepo to manage the build pipeline:

- `pnpm dev`: Start all applications in development mode
- `pnpm build`: Build all applications
- `pnpm lint`: Run linting on all projects
- `pnpm test`: Run tests for all projects
- `pnpm check-types`: Check TypeScript types across the workspace
