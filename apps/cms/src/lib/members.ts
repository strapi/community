// Members only get a public presence (profile page, members search index,
// community listings) once their email is verified. Accounts created before
// 2026-10-22, the day sign-up went live in production, predate email
// verification, so they're public regardless of `emailVerified`.
export const EMAIL_VERIFICATION_CUTOFF = new Date("2026-10-22T00:00:00Z");

export const isPublicMember = (user: {
  emailVerified?: boolean | null;
  createdAt?: string | Date | null;
}) =>
  user.emailVerified === true ||
  (user.createdAt != null &&
    new Date(user.createdAt) < EMAIL_VERIFICATION_CUTOFF);

// Query filter equivalent of `isPublicMember`.
export const publicMemberFilters = {
  $or: [
    { emailVerified: { $eq: true } },
    { createdAt: { $lt: EMAIL_VERIFICATION_CUTOFF.toISOString() } },
  ],
};

/** Merges `publicMemberFilters` into (optional) caller-supplied filters. */
export const withPublicMemberFilters = (filters?: unknown) =>
  filters && typeof filters === "object" && Object.keys(filters).length > 0
    ? { $and: [filters, publicMemberFilters] }
    : publicMemberFilters;
