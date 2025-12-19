import styles from "./styles.module.css";

export default function TrustedCard() {
  return (
    <div className={`${styles.trustedCard}`}>
      <h3 className={styles.trustedCardTitle}>Trusted publisher </h3>
      <p className={styles.trustedCardText}>
        This publisher is recognized as a trusted author by Strapi Inc. This
        means we have a formal agreement or collaborate closely with them to
        ensure a high level of security and a positive user experience when
        using this plugin in your project.
      </p>
    </div>
  );
}
