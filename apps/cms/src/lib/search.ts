// Search index documents are public, so user/organization data is reduced to
// what the cards render: name, image and URL alias. Organizations store their
// image as `logo`; it's exposed as `image` so both owner types share one shape.
const pickUrlAlias = (urlAlias) =>
  (urlAlias ?? []).map(({ url_path }) => ({ url_path }));

const pickPublicProfile = (entity) =>
  entity
    ? {
        documentId: entity.documentId,
        name: entity.name,
        image: entity.image ?? entity.logo ?? null,
        url_alias: pickUrlAlias(entity.url_alias),
      }
    : null;

// `owner` is a morph relation, so nested fields must be populated per target.
export const ownerPopulate = {
  on: {
    "plugin::better-auth.user": { populate: ["url_alias"] },
    "plugin::better-auth.organization": { populate: ["url_alias"] },
  },
};

export const transformOwner = ({ entry }) => ({
  ...entry,
  owner: pickPublicProfile(entry.owner),
});

// Sort/filter attributes (createdAt, community_star) must stay on the document.
export const transformMember = ({ entry }) => ({
  id: entry.id,
  ...pickPublicProfile(entry),
  profile: entry.profile ? { bio: entry.profile.bio } : null,
  createdAt: entry.createdAt,
  community_star: entry.community_star,
});
