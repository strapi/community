import { type NextRequest, NextResponse } from "next/server";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const RECAPTCHA_PROJECT_ID = process.env.RECAPTCHA_PROJECT_ID;
const RECAPTCHA_API_KEY = process.env.RECAPTCHA_API_KEY;
const RECAPTCHA_MIN_SCORE = 0.5;

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? "http://localhost:1337";
const CMS_BEARER_TOKEN = process.env.CMS_BEARER_TOKEN;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface EnterpriseAssessment {
  tokenProperties?: { valid: boolean; action?: string; invalidReason?: string };
  riskAnalysis?: { score: number; reasons?: string[] };
}

async function verifyRecaptcha(
  token: string,
  expectedAction: string,
): Promise<{ success: boolean; score: number }> {
  if (!RECAPTCHA_SITE_KEY || !RECAPTCHA_PROJECT_ID || !RECAPTCHA_API_KEY) {
    console.warn(
      "[submit-template] reCAPTCHA Enterprise not configured — skipping verification.",
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
      "[submit-template] reCAPTCHA token invalid:",
      data.tokenProperties?.invalidReason,
    );
    return { success: false, score: 0 };
  }

  if (data.tokenProperties.action !== expectedAction) {
    console.warn(
      `[submit-template] reCAPTCHA action mismatch: expected "${expectedAction}", got "${data.tokenProperties.action}"`,
    );
    return { success: false, score: 0 };
  }

  const score = data.riskAnalysis?.score ?? 0;
  return { success: score >= RECAPTCHA_MIN_SCORE, score };
}

function str(value: FormDataEntryValue | null): string | null {
  if (!value || typeof value !== "string") return null;
  const t = value.trim();
  return t.length > 0 ? t : null;
}

async function uploadLogoToStrapi(file: File): Promise<string | null> {
  const form = new FormData();
  form.append("files", file, file.name);

  try {
    const res = await fetch(`${CMS_URL}/api/upload`, {
      method: "POST",
      headers: CMS_BEARER_TOKEN ? { Authorization: `Bearer ${CMS_BEARER_TOKEN}` } : {},
      body: form,
    });

    if (!res.ok) {
      console.error(`[submit-template] Logo upload failed: ${res.status}`);
      return null;
    }

    const data = (await res.json()) as Array<{ documentId: string }>;
    return data[0]?.documentId ?? null;
  } catch (err) {
    console.error("[submit-template] Logo upload error:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// POST /api/submit-template
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  // --- reCAPTCHA Enterprise (skipped when env vars not configured) ---
  if (RECAPTCHA_SITE_KEY && RECAPTCHA_PROJECT_ID && RECAPTCHA_API_KEY) {
    const token = str(formData.get("recaptcha_token"));
    if (!token) {
      return NextResponse.json(
        { error: "Missing reCAPTCHA token." },
        { status: 400 },
      );
    }
    try {
      const { success } = await verifyRecaptcha(token, "submit_template");
      if (!success) {
        return NextResponse.json(
          { error: "reCAPTCHA verification failed. Please try again." },
          { status: 400 },
        );
      }
    } catch (err) {
      console.error("[submit-template] reCAPTCHA error:", err);
      return NextResponse.json(
        { error: "reCAPTCHA service unavailable. Please try again later." },
        { status: 503 },
      );
    }
  }

  // --- Extract + validate fields ---
  const template_name = str(formData.get("template_name"));
  const description = str(formData.get("description"));
  const repository_url = str(formData.get("repository_url"));
  const demo_url = str(formData.get("demo_url"));
  const owner_name = str(formData.get("owner_name"));
  const owner_email = str(formData.get("owner_email"));
  const agreed = formData.get("submitter_agreed_to_terms") === "true";

  const errors: string[] = [];
  if (!template_name) errors.push("Template name is required.");
  if (!description) errors.push("Description is required.");
  if (!repository_url) errors.push("Repository URL is required.");
  else if (!/^https?:\/\//i.test(repository_url))
    errors.push("Repository URL must be a valid https:// URL.");
  if (demo_url && !/^https?:\/\//i.test(demo_url))
    errors.push("Demo URL must be a valid https:// URL.");
  if (!owner_name) errors.push("Owner name is required.");
  if (!owner_email) errors.push("Contact email is required.");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner_email))
    errors.push("Contact email is not valid.");
  if (!agreed) errors.push("You must agree to the terms.");

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  // --- Logo upload ---
  let logoDocumentId: string | null = null;
  const logoFile = formData.get("logo_file");
  if (logoFile instanceof File && logoFile.size > 0) {
    if (
      ![
        "image/png",
        "image/jpeg",
        "image/svg+xml",
        "image/webp",
        "image/gif",
      ].includes(logoFile.type)
    ) {
      return NextResponse.json(
        { error: "Logo must be a PNG, JPEG, SVG, or WebP image." },
        { status: 422 },
      );
    }
    if (logoFile.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Logo file must be smaller than 2 MB." },
        { status: 422 },
      );
    }
    logoDocumentId = await uploadLogoToStrapi(logoFile);
    if (!logoDocumentId) {
      console.warn(
        "[submit-template] Logo upload failed — submission will proceed without logo.",
      );
    }
  }

  // --- Parse categories ---
  let categories_list: string[] = [];
  try {
    const raw = formData.get("categories_list");
    if (typeof raw === "string" && raw) {
      categories_list = JSON.parse(raw);
    }
  } catch {
    categories_list = [];
  }

  // --- Build submission payload ---
  const payload = {
    template_name,
    description,
    repository_url,
    demo_url,
    categories_list,
    owner_name,
    owner_email,
    maintainers_list: [],
    submission_notes: str(formData.get("submission_notes")),
    submitter_agreed_to_terms: true,
    logo_documentId: logoDocumentId ?? null,
  };

  // --- Proxy to Strapi ---
  if (!CMS_BEARER_TOKEN) {
    console.warn(
      "[submit-template] CMS_BEARER_TOKEN not set — Strapi may reject the request.",
    );
  }

  let strapiRes: Response;
  try {
    strapiRes = await fetch(`${CMS_URL}/api/moderation/templates/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(CMS_BEARER_TOKEN
          ? { Authorization: `Bearer ${CMS_BEARER_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({ data: payload }),
    });
  } catch (err) {
    console.error("[submit-template] Could not reach Strapi:", err);
    return NextResponse.json(
      {
        error:
          "Could not submit your template at this time. Please try again later.",
      },
      { status: 503 },
    );
  }

  if (!strapiRes.ok) {
    const body = await strapiRes.text();
    console.error(`[submit-template] Strapi ${strapiRes.status}: ${body}`);
    return NextResponse.json(
      { error: "Submission failed. Please try again." },
      { status: 500 },
    );
  }

  const result = (await strapiRes.json()) as { data: { documentId: string } };
  return NextResponse.json(
    { success: true, submissionId: result.data?.documentId },
    { status: 201 },
  );
}
