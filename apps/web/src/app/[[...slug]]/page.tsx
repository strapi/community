import { findUrlAliases, findPage } from '@/lib/webtools';
import PackagePage from '@/templates/Package/page';
import UserPage from '@/templates/User/page';
import type { Metadata, NextPage } from 'next';

const Router: NextPage<PageProps<'/[[...slug]]'>> = async ({ params }) => {
  const { slug } = await params;
  const path = `/${slug?.join('/') || ''}`;
  const page = await findPage({
    path,
    status: 'published',
    fields: ['documentId'],
  });

  if (!page) {
    return null;
  }

  switch (page.contentType) {
    case 'api::package.package': {
      return <PackagePage documentId={page.documentId} />
    }
    case 'plugin::users-permissions.user': {
      return <UserPage id={page.id} />
    }
    default: {
      return `No template for content type ${page.contentType}`;
    }
  }
};

export async function generateStaticParams() {
  const pages = await findUrlAliases();
  const removeEmptyElements = (array: string[]) => array.filter((a) => a);

  if (!pages) {
    return [];
  }

  return pages
    .map((page) => {
      if (!page.url_path) {
        return null;
      }
      return {
        slug: removeEmptyElements(page.url_path.split('/')),
      };
    })
    .filter(Boolean);
}

export const generateMetadata = async ({ params }: PageProps<'/[[...slug]]'>): Promise<Metadata> => {
  const { slug } = await params;
  const path = `/${slug?.join('/') || ''}`;
  const page = await findPage({
    path,
    status: 'published',
    fields: ['documentId'],
    populate: {
      seo: true,
    }
  });

  if (!page) {
    return {};
  }

  return {
    title: page.seo?.metaTitle,
    description: page.seo?.metaDescription,
    keywords: page.seo?.keywords,
  }
}

export default Router;
