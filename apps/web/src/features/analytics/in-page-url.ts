// Pathname of the last URL a page rewrote in place (e.g. opening a roadmap
// item's dialog at its own URL), so the route tracker doesn't count it as a
// new page view.
let inPagePath: string | null = null;

/** `history.replaceState` that the route tracker treats as the same page. */
export function replaceUrlInPage(url: URL) {
  if (url.pathname !== window.location.pathname) inPagePath = url.pathname;
  window.history.replaceState(window.history.state, "", url);
}

/** Whether `pathname` came from replaceUrlInPage; resets the marker. */
export function consumeInPagePath(pathname: string): boolean {
  const match = inPagePath === pathname;
  inPagePath = null;
  return match;
}
