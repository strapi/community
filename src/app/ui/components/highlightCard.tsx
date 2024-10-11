import Link from 'next/link';
import Image from 'next/image';

import styles from '@/app/css/homepage.module.css';

export type Plugin = {
  name: string;
  description: string;
  stars: number;
  downloads: number;
};

export function HighlightCard({
  name = 'App Version',
  description = 'Simple plugin for Strapi 4 to show the app version from package.json in the Settings page',
  stars = 1993,
  downloads = 10,
}: Plugin) {
  return (
    <Link href={'http://google.com'} className={`${styles.actionCard}`}>
      <Image />
      <span>{stars}</span>
      <span>{downloads}</span>
      <h3 className={styles.actionCardTitle}>{name}</h3>
      <p className={styles.actionCardText}>{description}</p>
    </Link>
  );
}
