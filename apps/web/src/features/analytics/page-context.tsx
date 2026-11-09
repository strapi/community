"use client";

import { useLayoutEffect, useState } from "react";
import type { PageContextParams } from "./events";
import { clearPageContext, setPageContext } from "./page-context-store";

/**
 * Tells analytics what the current page is about. Server page templates
 * render it with their content metadata; it renders nothing.
 *
 * It sets the context in a layout effect, which runs before the passive
 * effect in <RouteTracker>, so the page view always carries it.
 */
export const PageContext = (props: PageContextParams) => {
  const [owner] = useState(() => Symbol("page-context"));
  const {
    page_type,
    content_id,
    content_name,
    content_category,
    owner_type,
    settings_tab,
    portal_section,
  } = props;

  useLayoutEffect(() => {
    setPageContext(owner, {
      page_type,
      content_id,
      content_name,
      content_category,
      owner_type,
      settings_tab,
      portal_section,
    });
    return () => clearPageContext(owner);
  }, [
    owner,
    page_type,
    content_id,
    content_name,
    content_category,
    owner_type,
    settings_tab,
    portal_section,
  ]);

  return null;
};
