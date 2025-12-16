import Link from 'next/link';
import styles from '@/app/css/layout.module.css';

import qs from 'qs';
import { Checkbox, Grid, Flex } from '@strapi/design-system';
import { ActionCard } from '@/app/components/ActionCard/actionCard';

import { fetchCategories, countPackages } from '@/app/lib/data';
import { useEffect, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Category } from '@/app/definitions';

export default function Menu({
  activeCategory = '',
}: {
  activeCategory?: string;
}) {
  const [checkedType, setCheckedType] = useState<Record<string, boolean>>({
    plugin: true,
    provider: true,
  });

  const { data: categoriesData, isLoading: isLoadingCategories } =
    fetchCategories();

  const { data: pluginCountData, isLoading: isLoadingCountPlugins } =
    countPackages({
      type: 'plugin',
    });

  const { data: providerCountData, isLoading: isLoadingCountProviders } =
    countPackages({
      type: 'provider',
    });

  const categories = categoriesData?.data || [];
  const countPlugins = pluginCountData?.data?.count || 0;
  const countProviders = providerCountData?.data?.count || 0;

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Update URL parameters based on state
  const updateURL = () => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    params.delete('type');

    for (const type in checkedType) {
      if (checkedType[type]) {
        params.append('type', type);
      }
    }

    replace(`${pathname}?${params.toString()}`);
  };

  // Plugins & providers type handler
  const toggleType = (type: string, checked: boolean) => {
    checkedType[type] = !checked;
    setCheckedType(checkedType);
    updateURL();
  };

  useEffect(() => {
    // Extract type filters from URL
    const params = new URLSearchParams(searchParams);

    if (params.has('type')) {
      for (const type in checkedType) {
        checkedType[type] = params.has('type', type);
      }

      setCheckedType(checkedType);
    }

    updateURL();
  }, []);

  return (
    <>
      <Grid.Item col={3} direction={'column'} alignItems={'flex-start'}>
        <Flex
          className={styles.filters}
          direction={'column'}
          alignItems={'flex-start'}
          gap={'8px'}
        >
          <Checkbox
            onCheckedChange={(checked) =>
              toggleType('plugin', checkedType.plugin)
            }
            checked={checkedType.plugin}
          >
            Plugins ({isLoadingCountPlugins ? 0 : countPlugins.toLocaleString()}
            )
          </Checkbox>
          <Checkbox
            onCheckedChange={(checked) =>
              toggleType('provider', checkedType.provider)
            }
            checked={checkedType.provider}
          >
            Providers (
            {isLoadingCountProviders ? 0 : countProviders.toLocaleString()})
          </Checkbox>
        </Flex>
        <Flex
          className={styles.categories}
          direction={'column'}
          alignItems={'flex-start'}
          gap={'4px'}
        >
          {isLoadingCategories ? (
            <p>Loading category</p>
          ) : (
            categories.map((category: Category) => {
              const isActive = category.slug === activeCategory;

              return (
                <Link
                  key={`cat_${category.slug}`}
                  className={
                    isActive
                      ? styles.category + ' ' + styles.activeCategory
                      : styles.category
                  }
                  href={`/category/${category.slug}?${qs.stringify({ type: searchParams.getAll('type') }, { arrayFormat: 'repeat' })}`}
                >
                  {category.name}
                </Link>
              );
            })
          )}
        </Flex>
        <Flex
          className={styles.actionCards}
          direction={'column'}
          alignItems={'flex-start'}
          gap={'24px'}
        >
          <ActionCard
            link='https://feedback.strapi.io/plugin-requests'
            title='Missing a plugin?'
            color='purple'
            type='missing'
          >
            Tell us what plugin you are looking for and we'll let our community
            plugin developers know in case they are in search for inspiration!
          </ActionCard>
          <ActionCard title='Contribute' color='green' type='plugin'>
            Develop your own plugin and submit it to the marketplace!
          </ActionCard>
        </Flex>
      </Grid.Item>
    </>
  );
}
