import Script from "next/script";
import { Suspense } from "react";
import { RouteTracker } from "./route-tracker";

// GTM-K8MLX5J5 in every environment. AUTH and PREVIEW come from the GTM
// environment snippets and are set only on Vercel Preview and Staging.
const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
const gtmAuth = process.env.NEXT_PUBLIC_GTM_AUTH;
const gtmPreview = process.env.NEXT_PUBLIC_GTM_PREVIEW;

function gtmScriptUrl(id: string) {
  const url = new URL("https://www.googletagmanager.com/gtm.js");
  url.searchParams.set("id", id);
  if (gtmAuth && gtmPreview) {
    url.searchParams.set("gtm_auth", gtmAuth);
    url.searchParams.set("gtm_preview", gtmPreview);
    url.searchParams.set("gtm_cookies_win", "x");
  }
  return url.toString();
}

/**
 * Loads the GTM container and the page view tracker. Consent is handled
 * inside GTM by the Cookiebot CMP tag, so the app ships no consent code.
 * With NEXT_PUBLIC_GTM_ID unset (local, CI) nothing loads; events still go
 * to window.dataLayer and the console, so they can be checked without GTM.
 */
export const Analytics = () => (
  <>
    {gtmId && (
      <>
        {/* The standard GTM bootstrap: mark the start time, then load the
            container. Events pushed earlier wait in window.dataLayer. */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});`}
        </Script>
        <Script
          id="gtm"
          strategy="afterInteractive"
          src={gtmScriptUrl(gtmId)}
        />
      </>
    )}
    {/* useSearchParams needs a Suspense boundary so the whole tree isn't
        opted out of static rendering. */}
    <Suspense>
      <RouteTracker />
    </Suspense>
  </>
);
