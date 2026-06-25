import { type NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import {
  isRecaptchaConfigured,
  verifyRecaptcha,
} from "@/features/submit/server/recaptcha";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_LOGO_SIZE,
  parseCategories,
  str,
  submitToStrapi,
  uploadImageToStrapi,
} from "@/features/submit/server/strapi";

const LOG = "submit-showcase";

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  if (isRecaptchaConfigured()) {
    const token = str(formData.get("recaptcha_token"));
    if (!token) {
      return NextResponse.json(
        { error: "Missing reCAPTCHA token." },
        { status: 400 },
      );
    }
    try {
      const { success } = await verifyRecaptcha(token, "submit_showcase", LOG);
      if (!success) {
        return NextResponse.json(
          { error: "reCAPTCHA verification failed. Please try again." },
          { status: 400 },
        );
      }
    } catch (err) {
      console.error(`[${LOG}] reCAPTCHA error:`, err);
      return NextResponse.json(
        { error: "reCAPTCHA service unavailable. Please try again later." },
        { status: 503 },
      );
    }
  }

  const showcase_name = str(formData.get("showcase_name"));
  const showcase_url = str(formData.get("url"));
  const description = str(formData.get("description"));
  const owner_name = str(formData.get("owner_name"));
  const owner_email = str(formData.get("owner_email"));
  const agreed = formData.get("submitter_agreed_to_terms") === "true";

  const errors: string[] = [];
  if (!showcase_name) errors.push("Showcase name is required.");
  if (!showcase_url) errors.push("Live URL is required.");
  else if (!/^https?:\/\//i.test(showcase_url))
    errors.push("Live URL must be a valid https:// URL.");
  if (!description) errors.push("Description is required.");
  if (!owner_name) errors.push("Owner name is required.");
  if (!owner_email) errors.push("Contact email is required.");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner_email))
    errors.push("Contact email is not valid.");
  if (!agreed) errors.push("You must agree to the terms.");
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 422 });

  let imageDocumentId: string | null = null;
  const logoFile = formData.get("logo_file");
  if (logoFile instanceof File && logoFile.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(logoFile.type)) {
      return NextResponse.json(
        { error: "Screenshot must be a PNG, JPEG, SVG, or WebP image." },
        { status: 422 },
      );
    }
    if (logoFile.size > MAX_LOGO_SIZE) {
      return NextResponse.json(
        { error: "Screenshot file must be smaller than 2 MB." },
        { status: 422 },
      );
    }
    imageDocumentId = await uploadImageToStrapi(logoFile, LOG);
    if (!imageDocumentId) {
      console.warn(
        `[${LOG}] Image upload failed — submission will proceed without screenshot.`,
      );
    }
  }

  const payload = {
    title: showcase_name,
    slug: slugify(showcase_name!),
    url: showcase_url,
    description,
    categories_list: parseCategories(formData.get("categories_list")),
    owner_name,
    owner_email,
    submission_notes: str(formData.get("submission_notes")),
    submitter_agreed_to_terms: true,
    image: imageDocumentId ? { documentId: imageDocumentId } : null,
  };

  try {
    const { submissionId } = await submitToStrapi(
      "/api/moderation/showcases/submit",
      payload,
      LOG,
    );
    return NextResponse.json({ success: true, submissionId }, { status: 201 });
  } catch (err) {
    if ((err as Error).message === "strapi_error") {
      return NextResponse.json(
        { error: "Submission failed. Please try again." },
        { status: 500 },
      );
    }
    console.error(`[${LOG}] Could not reach Strapi:`, err);
    return NextResponse.json(
      {
        error:
          "Could not submit your showcase at this time. Please try again later.",
      },
      { status: 503 },
    );
  }
}
