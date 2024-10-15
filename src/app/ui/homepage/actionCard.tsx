import styles from '@/app/css/layout.module.css';
import Link from 'next/link';
import { ExternalLink } from '@strapi/icons';
import { Button } from '@strapi/design-system';

export function ActionCard({
  children,
  title,
  color,
  link,
}: Readonly<{
  children: React.ReactNode;
  title: string;
  color: string;
  link?: string;
}>) {
  if (link) {
    return (
      <Link
        href={link}
        className={`${styles.actionCard} ${styles[color + 'Bg']}`}
      >
        <ExternalLink className={styles.actionCardIcon} />
        <h3 className={styles.actionCardTitle}>{title}</h3>
        <p className={styles.actionCardText}>{children}</p>
      </Link>
    );
  }

  return (
    <div className={`${styles.actionCard} ${styles[color + 'Bg']}`}>
      <h3 className={styles.actionCardTitle}>{title}</h3>
      <p className={styles.actionCardText}>{children}</p>
      <Button className={styles.actionCardButton} variant='success-light'>
        Submit a plugin
      </Button>
    </div>
  );
}
