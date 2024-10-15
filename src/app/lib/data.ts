import { countMany, fetchMany } from './cms';
import { Category, Package } from '../definitions';

export async function fetchStatistics() {
  try {
    const { count: plugins } = await countMany('packages', {
      status: 'published',
      filters: { type: 'plugin' },
    });

    const { count: providers } = await countMany('packages', {
      status: ' published',
      filters: { type: 'provider' },
    });

    return { plugins, providers };
  } catch (e) {
    console.log(e);
    throw new Error('Failed to fetch statistics.');
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const categories = await fetchMany('categories');

    return categories;
  } catch (e) {
    console.log(e);
    throw new Error('Failed to fetch statistics.');
  }
}

export async function fetchPackages(limit: number): Promise<Package[]> {
  try {
    const plugins = await fetchMany('packages', {
      status: 'published',
      populate: 'icon',
      pagination: {
        page: 1,
        pageSize: limit,
      },
    });

    return plugins;
  } catch (e) {
    console.log(e);
    throw new Error('Failed to fetch statistics.');
  }
}

export async function countPackages() {
  try {
    const { count } = await countMany('packages', {
      status: 'published',
    });

    return count;
  } catch (e) {
    console.log(e);
    throw new Error('Failed to count packages.');
  }
}

export async function fetchPackagesHighlighted(
  limit: number
): Promise<Plugin[]> {
  try {
    const plugins = await fetchMany('packages', {
      type: 'plugin',
      status: 'published',
      filters: {
        type: 'plugin',
        verified: true,
      },
      pagination: {
        page: 1,
        pageSize: limit,
      },
    });

    return plugins;
  } catch (e) {
    console.log(e);
    throw new Error('Failed to fetch highlighted plugins.');
  }
}
