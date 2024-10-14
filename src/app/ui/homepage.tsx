'use client';

import { Menu } from '@/app/ui/components/menu';
import { Highlight } from './components/highlight';
import { PluginList } from './components/pluginList';

import { Grid, Flex } from '@strapi/design-system';

const plugins = [{}, {}, {}, {}];

export default function Homepage() {
  return (
    <>
      <Menu />
      <Grid.Item col={9} direction={'column'} alignItems={'flex-start'}>
        <Flex gap={'36px'} direction={'column'}>
          <Highlight plugins={plugins} />
          <PluginList plugins={plugins} />
        </Flex>
      </Grid.Item>
    </>
  );
}
