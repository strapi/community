import Link from 'next/link';
import styles from '@/app/css/layout.module.css';

import { Checkbox, Grid, Flex, Typography } from '@strapi/design-system';
import { ActionCard } from '@/app/ui/components/actionCard';

import { fetchStatistics } from '@/app/lib/data';

export async function Menu() {
  const { plugins, providers } = await fetchStatistics();

  return (
    <>
      <Grid.Item col={3} direction={'column'} alignItems={'flex-start'}>
        <Flex
          className={styles.filters}
          direction={'column'}
          alignItems={'flex-start'}
          gap={'8px'}
        >
          <Checkbox>Plugins ({plugins.toLocaleString()})</Checkbox>
          <Checkbox>Providers ({providers.toLocaleString()})</Checkbox>
        </Flex>
        <Flex
          className={styles.categories}
          direction={'column'}
          alignItems={'flex-start'}
          gap={'4px'}
        >
          <Link className={styles.category} href='/categories/analytics'>
            Analytics
          </Link>
          <Link className={styles.category} href='/categories/authentication'>
            Authentication
          </Link>
          <Link className={styles.category} href='/categories/commerce'>
            Commerce
          </Link>
          <Link className={styles.category} href='/categories/databases'>
            Databases
          </Link>
          <Link className={styles.category} href='/categories/logging'>
            Logging
          </Link>
          <Link className={styles.category} href='/categories/monitoring'>
            Monitoring
          </Link>
          <Link className={styles.category} href='/categories/searching'>
            Searching
          </Link>
          <Link className={styles.category} href='/categories/security'>
            Security
          </Link>
          <Link className={styles.category} href='/categories/testing'>
            Testing
          </Link>
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
