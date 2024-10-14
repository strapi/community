'use client';

import { Plugin } from '@/app/definitions';

import { useState } from 'react';
import Image from 'next/image';

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

import styles from '@/app/css/homepage.module.css';

export default function PluginList({ plugins }: { plugins: Array<Plugin> }) {
  const [value, setValue] = useState('alphabetical');

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
        <Table colCount={3} rowCount={10} width={'100%'}>
          <Tbody>
            <Tr className={styles.pluginListRow}>
              <Td width={'40px'}>
                <Image
                  src='/logo-plugin.png'
                  width={30}
                  height={30}
                  alt='Logo'
                />
              </Td>
              <Td>
                <h4 className={styles.pluginListRowTitle}>Passwordless</h4> —
                Enable a secure and seamless emailed link authentication
                experience
              </Td>
              <Td className={styles.pluginListElementLastItem}>
                <Button variant={'tertiary'} size={'S'}>
                  More
                </Button>
              </Td>
            </Tr>
            <Tr className={styles.pluginListRow}>
              <Td width={'40px'}>
                <Image
                  src='/logo-plugin.png'
                  width={30}
                  height={30}
                  alt='Logo'
                />
              </Td>
              <Td>
                <h4 className={styles.pluginListRowTitle}>Passwordless</h4> —
                Enable a secure and seamless emailed link authentication
                experience
              </Td>
              <Td className={styles.pluginListElementLastItem}>
                <Button variant={'tertiary'} size={'S'}>
                  More
                </Button>
              </Td>
            </Tr>
            <Tr className={styles.pluginListRow}>
              <Td width={'40px'}>
                <Image
                  src='/logo-plugin.png'
                  width={30}
                  height={30}
                  alt='Logo'
                />
              </Td>
              <Td>
                <h4 className={styles.pluginListRowTitle}>Passwordless</h4> —
                Enable a secure and seamless emailed link authentication
                experience
              </Td>
              <Td className={styles.pluginListElementLastItem}>
                <Button variant={'tertiary'} size={'S'}>
                  More
                </Button>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Grid.Item>
      <Grid.Item col={12} justifyContent={'center'}>
        {' '}
        <Button variant={'ghost'}>Show more</Button>
      </Grid.Item>
    </Grid.Root>
  );
}
