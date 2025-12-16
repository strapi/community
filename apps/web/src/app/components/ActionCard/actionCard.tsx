import styles from './styles.module.css';
import Link from 'next/link';
import { ExternalLink } from '@strapi/icons';
import { Button } from '@strapi/design-system';

export function ActionCard({
  children,
  type = 'plugin',
  title,
  color,
  link,
  className,
}: Readonly<{
  children: React.ReactNode;
  className: string;
  type: string;
  title: string;
  color: string;
  link?: string;
}>) {
  if (type === 'missing') {
    return (
      <Link
        href={link}
        className={`${styles.actionCard} ${styles[color + 'Bg']} ${className}`}
      >
        <ExternalLink className={styles.actionCardIcon} />
        <h3 className={styles.actionCardTitle}>{title}</h3>
        <p className={styles.actionCardText}>{children}</p>
      </Link>
    );
  }

  return (
    <div
      className={`${styles.actionCard} ${styles[color + 'Bg']} ${className}`}
    >
      <h3 className={styles.actionCardTitle}>{title}</h3>
      <p className={styles.actionCardText}>{children}</p>
      <Button
        className={styles.actionCardButton}
        variant={type === 'plugin' ? 'success-light' : 'danger-light'}
      >
        {type === 'plugin' ? 'Submit a plugin' : 'Report an issue'}
      </Button>
    </div>
  );
}
