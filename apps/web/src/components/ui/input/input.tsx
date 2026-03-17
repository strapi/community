import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-(--color-neutral150) bg-white px-3 py-2 text-sm text-(--color-neutral900) shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-(--color-neutral600) focus-visible:border-(--color-primary200) disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
