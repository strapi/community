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

// Populate fragments for entriesQuery. Every index selects its fields explicitly,
// so only what the search UI renders, filters or sorts on ends up in Meilisearch.
// `publishedAt` must always be selected: the plugin drops entries without it.
export const urlAliasPopulate = { fields: ["url_path"] };
export const mediaPopulate = { fields: ["url", "alternativeText"] };
export const namePopulate = { fields: ["name"] };

// `owner` is a morph relation, so nested fields must be populated per target.
const ownerPopulate = {
  on: {
    "plugin::better-auth.user": {
      fields: ["name", "image"],
      populate: { url_alias: urlAliasPopulate },
    },
    "plugin::better-auth.organization": {
      fields: ["name", "logo"],
      populate: { url_alias: urlAliasPopulate },
    },
  },
};

// Entries query + transform for content types with an `owner`. A top-level
// `fields` selection drops the morph columns (owner_type/owner_id), which makes
// `owner` resolve to null. So all fields are fetched and the transform picks
// the selected ones instead.
export const withOwner = ({ fields, populate }) => {
  const keys = ["id", "documentId", ...fields, ...Object.keys(populate)];

  return {
    entriesQuery: { populate: { ...populate, owner: ownerPopulate } },
    transformEntry: ({ entry }) => ({
      ...Object.fromEntries(keys.map((key) => [key, entry[key]])),
      owner: pickPublicProfile(entry.owner),
    }),
  };
};

// `parent` is only populated for filterEntry (top-level pages only).
export const transformHelpPage = ({ entry: { parent, ...entry } }) => entry;

// Sort/filter attributes (createdAt, community_star) must stay on the document.
export const transformMember = ({ entry }) => ({
  id: entry.id,
  ...pickPublicProfile(entry),
  profile: entry.profile ? { bio: entry.profile.bio } : null,
  createdAt: entry.createdAt,
  community_star: entry.community_star,
});
