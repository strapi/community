import {
  useCountMany,
  useFetchMany,
  useFetchOneWithSlug,
  useFetchManyRandom,
  fetchOneWithSlug,
} from './cms';

export function fetchCategories() {
  return useFetchMany('categories', {
    revalidateOnFocus: false,
  });
}

export function fetchUser(type: string, slug: string) {
  const filters = {
    filters: {
      slug: {
        $eq: slug,
      },
    },
    populate: ['packages', 'packages.icon'],
    pagination: {
      pageSize: 1,
      page: 1,
    },
  };

  return useFetchOneWithSlug(type, filters);
}

export function fetchPackage(
  type: string,
  slug: string,
  withSwr: boolean = true
) {
  const filters = {
    filters: {
      slug: {
        $eq: slug,
      },
    },
    populate: ['screenshots', 'author'],
    pagination: {
      pageSize: 1,
      page: 1,
    },
  };

  if (withSwr) {
    return useFetchOneWithSlug(type, filters);
  }

  return fetchOneWithSlug(type, filters);
}

export function fetchPackages(
  maxItems: number = 10,
  page: number = 1,
  filters?: {
    type?: string;
  },
  sort?: Object
) {
  if (filters?.type && Array.isArray(filters.type)) {
    delete filters.type;
  }

  const pagination = {
    page: page || 1,
    pageSize: maxItems,
  };

  return useFetchMany('packages', {
    status: 'published',
    populate: 'icon',
    pagination: {
      page,
      pageSize: maxItems,
    },
    sort: sort || {},
    filters: filters || {},
  });
}

export function countPackages(filters: Object = {}) {
  return useCountMany(
    'packages',
    {
      status: 'published',
      filters,
    },
    {
      revalidateOnFocus: false,
    }
  );
}

export function fetchPackagesHighlighted(limit: number) {
  return useFetchManyRandom(
    'packages',
    {
      pagination: {
        page: 1,
        pageSize: limit,
      },
    },
    {
      revalidateOnFocus: false,
    }
  );
}
