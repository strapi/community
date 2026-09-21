import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  pixelBasedPreset,
  Section,
  Tailwind,
  Text,
} from "react-email";

/**
 * Mirrors `@better-auth-ui/react/email`'s `EmailStyles` component so this
 * template matches the built-in Better Auth emails exactly. Not imported
 * from that package directly: it's ESM-only (no `require` export condition),
 * and this file is compiled to CommonJS like the rest of the CMS.
 */
function EmailStyles() {
  return (
    <style type="text/css">{`
      .bg-background { background-color: #F5F5F5 !important; }
      .bg-card { background-color: #FFFFFF !important; }
      .bg-primary { background-color: #171717 !important; }
      .border-border { border-color: #E5E5E5 !important; }
      .text-card-foreground { color: #0A0A0A !important; }
      .text-muted-foreground { color: #737373 !important; }
      .text-primary { color: #171717 !important; }
      .text-primary-foreground { color: #FAFAFA !important; }
      .logo-dark { display: none !important; }
      .logo-light { display: block !important; }

      @media (prefers-color-scheme: dark) {
        .bg-background { background-color: #0A0A0A !important; }
        .bg-card { background-color: #171717 !important; }
        .bg-primary { background-color: #E5E5E5 !important; }
        .border-border { border-color: #2E2E2E !important; }
        .text-card-foreground { color: #FAFAFA !important; }
        .text-muted-foreground { color: #A1A1A1 !important; }
        .text-primary { color: #E5E5E5 !important; }
        .text-primary-foreground { color: #171717 !important; }
        .logo-dark { display: block !important; }
        .logo-light { display: none !important; }
        * { box-shadow: none !important; }
      }
    `}</style>
  );
}

export interface AccountAccessEmailProps {
  /** URL of the magic-link request page (`/auth/magic-link`) */
  url: string;
  /** Email address the account was created with */
  email: string;
  /** Name of the application sending the email */
  appName?: string;
  /** Logo URL(s) - a single string or light/dark variants */
  logoURL?: string | { light: string; dark: string };
}

/**
 * One-off notice for existing Better Auth users whose account was created
 * automatically by a past submission, before account access was possible.
 * Not part of a built-in Better Auth flow, so it isn't wired into any
 * `betterAuth({...})` hook in `./auth.ts` - it's sent manually/in bulk via
 * `sendAccountAccessEmail` (see `./email.ts`).
 */
export function AccountAccessEmail({
  url,
  email,
  appName,
  logoURL,
}: AccountAccessEmailProps) {
  return (
    <Html>
      <Head>
        <meta content="light dark" name="color-scheme" />
        <meta content="light dark" name="supported-color-schemes" />

        <EmailStyles />
      </Head>

      <Preview>You have an account on the Strapi Community Hub!</Preview>

      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className="bg-background font-sans">
          <Container className="mx-auto my-auto max-w-xl px-2 py-10">
            <Section className="bg-card text-card-foreground rounded-none border border-border p-8">
              {logoURL &&
                (typeof logoURL === "string" ? (
                  <Img
                    src={logoURL}
                    width={48}
                    height={48}
                    alt={appName || "Logo"}
                    className="mx-auto mb-8"
                  />
                ) : (
                  <>
                    <Img
                      src={logoURL.light}
                      width={48}
                      height={48}
                      alt={appName || "Logo"}
                      className="mx-auto mb-8 logo-light"
                    />
                    <Img
                      src={logoURL.dark}
                      width={48}
                      height={48}
                      alt={appName || "Logo"}
                      className="hidden mx-auto mb-8 logo-dark"
                    />
                  </>
                ))}

              <Heading className="m-0 mb-5 text-2xl font-semibold">
                Hey Strapi contributor!
              </Heading>

              <Text className="text-sm font-normal">
                Thank you for being an active Strapi community member and
                submitting your plugin(s) to the marketplace!
              </Text>

              <Text className="text-sm font-normal">
                We've created an account for you on the Community Hub using{" "}
                <Link
                  href={`mailto:${email}`}
                  className="text-primary font-semibold"
                >
                  {email}
                </Link>
                . From now on you can manage your profile, plugins and
                organizations all by yourself! Request a one-time login link
                below to sign in and refine your profile page.
              </Text>

              <Section className="my-6">
                <Button
                  href={url}
                  className="inline-block whitespace-nowrap rounded-none text-sm font-medium py-2.5 px-6 bg-primary text-primary-foreground no-underline"
                >
                  Request a login link
                </Button>
              </Section>

              <Text className="mb-3 text-xs text-muted-foreground">
                Or copy and paste this URL into your browser:
              </Text>

              <Link className="break-all text-xs text-primary" href={url}>
                {url}
              </Link>

              <Hr className="my-6 w-full border border-solid border-border" />

              {appName && (
                <Text className="mb-3 text-xs text-muted-foreground">
                  Email sent by {appName}.
                </Text>
              )}

              <Text className="mt-3 text-xs text-muted-foreground">
                If you don't recognize this account or didn't submit anything to{" "}
                {appName}, you can safely ignore this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default AccountAccessEmail;
