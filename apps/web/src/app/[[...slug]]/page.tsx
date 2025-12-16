import { findOnePage, findPages } from '@/lib/cms';
import Plugin from '@/templates/package';
import Author from '@/templates/user';
import type { Metadata, NextPage } from 'next';

const Router: NextPage<PageProps<'/[[...slug]]'>> = async ({ params }) => {
  const { slug } = await params;
  const page = await findOnePage(`/${slug?.join('/') || ''}`);

  if (!page) {
    return null;
  }

  switch (page.contentType) {
    case 'api::package.package': {
      return <Plugin data={page} />
    }
    case 'plugin::users-permissions.user': {
      return <Author data={page} />
    }
    default: {
      return `No template for content type ${page.contentType}`;
    }
  }
};

export async function generateStaticParams() {
  const pages = await findPages();
  const removeEmptyElements = (array: any) => array.filter((a: any) => a);

  if (!pages) {
    return [];
  }

  return pages
    .map((page: any) => {
      if (!page?.url_path) {
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
  const page = await findOnePage(`/${slug?.join('/') || ''}`);

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
