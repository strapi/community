import Homepage from './ui/homepage';

export const metadata = {
  title: 'Strapi Market',
  description:
    'Power up your Strapi app with the industry-leading software and easily add custom features using plugins.',
};

export default function Home({
  searchParams,
}: {
  searchParams?: {
    type?: string;
    sort?: string;
    query?: string;
    page?: string;
  };
}) {
  const type = searchParams?.type || '';
  const sort = searchParams?.sort || 'alphabetical';
  const query = searchParams?.query || '';
  const page = searchParams?.page || '1';

  return <Homepage type={type} sort={sort} query={query} page={page} />;
}
