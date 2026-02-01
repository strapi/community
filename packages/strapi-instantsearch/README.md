# @repo/strapi-instantsearch

This package provides React InstantSearch components styled with Strapi's design system, making it easy to integrate Algolia search functionality into your Strapi admin panels or applications.

## Features

- 🎨 **Strapi Design System Integration** - Components styled with `@strapi/design-system`
- 🔍 **InstantSearch Components** - Pre-built search UI components
- ⚡ **React 18 Support** - Built with modern React
- 📦 **TypeScript Support** - Full type safety

## Installation

This is a private monorepo package. It's not published to npm and is used internally within the workspace.

To add the package to a workspace application you can add it to it's `package.json` file.

```json
{
  "dependencies": {
    "@repo/strapi-instantsearch": "workspace:*"
  }
}
```

## Components

### SearchBox

A search input component that allows users to enter search queries.

```tsx
import { SearchBox } from '@repo/strapi-instantsearch';

<SearchBox />
```

**Props:** Accepts all `UseSearchBoxProps` from `react-instantsearch`.

### RefinementList

A checkbox-based refinement list for filtering search results by facet values.

```tsx
import { RefinementList } from '@repo/strapi-instantsearch';

<RefinementList attribute="category" />
```

**Props:** Accepts all `UseRefinementListProps` from `react-instantsearch`.

### SortBy

A dropdown select for sorting search results by different indices.

```tsx
import { SortBy } from '@repo/strapi-instantsearch';

<SortBy
  items={[
    { label: 'Relevance', value: 'packages' },
    { label: 'Name (A-Z)', value: 'packages_name_asc' },
    { label: 'Name (Z-A)', value: 'packages_name_desc' },
  ]}
/>
```

**Props:** Accepts all `UseSortByProps` from `react-instantsearch`.

### ToggleRefinement

A checkbox component for toggling boolean refinements.

```tsx
import { ToggleRefinement } from '@repo/strapi-instantsearch';

<ToggleRefinement 
  attribute="isFeatured" 
  label="Featured Only"
/>
```

**Props:** 
- All `UseToggleRefinementProps` from `react-instantsearch`
- `label?: string` - Optional custom label for the checkbox

## Usage Example

```tsx
import { InstantSearch } from 'react-instantsearch';
import { 
  SearchBox, 
  RefinementList, 
  SortBy, 
  ToggleRefinement 
} from '@repo/strapi-instantsearch';

function SearchPage() {
  return (
    <InstantSearch searchClient={searchClient} indexName="packages">
      <SearchBox />
      
      <RefinementList attribute="category" />
      
      <ToggleRefinement 
        attribute="verified" 
        label="Verified packages only"
      />
      
      <SortBy
        items={[
          { label: 'Relevance', value: 'packages' },
          { label: 'Most Popular', value: 'packages_popular' },
        ]}
      />
      
      {/* Your results component */}
    </InstantSearch>
  );
}
```

## Dependencies

- `@strapi/design-system` - Strapi's design system
- `react-instantsearch` - React library for Algolia InstantSearch
- `react` & `react-dom` - React framework

## Development

### Type Checking

```bash
pnpm check-types
```

### Linting

```bash
pnpm lint
```

## License

MIT
