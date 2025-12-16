'use client';

import TimeAgo from 'react-timeago';

import { Grid, Flex } from '@strapi/design-system';
import {
  BlocksRenderer,
  type BlocksContent,
} from '@strapi/blocks-react-renderer';
import { ExternalLink, Download, Star, ArrowLeft } from '@strapi/icons';

import Link from 'next/link';
import Image from 'next/image';

import SealCheck from '@/ui/shared/seal-check';
import { ActionCard } from '@/components/ActionCard/actionCard';
import BackLink from '@/components/BackLink/backLink';

import Carousel from '@/components/Carousel/carousel';

import styles from '@/css/plugin.module.css';
import { Package } from '@/app/definitions';

export default function Plugin(data: Package) {
  const pkg: Package = data?.data || {};
  const screenshots = pkg?.screenshots || [];
  const author = pkg?.author || {};

  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  return (
    <>
      <Grid.Item
        col={9}
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
              alt='Logo of the plugin'
            />
            <Flex width={'100%'} direction={'column'} alignItems={'flex-start'}>
              <h1 className={styles.pluginTitle}>
                {pkg.name}{' '}
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
              </h1>
              <p className={styles.plugingShortDescription}>
                {pkg.description}
              </p>
            </Flex>
          </Flex>
          {screenshots.length > 0 ? (
            <Carousel screenshots={pkg.screenshots} />
          ) : (
            ''
          )}
          <Flex width={'100%'} direction={'row'}>
            <BlocksRenderer
              content={pkg.content}
              blocks={{
                // You can use the default components to set class names...
                paragraph: ({ children }) => (
                  <p className={styles.paragraph}>{children}</p>
                ),
              }}
            />
          </Flex>
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
            <p>Downloads</p>
            <Flex direction={'row'} gap={'4px'}>
              <Download width={12} height={12} color={'#666687'} />
              <p className={styles.valueItem}>
                {parseInt(pkg.downloads).toLocaleString()}
              </p>
            </Flex>
          </Flex>
          <Flex
            className={styles.listItem}
            width={'100%'}
            direction={'row'}
            justifyContent={'space-between'}
          >
            <p>GitHub stars</p>
            <Flex direction={'row'} gap={'4px'}>
              <Image
                src='/logo-github.svg'
                width={12}
                height={12}
                alt='Logo GitHub'
              />
              <Star width={12} height={12} color={'#E4A33F'} />
              <p className={styles.valueItem}>
                {parseInt(pkg.stars).toLocaleString()}
              </p>
            </Flex>
          </Flex>
          <Flex
            className={styles.listItem}
            width={'100%'}
            direction={'row'}
            justifyContent={'space-between'}
          >
            <p>Author</p>
            {author.username ? (
              <Link
                href={`/author/${author.slug}`}
                className={styles.valueItem + ' ' + styles.authorName}
              >
                {author.username}
              </Link>
            ) : (
              <p className={styles.valueItem + ' ' + styles.authorName}>
                Unknown
              </p>
            )}
          </Flex>
          <Flex
            className={styles.listItem}
            width={'100%'}
            direction={'row'}
            justifyContent={'space-between'}
          >
            <p>Compatible version</p>
            <p className={styles.valueItem}>{pkg.version || 'Unknown'}</p>
          </Flex>
          <Flex
            className={styles.listItem}
            width={'100%'}
            direction={'row'}
            justifyContent={'space-between'}
          >
            <p>Last update</p>
            <p className={styles.valueItem}>
              <TimeAgo date={pkg.updatedAt} formatter='iso8601' />
            </p>
          </Flex>
          <Flex
            className={styles.listItem}
            width={'100%'}
            direction={'row'}
            justifyContent={'space-between'}
          >
            <p>npm package</p>
            <p className={styles.valueItem}>
              <Link className={styles.linkDetail} href={pkg.npm_package}>
                See{' '}
                <ExternalLink
                  className={styles.actionCardIcon}
                  width={'12px'}
                  height={'12px'}
                />
              </Link>
            </p>
          </Flex>
          <Flex
            className={styles.listItem}
            width={'100%'}
            direction={'row'}
            justifyContent={'space-between'}
          >
            <p>Repository</p>
            <p className={styles.valueItem}>
              <Link className={styles.linkDetail} href={pkg.git_repository}>
                See{' '}
                <ExternalLink
                  className={styles.actionCardIcon}
                  width={'12px'}
                  height={'12px'}
                />
              </Link>
            </p>
          </Flex>
          <ActionCard
            className={styles.actionCard}
            title='Found an issue?'
            color='red'
            type='issue'
          >
            Something is wrong or doesn’t work as expected? Report the issue to
            the author.
          </ActionCard>
        </Flex>
      </Grid.Item>
    </>
  );
}
