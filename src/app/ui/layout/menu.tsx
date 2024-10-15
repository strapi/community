import Link from 'next/link';
import styles from '@/app/css/layout.module.css';

import { Checkbox, Grid, Flex, Typography } from '@strapi/design-system';
import { ActionCard } from '@/app/ui/homepage/actionCard';

import { fetchCategories, fetchStatistics } from '@/app/lib/data';
import { useEffect, useRef, useState } from 'react';
import { Category } from '@/app/definitions';

export default function Menu() {
  const [packages, setPackages] = useState({ plugins: 0, providers: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const isMounted = useRef(false);

  const fetchData = async () => {
    const getPackages = await fetchStatistics();
    const getCategories = await fetchCategories();

    setPackages(getPackages);
    setCategories(getCategories);
  };

  useEffect(() => {
    if (!isMounted.current) {
      fetchData();
      isMounted.current = true;
    }
  }, [fetchData]);

  return (
    <>
      <Grid.Item col={3} direction={'column'} alignItems={'flex-start'}>
        <Flex
          className={styles.filters}
          direction={'column'}
          alignItems={'flex-start'}
          gap={'8px'}
        >
          <Checkbox>Plugins ({packages.plugins.toLocaleString()})</Checkbox>
          <Checkbox>Providers ({packages.providers.toLocaleString()})</Checkbox>
        </Flex>
        <Flex
          className={styles.categories}
          direction={'column'}
          alignItems={'flex-start'}
          gap={'4px'}
        >
          {categories.map((category) => {
            return (
              <Link
                key={`cat_${category.slug}`}
                className={styles.category}
                href={`/categories/${category.slug}`}
              >
                {category.name}
              </Link>
            );
          })}
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
          >
            Tell us what plugin you are looking for and we'll let our community
            plugin developers know in case they are in search for inspiration!
          </ActionCard>
          <ActionCard title='Contribute' color='green'>
            Develop your own plugin and submit it to the marketplace!
          </ActionCard>
        </Flex>
      </Grid.Item>
    </>
  );
}
