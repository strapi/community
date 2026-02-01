# @repo/strapi-client

A type-safe wrapper around the official Strapi client that provides full TypeScript support for Strapi v5 content types with automatic type inference.

## Features

- 🔒 **Full TypeScript Support** - Strongly typed API calls with automatic type inference from Strapi content types
- 🎯 **Type-safe Query Parameters** - IntelliSense support for filters, population, sorting, and pagination
- 📦 **Collection & Single Types** - Support for both collection and single content types
- 🚀 **Built on Official Client** - Wraps `@strapi/client` with enhanced type safety

## Installation

This is a private monorepo package. It's not published to npm and is used internally within the workspace.

To add the package to a workspace application you can add it to it's `package.json` file.

```JSON
{
  "dependencies": {
    "@repo/strapi-client": "workspace:*"
  }
}
```

## Usage

### Setup

First, create a typed Strapi client instance:

```typescript
import { createTypedStrapiClient } from '@repo/strapi-client';

const strapi = createTypedStrapiClient({
  baseURL: 'http://localhost:1337',
  apiToken: 'your-api-token', // Optional
});
```

### Type Inference

The type inference works, because this package lives in the same monorepo as the Strapi application that it queries. The [`tsconfig.json`](/packages/strapi-client/tsconfig.json) includes the types from Strapi.

```JSON
{
  "include": {
    "../../apps/cms/types/generated/*.d.ts"
  }
}
```

### Working with Collections

Collection types represent content types that can have multiple entries (e.g., articles, products, users).

```typescript
// Find all documents
const packages = await strapi
  .collection('api::package.package')
  .find({
    filters: { published: true },
    populate: ['category', 'author'],
    sort: 'createdAt:desc',
    pagination: { page: 1, pageSize: 10 },
  });

// Find a single document by ID
const package = await strapi
  .collection('api::package.package')
  .findOne('document-id-here', {
    populate: ['category'],
  });

// Create a new document
const newPackage = await strapi
  .collection('api::package.package')
  .create({
    name: 'My Package',
    description: 'A great package',
  });

// Update a document
const updatedPackage = await strapi
  .collection('api::package.package')
  .update('document-id-here', {
    name: 'Updated Package Name',
  });

// Delete a document
await strapi
  .collection('api::package.package')
  .delete('document-id-here');
```

### Working with Single Types

Single types represent content types that can only have one entry (e.g., homepage, settings).

```typescript
// Find the single type document
const home = await strapi
  .single('api::home.home')
  .find({
    populate: ['hero', 'sections'],
  });

// Update the single type document
const updatedHome = await strapi
  .single('api::home.home')
  .update({
    title: 'Welcome to our site',
  });

// Delete the single type document
await strapi
  .single('api::home.home')
  .delete();
```

### Query Parameters

All query parameters are type-safe:

```typescript
const results = await strapi
  .collection('api::package.package')
  .find({
    // Type-safe filters
    filters: {
      name: { $contains: 'strapi' },
      downloads: { $gte: 1000 },
    },
    
    // Type-safe population
    populate: ['category', 'author.profile'],
    
    // Type-safe sorting
    sort: ['createdAt:desc', 'name:asc'],
    
    // Type-safe pagination
    pagination: {
      page: 1,
      pageSize: 25,
    },
    
    // Type-safe fields selection
    fields: ['name', 'description', 'downloads'],
  });
```

### File Operations

The client also provides access to file operations:

```typescript
// Upload files
const file = await strapi.files.upload(formData);

// Access base URL and fetch
const response = await strapi.fetch('/custom-endpoint');
console.log(strapi.baseURL);
```

## Dependencies

- `@strapi/client` - Official Strapi JavaScript client
- `@strapi/types` - Strapi TypeScript type definitions

## Development

```bash
# Lint code
pnpm lint

# Type check
pnpm check-types
```

## License

MIT