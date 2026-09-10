import type { Field, Props } from "./types";

export const USER_FIELDS: Field[] = [
  {
    name: "subtitle",
    label: "Subtitle",
    placeholder: "A short tagline about you",
  },
  {
    name: "bio",
    label: "Bio",
    placeholder: "Tell the community about yourself",
    multiline: true,
  },
  { name: "website", label: "Website", placeholder: "https://example.com" },
  {
    name: "github",
    label: "GitHub",
    placeholder: "https://github.com/your-username",
  },
  { name: "location", label: "Location", placeholder: "City, Country" },
  {
    name: "email",
    label: "Public email",
    placeholder: "A contact address shown on your public profile",
  },
  {
    name: "readme",
    label: "Readme",
    placeholder: "Markdown supported",
    multiline: true,
    large: true,
  },
];

export const ORGANIZATION_FIELDS: Field[] = [
  {
    name: "subtitle",
    label: "Subtitle",
    placeholder: "A short tagline for your organization",
  },
  {
    name: "bio",
    label: "Bio",
    placeholder: "Tell the community about your organization",
    multiline: true,
  },
  { name: "website", label: "Website", placeholder: "https://example.com" },
  {
    name: "github",
    label: "GitHub",
    placeholder: "https://github.com/your-org",
  },
  { name: "location", label: "Location", placeholder: "City, Country" },
  {
    name: "readme",
    label: "Readme",
    placeholder: "Markdown supported",
    multiline: true,
    large: true,
  },
];

export const COPY: Record<
  Props["variant"],
  { heading: string; description: string }
> = {
  user: {
    heading: "Profile",
    description: "Shown on your public profile page.",
  },
  organization: {
    heading: "Organization profile",
    description: "Shown on your organization's public page.",
  },
};
