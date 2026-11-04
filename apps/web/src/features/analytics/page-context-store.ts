import type { PageContextParams } from "./events";

// The context of the page on screen, set by <PageContext>. A plain module
// variable rather than React state: nothing re-renders when it changes, and
// track() can read it from any event handler.
let current: { owner: symbol; params: PageContextParams } | null = null;

export function setPageContext(owner: symbol, params: PageContextParams) {
  current = { owner, params };
}

/** Clears the context only if `owner` set it, so a newer page keeps its own. */
export function clearPageContext(owner: symbol) {
  if (current?.owner === owner) current = null;
}

export function getPageContext(): PageContextParams | undefined {
  return current?.params;
}
