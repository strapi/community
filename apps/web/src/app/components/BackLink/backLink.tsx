import Link from 'next/link';

import { ArrowLeft } from '@strapi/icons';

import styles from './styles.module.css';

export default function BackLink({ to }: { to: string }) {
  return (
    <Link className={styles.backLink} href={to}>
      <ArrowLeft className={styles.backLinkIcon} />
      Back to Homepage
    </Link>
  );
}
