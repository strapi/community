"use client";

import {
  type AnalyticsItem,
  type EventMap,
  type EventName,
  type GlobalParams,
  type ItemEventName,
  PARAM_KEYS,
} from "./events";
import { getPageContext } from "./page-context-store";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const globals: GlobalParams = {
  app_env: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "local",
  app_version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
};

/** Update parameters sent with every event (for example `logged_in`). */
export function setGlobalParams(params: Partial<GlobalParams>) {
  Object.assign(globals, params);
}

const reset = Object.fromEntries(PARAM_KEYS.map((key) => [key, undefined]));

function push(message: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(message);
  if (process.env.NODE_ENV !== "production") {
    console.debug("[track]", message.event, message);
  }
}

/**
 * Push one analytics event to the dataLayer. Call it from the event handler
 * of the user action, never from render, so it fires once per action.
 */
export function track<E extends EventName>(event: E, params: EventMap[E]) {
  push({ ...reset, ...globals, ...getPageContext(), ...params, event });
}

/**
 * Push a GA4 ecommerce item event. The `{ ecommerce: null }` push clears the
 * previous list from GTM's data model, so items never leak between events.
 */
export function trackItems(
  event: ItemEventName,
  list: { item_list_id?: string; item_list_name?: string },
  items: AnalyticsItem[],
) {
  push({ ecommerce: null });
  push({
    ...reset,
    ...globals,
    ...getPageContext(),
    event,
    ecommerce: { ...list, items },
  });
}
