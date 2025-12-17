'use client';

import React, { Suspense } from 'react';

import { MenuSkeleton } from '@/ui/skeletons';

import Menu from '@/components/Menu/menu';
import Highlight from '@/components/HighLight/highlight';
import PluginList from '@/components/List/pluginList';

import { Grid, Flex } from '@strapi/design-system';

import BackLink from '@/components/BackLink/backLink';
import { HomePageData } from '@/templates/Home/page';

type Props = {
  document: HomePageData
}

export default function Homepage({ document }: Props) {


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
          {<Highlight />}
          {/* <PluginList params={params} /> */}
        </Flex>
      </Grid.Item>
    </>
  );
}
