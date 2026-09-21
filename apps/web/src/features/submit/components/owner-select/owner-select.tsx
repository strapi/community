"use client";

import { useEffect, useState } from "react";
import { getManageableOrganizations } from "../../lib/get-owner-options";
import type { OwnerType } from "../../types";

export type OwnerValue = { type: OwnerType; id: number | null };

const PERSONAL_VALUE = "personal";

/**
 * Who a submission belongs to — the signed-in user, or an organization
 * they're an owner/admin of (fetched from `GET /api/organizations/mine`,
 * which already scopes the list to that role — no filtering needed here).
 */
export function OwnerSelect({
  value,
  onChange,
  personalLabel,
}: {
  value: OwnerValue;
  onChange: (value: OwnerValue) => void;
  personalLabel: string;
}) {
  const [organizations, setOrganizations] = useState<
    { id: number; name: string }[]
  >([]);

  useEffect(() => {
    getManageableOrganizations().then(setOrganizations);
  }, []);

  const selected =
    value.type === "plugin::better-auth.organization" && value.id !== null
      ? String(value.id)
      : PERSONAL_VALUE;

  return (
    <select
      id="owner_id"
      className="flex h-10 w-full rounded-md border border-(--color-neutral150) bg-white px-3 py-2 text-sm text-(--color-neutral900) shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none focus:border-(--color-primary200)"
      value={selected}
      onChange={(e) => {
        const raw = e.target.value;
        onChange(
          raw === PERSONAL_VALUE
            ? { type: "plugin::better-auth.user", id: null }
            : { type: "plugin::better-auth.organization", id: Number(raw) },
        );
      }}
    >
      <option value={PERSONAL_VALUE}>{personalLabel} (Personal Account)</option>
      {organizations.map((organization) => (
        <option key={organization.id} value={organization.id}>
          {organization.name}
        </option>
      ))}
    </select>
  );
}
