export function ProfileSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4 rounded-md border border-(--color-neutral150) bg-white p-6 shadow-sm">
      <div className="h-5 w-40 animate-pulse rounded bg-(--color-neutral150)" />
      <div className="h-24 w-full animate-pulse rounded bg-(--color-neutral150)" />
    </div>
  );
}
