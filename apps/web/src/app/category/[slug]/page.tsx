import Homepage from '@/ui/homepage';

export default async function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: {
    type?: string;
    query?: string;
    page?: number;
  };
}) {
  const type = searchParams?.type || '';
  const query = searchParams?.query || '';
  const page = searchParams?.page || 1;
  const sort = searchParams?.sort || 'alphabetical';

  return (
    <Homepage
      type={type}
      category={params.slug}
      query={query}
      page={page}
      sort={sort}
    />
  );
}
