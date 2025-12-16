import Link from 'next/link';
import Image from 'next/image';

import { Package } from '@/app/definitions';

import { formatDownloads, formatStars } from '@/ui/utils/numbers';

import { Flex } from '@strapi/design-system';
import { Star, Download } from '@strapi/icons';
import styles from './styles.module.css';

import SealCheck from '../../ui/shared/seal-check';

export default function HighlightCard({
  name = 'App Version',
  description = 'Simple plugin for Strapi 4 to show the app version from package.json in the Settings page',
  stars = 1993,
  downloads = 10,
  slug,
}: Package) {
  return (
    <Link href={`/plugin/${slug}`} className={`${styles.highlightCard}`}>
      <Flex direction={'column'} alignItems={'flex-start'} gap={'8px'}>
        <Flex
          direction={'row'}
          justifyContent={'space-between'}
          alignItems={'flex-start'}
          width={'100%'}
        >
          <Image
            src='/logo-plugin.png'
            width={60}
            height={60}
            alt='Logo Plugin'
          />
          <Flex
            direction={'row'}
            className={styles.highlightCardInfo}
            gap={'8px'}
          >
            <span>
              <Flex direction={'row'} alignItems={'center'} gap={'4px'}>
                <Image
                  src='/logo-github.svg'
                  width={12}
                  height={12}
                  alt='Logo GitHub'
                />
                <Star width={12} height={12} color={'#E4A33F'} />
                {formatStars(stars)}
              </Flex>
            </span>
            <span>
              <Flex direction={'row'} alignItems={'center'} gap={'4px'}>
                <Download width={12} height={12} color={'#666687'} />
                {formatDownloads(downloads)}
              </Flex>
            </span>
          </Flex>
        </Flex>
        <h3 className={styles.highlightCardTitle}>
          {name}
          <SealCheck
            className={styles.sealcheck}
            fill={'#4945FF'}
            width={14}
            height={14}
            style={{
              verticalAlign: 'middle',
              marginLeft: '4px',
              marginBottom: '2px',
            }}
          />
        </h3>
        <p className={styles.highlightCardText}>{description}</p>
      </Flex>
    </Link>
  );
}
