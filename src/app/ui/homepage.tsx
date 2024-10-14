import { Suspense } from 'react';

import { MenuSkeleton } from '@/app/ui/skeletons';

import Menu from '@/app/ui/components/menu';
import Highlight from '@/app/ui/components/highlight';
import PluginList from '@/app/ui/components/pluginList';

import { Grid, Flex } from '@strapi/design-system';

const plugins = [{}, {}, {}, {}];

export default function Homepage() {
  return (
    <>
      <Suspense fallback={<MenuSkeleton />}>
        <Menu />
      </Suspense>
      <Grid.Item col={9} direction={'column'} alignItems={'flex-start'}>
        <Flex gap={'36px'} direction={'column'}>
          <Highlight plugins={plugins} />
          <PluginList plugins={plugins} />
        </Flex>
      </Grid.Item>
    </>
  );
}
