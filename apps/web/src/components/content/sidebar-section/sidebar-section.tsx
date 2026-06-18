const SidebarSection = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-md mb-2 bg-(--color-neutral100) border border-(--color-neutral150) px-5 py-4">
    {title && (
      <p className="mb-3 text-[13px] font-bold uppercase tracking-wider text-(--color-grey700)">
        {title}
      </p>
    )}
    {children}
  </div>
);

export { SidebarSection };
