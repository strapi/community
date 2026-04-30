export const cmsImageUrl = (url: string): string =>
  url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `${process.env.NEXT_PUBLIC_CMS_URL}${url}`;
