import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { formatDownloads, formatStars } from '@/ui/utils/numbers';

import { Button, Table, Tbody, Tr, Td, Flex } from '@strapi/design-system';
import { Star, Download } from '@strapi/icons';

import styles from './styles.module.css';
import { Package } from '@/app/definitions';

export default function TableList({ items }: { items: Array<Package> }) {
  const router = useRouter();

  return (
    <Table colCount={3} rowCount={10} className={styles.pluginListTable}>
      <Tbody>
        {items.map((pkg, index) => (
          <Tr
            key={`pluginList_${index}`}
            className={styles.pluginListRow}
            onClick={() => router.push(`/plugin/${pkg.slug}`)}
          >
            <Td className={styles.pluginListElementFirstItem}>
              <Image
                className={styles.pluginListRowIcon}
                src={process.env.NEXT_PUBLIC_CMS_URL + pkg.icon.url}
                width={30}
                height={30}
                alt={pkg.icon.alternativeText || 'icon'}
              />
            </Td>
            <Td className={styles.pluginListRowMain}>
              <h4 className={styles.pluginListRowTitle}>{pkg.name}</h4> —{' '}
              {pkg.description}
            </Td>
            <Td className={styles.pluginListElementStats}>
              <Flex
                direction={'row'}
                className={styles.highlightCardInfo}
                gap={'8px'}
                justifyContent={'end'}
              >
                <span>
                  <Flex
                    direction={'row'}
                    alignItems={'center'}
                    gap={'4px'}
                    justifyContent={'end'}
                  >
                    <Image
                      src='/logo-github.svg'
                      width={12}
                      height={12}
                      alt='Logo GitHub'
                    />
                    <Star width={12} height={12} color={'#E4A33F'} />
                    {formatStars(pkg.stars)}
                  </Flex>
                </span>
                <span>
                  <Flex
                    direction={'row'}
                    alignItems={'center'}
                    gap={'4px'}
                    justifyContent={'end'}
                  >
                    <Download width={12} height={12} color={'#666687'} />
                    {formatDownloads(pkg.downloads)}
                  </Flex>
                </span>
              </Flex>
            </Td>
            <Td className={styles.pluginListElementLastItem}>
              <Button
                variant={'tertiary'}
                size={'S'}
                onClick={() => router.push(`/plugin/${pkg.slug}`)}
              >
                More
              </Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
