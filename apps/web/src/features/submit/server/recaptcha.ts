const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const RECAPTCHA_PROJECT_ID = process.env.RECAPTCHA_PROJECT_ID;
const RECAPTCHA_API_KEY = process.env.RECAPTCHA_API_KEY;
const RECAPTCHA_MIN_SCORE = 0.5;

interface EnterpriseAssessment {
  tokenProperties?: { valid: boolean; action?: string; invalidReason?: string };
  riskAnalysis?: { score: number; reasons?: string[] };
}

export function isRecaptchaConfigured(): boolean {
  return !!(RECAPTCHA_SITE_KEY && RECAPTCHA_PROJECT_ID && RECAPTCHA_API_KEY);
}

export async function verifyRecaptcha(
  token: string,
  expectedAction: string,
  logPrefix: string,
): Promise<{ success: boolean; score: number }> {
  if (!isRecaptchaConfigured()) {
    console.warn(
      `[${logPrefix}] reCAPTCHA Enterprise not configured — skipping verification.`,
    );
    return { success: true, score: 1 };
  }

  const url =
    `https://recaptchaenterprise.googleapis.com/v1/projects/${RECAPTCHA_PROJECT_ID}` +
    `/assessments?key=${RECAPTCHA_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: { token, siteKey: RECAPTCHA_SITE_KEY, expectedAction },
    }),
  });

  if (!res.ok) {
    throw new Error(`reCAPTCHA Enterprise API returned ${res.status}`);
  }

  const data = (await res.json()) as EnterpriseAssessment;

  if (!data.tokenProperties?.valid) {
    console.warn(
      `[${logPrefix}] reCAPTCHA token invalid:`,
      data.tokenProperties?.invalidReason,
    );
    return { success: false, score: 0 };
  }

  if (data.tokenProperties.action !== expectedAction) {
    console.warn(
      `[${logPrefix}] reCAPTCHA action mismatch: expected "${expectedAction}", got "${data.tokenProperties.action}"`,
    );
    return { success: false, score: 0 };
  }

  const score = data.riskAnalysis?.score ?? 0;
  return { success: score >= RECAPTCHA_MIN_SCORE, score };
}
