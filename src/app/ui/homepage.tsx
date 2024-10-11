'use client';

import { Menu } from '@/app/ui/components/menu';
import { Highlight } from './components/highlight';

const plugins = [{}, {}, {}, {}, {}];

export default function Homepage() {
  return (
    <>
      <Menu />
      <Highlight plugins={plugins} />
    </>
  );
}
