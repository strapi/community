type Props = {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  style?: React.CSSProperties;
} & React.ComponentProps<"div">;

const Container = ({
  children,
  maxWidth,
  className,
  style,
  ...props
}: Props) => {
  return (
    <div
      className={`mx-auto w-full max-w-312 px-5 ${className || ""}`.trim()}
      style={{ maxWidth, ...style }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
