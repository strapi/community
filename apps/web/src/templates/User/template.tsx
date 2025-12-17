'use client';

import * as React from 'react';
import TimeAgo from 'react-timeago';

import { Grid, Flex } from '@strapi/design-system';
import { Download } from '@strapi/icons';

import Image from 'next/image';

import { ActionCard } from '@/components/ActionCard/actionCard';
import BackLink from '@/components/BackLink/backLink';

import styles from '@/css/plugin.module.css';
import stylesPluginList from '@/components/List/styles.module.css';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import TableList from '@/components/List/tableList';
import TrustedCard from '@/components/TrustedCard/trustedCard';
import type { UserPageData } from '@/templates/User/page';

type Props = {
  document: UserPageData;
}

const UserTemplate = ({ document }: Props) => {
  const packages = (document.packages || []).filter(
    (pkg) => pkg.publishedAt != null
  );

  const aggregatedDownloads = packages
    .map((pkg) => pkg.downloads)
    .reduce((sum, downloads) => sum + parseInt(String(downloads)), 0);

  const mostRecentItem = packages.reduce((latest, current) => {
    return new Date(current.updatedAt!) > new Date(latest?.updatedAt!)
      ? current
      : latest;
  }, packages[0]);

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
                {document.username}{' '}
              </h1>
              <p className={styles.plugingShortDescription}>
                {document.description}
              </p>
            </Flex>
          </Flex>
        </Flex>
        <Flex width={'100%'}>
          {document.trusted_partner ? <TrustedCard /> : ''}
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
                {aggregatedDownloads.toLocaleString()}
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
                date={mostRecentItem?.updatedAt!}
              />
            </p>
          </Flex>

          <ActionCard
            className={styles.actionCard!}
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

export default UserTemplate;