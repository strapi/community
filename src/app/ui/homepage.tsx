'use client';

import { Suspense } from 'react';

import { MenuSkeleton } from '@/app/ui/skeletons';

import Menu from '@/app/ui/layout/menu';
import Highlight from '@/app/ui/homepage/highlight';
import PluginList from '@/app/ui/homepage/pluginList';

import { Grid, Flex } from '@strapi/design-system';

const plugins = [{}, {}, {}, {}];

export default function Homepage() {
  return (
    <>
      <Suspense fallback={<MenuSkeleton />}>
        <Menu />
      </Suspense>
      <Grid.Item
        col={9}
        direction={'column'}
        alignItems={'flex-start'}
        justifyContent={'flex-start'}
      >
        <Flex
          width={'100%'}
          gap={'36px'}
          direction={'column'}
          alignItems={'flex-start'}
        >
          <Highlight />
          <PluginList plugins={plugins} />
        </Flex>
      </Grid.Item>
    </>
  );
}
