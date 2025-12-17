"use client";

import * as React from 'react';
import { Grid, Flex } from '@strapi/design-system';
import {
  BlocksRenderer,
} from '@strapi/blocks-react-renderer';
import { ExternalLink, Download, Star } from '@strapi/icons';

import Link from 'next/link';
import Image from 'next/image';

import SealCheck from '@/ui/shared/seal-check';
import { ActionCard } from '@/components/ActionCard/actionCard';
import BackLink from '@/components/BackLink/backLink';

import Carousel from '@/components/Carousel/carousel';

import styles from '@/css/plugin.module.css';
import type { PackagePageData } from '@/templates/Package/page';
import type { Modules } from '@strapi/types';
import TimeAgo from 'react-timeago';

type Props = {
  document: PackagePageData;
}

const PackageTemplate = ({ document }: Props) => {
  const { screenshots, author } = document;

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
                {document.name}{' '}
                <SealCheck
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
                {document.description}
              </p>
            </Flex>
          </Flex>
          {screenshots?.length && screenshots?.length > 0 && (
            <Carousel screenshots={document.screenshots as Modules.Documents.Document<'plugin::upload.file'>[]} />
          )}
          <Flex width={'100%'} direction={'row'}>
            <BlocksRenderer
              content={document.content}
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
                {parseInt(String(document.downloads)).toLocaleString()}
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
                {parseInt(String(document.stars)).toLocaleString()}
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
            {author?.username ? (
              <Link
                href={author.url_alias?.[0]?.url_path!}
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
            <p className={styles.valueItem}>{document.version || 'Unknown'}</p>
          </Flex>
          <Flex
            className={styles.listItem}
            width={'100%'}
            direction={'row'}
            justifyContent={'space-between'}
          >
            <p>Last update</p>
            <p className={styles.valueItem}>
              <TimeAgo date={document.updatedAt!} />
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
              <Link className={styles.linkDetail} href={document.npm_package!}>
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
              <Link className={styles.linkDetail} href={document.git_repository!}>
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
            className={styles.actionCard!}
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
 
export default PackageTemplate;