'use client';

import Image from 'next/image';
import {
  DesignSystemProvider,
  Grid,
  Flex,
  Button,
  Typography,
  lightTheme,
} from '@strapi/design-system';

import { ShapesArray } from './components/headerShapes';

import LayoutStyle from '@/app/css/layout.module.css';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DesignSystemProvider locale='en-GB' theme={lightTheme}>
      <nav>
        <Grid.Root
          gap={10}
          height={'80px'}
          marginLeft={'150px'}
          marginRight={'150px'}
        >
          <Grid.Item col={6}>
            <Image
              src='/logo.svg'
              width={211}
              height={34}
              alt='Strapi Market logo'
              priority={true}
            />
          </Grid.Item>
          <Grid.Item col={6}>
            <Flex justifyContent={'flex-end'} width={'100%'}>
              <Button>Go back to the website</Button>
            </Flex>
          </Grid.Item>
        </Grid.Root>
      </nav>
      <header className={LayoutStyle.gridHeader}>
        <Grid.Root gap={10} marginLeft={'150px'} marginRight={'150px'}>
          <Grid.Item
            col={12}
            direction={'column'}
            alignItems={'flex-start'}
            justifyContent={'center'}
            height={'144px'}
          >
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 600,
              }}
            >
              Marketplace
            </h1>
            <Typography
              textColor={'neutral600'}
              variant='gamma'
              fontWeight={400}
            >
              Get the most out of Strapi
            </Typography>
            <Flex
              className={LayoutStyle.shapesArray}
              alignItems={'end'}
              direction={'row'}
              gap={'18px'}
              width={'100%'}
            >
              <ShapesArray />
            </Flex>
          </Grid.Item>
        </Grid.Root>
      </header>
      <Grid.Root
        gap={10}
        height={'80px'}
        marginLeft={'150px'}
        marginRight={'150px'}
      >
        {children}
      </Grid.Root>
    </DesignSystemProvider>
  );
}
