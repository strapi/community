import { useEffect, useState, useRef } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

import { fetchPackages, countPackages } from '@/app/lib/data';

import TableList from './tableList';

import { Package } from '@/app/definitions';

import {
  Button,
  Grid,
  Searchbar,
  SingleSelect,
  SingleSelectOption,
} from '@strapi/design-system';

import styles from './styles.module.css';

export default function PluginList({
  params,
  activeCategory,
}: {
  params: {
    type: string;
    page: string;
    sort: string;
    query: string;
    category: Object;
    filters: Object;
    maxItems: number;
  };
}) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(params.query);
  const [showMoreType, setShowMoreType] = useState('next');
  const [packages, setPackages] = useState<Package[]>([]);
  const initialPage = useRef(params.page.toString());
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const sort = () => {
    switch (params.sort) {
      case 'newest':
        return 'createdAt:desc';
      case 'github':
        return 'stars:desc';
      case 'downloads':
        return 'downloads:desc';
      default:
        return 'name:asc';
    }
  };

  // Fetch data
  const {
    data: { data: fetchedPackages = [], meta } = {},
    isLoading: isLoadingPackages,
  }: { data: { data?: Package[]; meta?: Object }; isLoading: boolean } =
    fetchPackages(params.maxItems, params.page, params.filters, sort());

  // Update URL parameters
  const updateQueryParam = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');

    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, 250);

  // Handler search input
  const handleSearch = (term: string) => {
    updateQueryParam(term);
    setSearchValue(term); // State required for performance
  };

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    params.set('sort', sort);

    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const showMore = (type: string) => {
    const params = new URLSearchParams(searchParams);
    const page = params.get('page') || '1';

    const pageNumber =
      type === 'next' ? parseInt(page) + 1 : parseInt(page) - 1;

    params.set('page', pageNumber.toString());

    replace(`${pathname}?${params.toString()}`, { scroll: false });
    setShowMoreType(type);
  };

  useEffect(() => {
    if (
      params.page === '1' &&
      packages.length > 0 &&
      initialPage.current === params.page
    ) {
      return setPackages(fetchedPackages);
    }

    if (fetchedPackages.length > 0) {
      setPackages(
        showMoreType === 'next'
          ? [...packages, ...fetchedPackages]
          : [...fetchedPackages, ...packages]
      );
    }
  }, [fetchedPackages]);

  console.log('Plugin', packages);

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
          value={searchValue}
          onClear={() => setValue('')}
          onChange={(e) => handleSearch(e.target.value)}
        ></Searchbar>
      </Grid.Item>
      <Grid.Item
        col={3}
        direction={'column'}
        alignItems={'flex-start'}
        justifyContent={'center'}
        className={styles.filterFormElement}
      >
        <SingleSelect width={'100%'} value={params.sort} onChange={handleSort}>
          <SingleSelectOption value='alphabetical'>
            Alphabetical (A-Z)
          </SingleSelectOption>
          <SingleSelectOption value='newest'>Newest</SingleSelectOption>
          <SingleSelectOption value='github'>GitHub stars</SingleSelectOption>
          <SingleSelectOption value='downloads'>Downloads</SingleSelectOption>
        </SingleSelect>
      </Grid.Item>
      <Grid.Item col={12} justifyContent={'center'}>
        {' '}
        {isLoadingPackages ||
        meta?.pagination.page === 1 ||
        initialPage.current === '1' ? (
          ''
        ) : parseInt(initialPage.current) <= meta?.pagination.pageCount ? (
          <Button variant={'ghost'} onClick={() => showMore('previous')}>
            Show more
          </Button>
        ) : (
          ''
        )}
      </Grid.Item>
      <Grid.Item col={12} className={styles.pluginListElement}>
        <TableList items={packages} />
      </Grid.Item>
      <Grid.Item col={12} justifyContent={'center'}>
        {' '}
        {isLoadingPackages ||
        meta?.pagination.page === meta?.pagination.pageCount ? (
          ''
        ) : params.maxItems < meta?.pagination.total ? (
          <Button variant={'ghost'} onClick={() => showMore('next')}>
            Show more
          </Button>
        ) : (
          ''
        )}
      </Grid.Item>
    </Grid.Root>
  );
}
