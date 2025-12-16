'use client';
import { useState } from 'react';
import Image from 'next/image';
import {
  DesignSystemProvider,
  Grid,
  Flex,
  Button,
  Typography,
  lightTheme,
} from '@strapi/design-system';
import { Upload } from '@strapi/icons';

import { ShapesArray } from '@/components/Shapes/headerShapes';

import LayoutStyle from '@/css/layout.module.css';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [drawShape, setDrawShape] = useState(<ShapesArray />);

  useEffect(() => {
    // Set an interval to update the drawShape state every 5 seconds
    // const interval = setInterval(() => {
    //   setDrawShape(<ShapesArray />); // Update the state to trigger a re-render
    // }, 5000);
    // // Clear interval when the component unmounts
    // return () => clearInterval(interval);
  }, []);

  return (
    <DesignSystemProvider locale='en-GB' theme={lightTheme}>
      <nav>
        <Grid.Root
          gap={10}
          height={'80px'}
          marginLeft={'100px'}
          marginRight={'100px'}
        >
          <Grid.Item col={6}>
            <Link href='/'>
              <Image
                src='/logo.svg'
                width={211}
                height={34}
                alt='Strapi Market logo'
                priority={true}
              />
            </Link>
          </Grid.Item>
          <Grid.Item col={6}>
            <Flex justifyContent={'flex-end'} width={'100%'}>
              <Button onClick={() => router.push(`https://strapi.io`)}>
                Go back to the website
              </Button>
            </Flex>
          </Grid.Item>
        </Grid.Root>
      </nav>
      <header className={LayoutStyle.gridHeader}>
        <Grid.Root gap={10} marginLeft={'100px'} marginRight={'100px'}>
          <Grid.Item
            col={12}
            direction={'column'}
            alignItems={'flex-start'}
            justifyContent={'center'}
            height={'144px'}
          >
            <Flex
              className={LayoutStyle.header}
              direction={'row'}
              justifyContent={'space-between'}
              alignItems={'flex-end'}
              width={'100%'}
            >
              <Flex direction={'column'} alignItems={'flex-start'}>
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
              </Flex>
              <Flex>
                <Button
                  variant='secondary'
                  startIcon={<Upload />}
                  onClick={() => router.push(`/submit`)}
                >
                  Submit a plugin or provider
                </Button>
              </Flex>
            </Flex>

            <Flex
              className={LayoutStyle.shapesArray}
              alignItems={'end'}
              direction={'row'}
              gap={'18px'}
              width={'100%'}
            >
              {drawShape}
            </Flex>
          </Grid.Item>
        </Grid.Root>
      </header>
      <Grid.Root
        gap={10}
        height={'80px'}
        marginLeft={'100px'}
        marginRight={'100px'}
      >
        {children}
      </Grid.Root>
    </DesignSystemProvider>
  );
}
