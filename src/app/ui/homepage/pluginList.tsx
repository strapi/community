'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

import { Package } from '@/app/definitions';

import {
  Button,
  Grid,
  SearchForm,
  Searchbar,
  Flex,
  SingleSelect,
  SingleSelectOption,
  Table,
  Tbody,
  Tr,
  Td,
} from '@strapi/design-system';

import { fetchPackages, countPackages } from '@/app/lib/data';

import styles from '@/app/css/homepage.module.css';

export default function PluginList() {
  const [value, setValue] = useState('alphabetical');
  const [packages, setPackages] = useState<Package[]>([]);
  const [countOfPackages, setCountPackages] = useState<number>(0);
  const isMounted = useRef(false);
  const maxItems = 3;

  const fetchData = async () => {
    const data = await fetchPackages(maxItems);
    const count = await countPackages();

    setPackages(data);
    setCountPackages(count);
  };

  useEffect(() => {
    if (!isMounted.current) {
      fetchData();
      isMounted.current = true;
    }
  }, [fetchData]);

  if (!packages.length) {
    return <p></p>;
  }

  return (
    <Grid.Root gap={'16px'} width={'100%'}>
      <Grid.Item
        col={9}
        direction={'column'}
        alignItems={'flex-start'}
        justifyContent={'center'}
        className={styles.searchFormElement}
      >
        <Searchbar
          width={'100%'}
          placeholder='Search a plugin or provider'
        ></Searchbar>
      </Grid.Item>
      <Grid.Item
        col={3}
        direction={'column'}
        alignItems={'flex-start'}
        justifyContent={'center'}
        className={styles.filterFormElement}
      >
        <SingleSelect
          width={'100%'}
          onClear={() => {
            setValue('alphabetical');
          }}
          value={value}
          onChange={setValue}
        >
          <SingleSelectOption value='alphabetical'>
            Alphabetical (A-Z)
          </SingleSelectOption>
          <SingleSelectOption value='newest'>Newest</SingleSelectOption>
          <SingleSelectOption value='github'>GitHub stars</SingleSelectOption>
          <SingleSelectOption value='downloads'>Downloads</SingleSelectOption>
        </SingleSelect>
      </Grid.Item>
      <Grid.Item col={12} className={styles.pluginListElement}>
        <Table colCount={3} rowCount={10} className={styles.pluginListTable}>
          <Tbody>
            {packages.map((pkg, index) => (
              <Tr key={`pluginList_${index}`} className={styles.pluginListRow}>
                <Td width={'40px'}>
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
                <Td className={styles.pluginListElementLastItem}>
                  <Button variant={'tertiary'} size={'S'}>
                    More
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Grid.Item>
      <Grid.Item col={12} justifyContent={'center'}>
        {' '}
        {maxItems < countOfPackages ? (
          <Button variant={'ghost'}>Show more</Button>
        ) : (
          ''
        )}
      </Grid.Item>
    </Grid.Root>
  );
}
