import qs from 'qs';
import useSWR from 'swr';
import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import isBoolean from 'lodash/isBoolean';
import isNumber from 'lodash/isNumber';

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;
const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

export const fetcher = (url: string, authenticated: boolean = true) => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  if (authenticated) {
    headers.append('Authorization', `Bearer ${BEARER_TOKEN}`);
  }

  return fetch(CMS_URL + url, { headers })
    .then((data) => data.json())
    .catch((error) => new Error(error));
};

const removeEmptyValue = (obj: Object = {}, prevObj: Object = {}) => {
  Object.keys(obj).forEach((key: string) => {
    const value = obj[key as keyof typeof obj];

    if (isEmpty(value) && !isBoolean(value) && !isNumber(value)) {
      delete obj[key as keyof typeof obj];
      return removeEmptyValue(prevObj);
    } else if (isObject(value)) {
      return removeEmptyValue(value, obj);
    }
  });

  return obj;
};

const clearFilters = (filters: Object = {}) => {
  return filters
    ? `?${qs.stringify(removeEmptyValue(filters), { arrayFormat: 'indices', encode: false })}`
    : '';
};

export function useFetchOneWithSlug(type: string, filters: Object) {
  const { data, error, isLoading } = useSWR(
    `/api/${type}${clearFilters(filters)}`,
    fetcher
  );

  return {
    data,
    error,
    isLoading,
  };
}

export async function fetchOneWithSlug(type: string, filters: Object) {
  return fetcher(`/api/${type}${clearFilters(filters)}`);
}

export function useFetchManyRandom(
  type: string,
  filters?: Object,
  swr?: Object
) {
  const { data, error, isLoading } = useSWR(
    `/api/${type}/random${clearFilters(filters)}`,
    fetcher,
    swr
  );

  return {
    data,
    error,
    isLoading,
  };
}

export function useFetchMany(type: string, filters?: Object, swr?: Object) {
  const { data, error, isLoading } = useSWR(
    `/api/${type}${clearFilters(filters)}`,
    fetcher,
    swr
  );

  return {
    data,
    error,
    isLoading,
  };
}

export function useCountMany(type: string, filters?: Object, swr?: Object) {
  const { data, error, isLoading } = useSWR(
    `/api/${type}/count${clearFilters(filters)}`,
    fetcher,
    swr
  );

  return {
    data,
    error,
    isLoading,
  };
}
