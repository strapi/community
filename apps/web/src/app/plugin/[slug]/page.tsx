import { Package } from '@/app/definitions';
import { fetchPackage } from '@/lib/data';

import Plugin from '@/ui/plugin';

import { fetcher } from '@/lib/cms';

export async function generateStaticParams() {
  const packages = await fetcher('/api/packages');

  return packages.data.map((pkg) => ({
    slug: pkg.slug,
  }));
}

export default async function Page({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const packagesData: { data: Package[] } = await fetchPackage(
    'packages',
    params.slug,
    false
  );

  const pkg: Package = packagesData?.data[0] || {};

  return <Plugin data={pkg} />;
}
