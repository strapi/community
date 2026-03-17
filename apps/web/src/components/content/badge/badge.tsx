const FeaturedBadge = () => {
  return (
    <span className="inline-flex rounded-md bg-(--color-warning100) px-2 py-1 text-xs font-semibold text-(--color-warning700)">
      Featured
    </span>
  );
};

const OfficialBadge = () => {
  return (
    <span className="inline-flex rounded-md bg-(--color-primary100) px-2 py-1 text-xs font-semibold text-(--color-primary700)">
      Official
    </span>
  );
};

const PaidBadge = () => {
  return (
    <span className="inline-flex rounded-md bg-(--color-success100) px-2 py-1 text-xs font-semibold text-(--color-success700)">
      Paid
    </span>
  );
};

export { FeaturedBadge, OfficialBadge, PaidBadge };
