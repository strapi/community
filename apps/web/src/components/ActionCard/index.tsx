import Link from "next/link";
import { Button } from "@/components/Button";
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
      <Button
        variant="secondary"
        size="medium"
        onClick={() => window.open(props.button.link, "_blank")}
        className={styles.actionCardButton}
      >
        {props.button.text}
      </Button>
    </div>
  );
}
