import styles from './styles.module.css';

import SealCheck from '@/app/ui/shared/seal-check';

export default function TrustedCard() {
  return (
    <div className={`${styles.trustedCard}`}>
      <h3 className={styles.trustedCardTitle}>
        Trusted publisher{' '}
        <SealCheck
          className={styles.sealcheck}
          fill={'#4945FF'}
          width={18}
          height={18}
          style={{
            verticalAlign: 'middle',
            marginLeft: '2px',
            marginBottom: '4px',
          }}
        />
      </h3>
      <p className={styles.trustedCardText}>
        This publisher is recognized as a trusted author by Strapi Inc. This
        means we have a formal agreement or collaborate closely with them to
        ensure a high level of security and a positive user experience when
        using this plugin in your project.
      </p>
    </div>
  );
}
