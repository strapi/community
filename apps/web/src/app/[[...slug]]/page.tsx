import { findUrlAliases, findPage } from '@/lib/webtools';
import { packageMetadata } from '@/templates/Package/metadata';
import PackagePage from '@/templates/Package/page';
import { userMetadata } from '@/templates/User/metadata';
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
  });

  if (!page) {
    return {};
  }

  switch (page.contentType) {
    case 'api::package.package': {
      return packageMetadata(page.documentId);
    }
    case 'plugin::users-permissions.user': {
      return userMetadata(page.id);
    }
    default: {
      return {};
    }
  }
}

export default Router;
