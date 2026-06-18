// Augments the global RequestInit with Next.js's fetch extension.
// This avoids importing the full next package just for types.
interface RequestInit {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}
