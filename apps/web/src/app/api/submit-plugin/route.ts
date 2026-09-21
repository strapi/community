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
  uploadImageToStrapi,
} from "@/features/submit/server/strapi";

const LOG = "submit-plugin";

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
      const { success } = await verifyRecaptcha(token, "submit_plugin", LOG);
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

  const plugin_name = str(formData.get("plugin_name"));
  const description = str(formData.get("description"));
  const repository_url = str(formData.get("repository_url"));
  const agreed = formData.get("submitter_agreed_to_terms") === "true";

  const errors: string[] = [];
  if (!plugin_name) errors.push("Plugin name is required.");
  if (!description) errors.push("Description is required.");
  else if (description.length > 100)
    errors.push("Description must be 100 characters or fewer.");
  if (!repository_url) errors.push("Repository URL is required.");
  else if (!/^https?:\/\//i.test(repository_url))
    errors.push("Repository URL must be a valid https:// URL.");
  if (!agreed) errors.push("You must agree to the terms.");
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 422 });

  let logoDocumentId: string | null = null;
  const logoFile = formData.get("logo_file");
  if (logoFile instanceof File && logoFile.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(logoFile.type)) {
      return NextResponse.json(
        { error: "Logo must be a PNG, JPEG, SVG, or WebP image." },
        { status: 422 },
      );
    }
    if (logoFile.size > MAX_LOGO_SIZE) {
      return NextResponse.json(
        { error: "Logo file must be smaller than 2 MB." },
        { status: 422 },
      );
    }
    logoDocumentId = await uploadImageToStrapi(logoFile, LOG);
    if (!logoDocumentId) {
      console.warn(
        `[${LOG}] Logo upload failed — submission will proceed without logo.`,
      );
    }
  }

  const payload = {
    name: plugin_name,
    slug: slugify(plugin_name!),
    description,
    git_repository: repository_url,
    package_location: str(formData.get("package_location")),
    type: str(formData.get("package_type")) || "plugin",
    categories_list: parseCategories(formData.get("categories_list")),
    readme: str(formData.get("readme")),
    submission_notes: str(formData.get("submission_notes")),
    submitter_agreed_to_terms: true,
    icon: logoDocumentId ? { documentId: logoDocumentId } : null,
  };

  // The actual creation happens client-side, straight against the CMS
  // (see features/submit/lib/create-submission.ts) so the owner can be
  // derived from the caller's own better-auth session — this route only
  // handles what needs server-side secrets (reCAPTCHA, image upload).
  return NextResponse.json({ success: true, payload }, { status: 200 });
}
