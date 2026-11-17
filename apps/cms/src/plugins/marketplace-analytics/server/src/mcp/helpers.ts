/**
 * Shared MCP + time-series helpers for the marketplace analytics tools.
 */

/** Shape every tool returns on success: human-readable text + structured data. */
export function toolResult<T extends Record<string, unknown>>(payload: T) {
  return {
    content: [
      { type: "text" as const, text: JSON.stringify(payload, null, 2) },
    ],
    structuredContent: payload,
  };
}

/** Shape every tool returns on failure. */
export function toolError(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true as const,
  };
}

export function errorMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) {
    return String((e as { message: unknown }).message);
  }
  return String(e);
}

// ─── Time-series bucketing ──────────────────────────────────────────────────

export type Period = "daily" | "weekly" | "monthly";

export interface GraphPoint {
  /** Machine-sortable bucket key: `YYYY-MM-DD` (daily/weekly) or `YYYY-MM` (monthly). */
  date: string;
  /** Human-readable bucket label. */
  label: string;
  /** New items that fall in this bucket. */
  count: number;
  /** Running total across all buckets up to and including this one. */
  cumulative: number;
}

function startOfUTCDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

/** Normalize a date to the start of its bucket (UTC). Weeks start on Monday. */
function startOfBucket(date: Date, period: Period): Date {
  const day = startOfUTCDay(date);
  if (period === "monthly") {
    return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1));
  }
  if (period === "weekly") {
    const dow = day.getUTCDay(); // 0 = Sun … 6 = Sat
    const sinceMonday = (dow + 6) % 7;
    return new Date(day.getTime() - sinceMonday * 86_400_000);
  }
  return day;
}

/** The start of the bucket immediately after `date`. */
function nextBucket(date: Date, period: Period): Date {
  if (period === "monthly") {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
  }
  const step = period === "weekly" ? 7 : 1;
  return new Date(date.getTime() + step * 86_400_000);
}

function bucketKey(date: Date, period: Period): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  if (period === "monthly") return `${y}-${m}`;
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function bucketLabel(date: Date, period: Period): string {
  const opts: Intl.DateTimeFormatOptions = { timeZone: "UTC" };
  if (period === "monthly") {
    return date.toLocaleDateString("en-US", {
      ...opts,
      year: "numeric",
      month: "short",
    });
  }
  const full = date.toLocaleDateString("en-US", {
    ...opts,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return period === "weekly" ? `Week of ${full}` : full;
}

/**
 * Build a gap-filled time series from a list of ISO timestamps. Buckets run
 * continuously from the earliest to the latest date (so a graph never has
 * missing x-values), each carrying its own count and a running cumulative total.
 */
export function buildTimeSeries(
  isoDates: string[],
  period: Period,
): GraphPoint[] {
  const valid = isoDates
    .map((s) => new Date(s))
    .filter((d) => !Number.isNaN(d.getTime()));
  if (valid.length === 0) return [];

  const counts = new Map<string, number>();
  let min = startOfBucket(valid[0], period);
  let max = min;

  for (const d of valid) {
    const bucket = startOfBucket(d, period);
    if (bucket.getTime() < min.getTime()) min = bucket;
    if (bucket.getTime() > max.getTime()) max = bucket;
    const key = bucketKey(bucket, period);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const points: GraphPoint[] = [];
  let cursor = min;
  let cumulative = 0;
  // Safety valve against pathological ranges (e.g. corrupt far-future dates).
  for (
    let guard = 0;
    cursor.getTime() <= max.getTime() && guard < 100_000;
    guard++
  ) {
    const key = bucketKey(cursor, period);
    const count = counts.get(key) ?? 0;
    cumulative += count;
    points.push({
      date: key,
      label: bucketLabel(cursor, period),
      count,
      cumulative,
    });
    cursor = nextBucket(cursor, period);
  }

  return points;
}
