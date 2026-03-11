import Link from "next/link";
import styles from "./styles.module.css";

type BaseProps = {
  type: "neutral" | "success" | "danger";
  title: string;
  text: string;
  className?: string;
};

type LinkProps = BaseProps & {
  link: string;
};

type ButtonProps = BaseProps & {
  button: {
    link: string;
    text: string;
  };
};

type Props = LinkProps | ButtonProps;

export function ActionCard({ title, text, className, type, ...props }: Props) {
  if ("link" in props) {
    return (
      <Link
        href={props.link}
        className={`${styles.actionCard} ${styles[type]} ${className}`}
      >
        {/* <ExternalLink className={styles.actionCardIcon} /> */}
        <h3 className={styles.actionCardTitle}>{title}</h3>
        <p className={styles.actionCardText}>{text}</p>
      </Link>
    );
  }

  return (
    <div className={`${styles.actionCard} ${styles[type]} ${className}`}>
      <h3 className={styles.actionCardTitle}>{title}</h3>
      <p className={styles.actionCardText}>{text}</p>
      <button
        type="button"
        className={styles.actionCardButton}
        onClick={() => window.open(props.button.link, "_blank")}
      >
        {props.button.text}
      </button>
    </div>
  );
}
