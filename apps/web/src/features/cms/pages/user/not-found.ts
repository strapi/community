import { notFound } from "next/navigation";

/**
 * The CMS 404s for members without a public presence (e.g. unverified
 * sign-ups) even though their URL alias still resolves, so render the
 * not-found page instead of an error.
 */
export const notFoundOn404 = (error: { response?: { status?: number } }) => {
  if (error?.response?.status === 404) notFound();
  throw error;
};
