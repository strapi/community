'use client';

import TimeAgo from 'react-timeago';

import { Grid, Flex } from '@strapi/design-system';
import { Download } from '@strapi/icons';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { User } from '@/app/definitions';
import { fetchUser } from '@/app/lib/data';

import SealCheck from '@/app/ui/shared/seal-check';
import { ActionCard } from '@/app/components/ActionCard/actionCard';
import BackLink from '@/app/components/BackLink/backLink';

import styles from '@/app/css/plugin.module.css';
import stylesPluginList from '@/app/components/List/styles.module.css';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import TableList from '@/app/components/List/tableList';
import TrustedCard from '@/app/components/TrustedCard/trustedCard';

export default function Page({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const router = useRouter();
  const { data = [], isLoading }: { data: User[]; isLoading: boolean } =
    fetchUser('users', params.slug);

  const user = data[0] || {};
  const packages = (user?.packages || []).filter(
    (pkg) => pkg.publishedAt != null
  );

  const aggregatedDownloads = packages
    .map((pkg) => pkg.downloads)
    .reduce((sum, downloads) => sum + parseInt(downloads), 0);

  const mostRecentItem = packages.reduce((latest, current) => {
    return new Date(current.updatedAt) > new Date(latest.updatedAt)
      ? current
      : latest;
  }, packages[0]);

  if (isLoading) {
    return <p>Loading user...</p>;
  }

  return (
    <>
      <Grid.Item
        col={9}
        gap={'32px'}
        direction={'column'}
        alignItems={'flex-start'}
        justifyContent={'flex-start'}
      >
        <Flex
          width={'100%'}
          gap={'32px'}
          direction={'column'}
          className={styles.leftSection}
        >
          <Flex width={'100%'}>
            <BackLink to={'/'} />
          </Flex>

          <Flex
            width={'100%'}
            gap={'24px'}
            direction={'row'}
            alignItems={'flex-start'}
            justifyContent={'flex-start'}
          >
            <Image
              src='/logo-plugin.png'
              width={60}
              height={60}
              alt='Logo plugin'
            />
            <Flex width={'100%'} direction={'column'} alignItems={'flex-start'}>
              <h1 className={styles.pluginTitle}>
                {user.username}{' '}
                {user.trusted_partner ? (
                  <SealCheck
                    className={styles.sealcheck}
                    fill={'#4945FF'}
                    width={18}
                    height={18}
                    style={{
                      verticalAlign: 'middle',
                      marginLeft: '4px',
                      marginBottom: '5px',
                    }}
                  />
                ) : (
                  ''
                )}
              </h1>
              <p className={styles.plugingShortDescription}>
                {user.description}
              </p>
            </Flex>
          </Flex>
        </Flex>
        <Flex width={'100%'}>
          {user.trusted_partner ? <TrustedCard /> : ''}
        </Flex>
        <Flex width={'100%'} className={stylesPluginList.pluginListElement}>
          <TableList items={packages} />
        </Flex>
      </Grid.Item>
      <Grid.Item
        col={3}
        direction={'column'}
        alignItems={'flex-start'}
        justifyContent={'flex-start'}
      >
        <h3 className={styles.detailsTitle + ' ' + styles.rightSection}>
          Details
        </h3>
        <Flex width={'100%'} direction={'column'}>
          <Flex
            className={styles.listItem}
            width={'100%'}
            direction={'row'}
            justifyContent={'space-between'}
          >
            <p>Cumulated downloads</p>
            <Flex direction={'row'} gap={'4px'}>
              <Download width={12} height={12} color={'#666687'} />
              <p className={styles.valueItem}>
                {parseInt(aggregatedDownloads).toLocaleString()}
              </p>
            </Flex>
          </Flex>
          <Flex
            className={styles.listItem}
            width={'100%'}
            direction={'row'}
            justifyContent={'space-between'}
          >
            <p>Published packages</p>
            <p className={styles.valueItem}>{packages.length}</p>
          </Flex>
          <Flex
            className={styles.listItem}
            width={'100%'}
            direction={'row'}
            justifyContent={'space-between'}
          >
            <p>Last update</p>
            <p className={styles.valueItem}>
              <TimeAgo
                date={mostRecentItem.updatedAt}
                formatter='iso8601'
              />
            </p>
          </Flex>

          <ActionCard
            className={styles.actionCard}
            title='Contribute'
            color='green'
            type='plugin'
          >
            Develop your own plugin and submit it to the marketplace!
          </ActionCard>
        </Flex>
      </Grid.Item>
    </>
  );
}
