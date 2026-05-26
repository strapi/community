export const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (cb: () => void) => void;
        execute: (
          siteKey: string,
          options: { action: string },
        ) => Promise<string>;
      };
    };
  }
}

export async function getRecaptchaToken(action: string): Promise<string> {
  if (
    !RECAPTCHA_SITE_KEY ||
    typeof window === "undefined" ||
    !window.grecaptcha?.enterprise
  ) {
    return "";
  }
  await new Promise<void>((resolve) =>
    window.grecaptcha.enterprise.ready(resolve),
  );
  return window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action });
}
