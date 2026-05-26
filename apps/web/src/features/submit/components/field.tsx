import { cn } from "@/lib/utils";

export function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-(--color-neutral800)"
    >
      {children}
      {required && (
        <span className="ml-0.5 text-(--color-primary600)" aria-hidden>
          *
        </span>
      )}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-(--color-neutral600)">{children}</p>;
}

export function Textarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 5,
  hasError,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hasError?: boolean;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "flex w-full resize-y rounded-md border bg-white px-3 py-2 text-sm text-(--color-neutral900) shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-(--color-neutral600) focus-visible:border-(--color-primary200)",
        hasError ? "border-red-400" : "border-(--color-neutral150)",
      )}
    />
  );
}

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-(--color-neutral150)" />
      </div>
      <div className="relative flex justify-start">
        <span className="bg-white pr-3 text-xs font-semibold uppercase tracking-widest text-(--color-neutral600)">
          {label}
        </span>
      </div>
    </div>
  );
}
