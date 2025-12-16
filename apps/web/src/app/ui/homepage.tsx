'use client';

import { Suspense } from 'react';

import { MenuSkeleton } from '@/app/ui/skeletons';

import Menu from '@/app/components/Menu/menu';
import Highlight from '@/app/components/HighLight/highlight';
import PluginList from '@/app/components/List/pluginList';

import { Grid, Flex } from '@strapi/design-system';

import BackLink from '@/app/components/BackLink/backLink';

export default function Homepage({
  type,
  sort,
  category,
  page,
  query,
}: {
  type?: string;
  sort?: string;
  category?: string;
  page?: string;
  query?: string;
}) {
  const params = {
    page: page,
    query: query,
    sort,
    filters: {
      type,
      category: {
        slug: {
          $eq: category,
        },
      },
      name: {
        $containsi: query,
      },
    },
    maxItems: 2,
  };

  return (
    <>
      <Suspense fallback={<MenuSkeleton />}>
        <Menu activeCategory={category || ''} />
      </Suspense>
      <Grid.Item
        col={9}
        direction={'column'}
        alignItems={'flex-start'}
        justifyContent={'flex-start'}
      >
        <Flex
          width={'100%'}
          gap={category ? '24px' : '36px'}
          direction={'column'}
          alignItems={'flex-start'}
        >
          {category ? <BackLink to='/' /> : <Highlight />}
          <PluginList params={params} />
        </Flex>
      </Grid.Item>
    </>
  );
}
