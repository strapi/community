import { Strategy as GoogleStrategy } from "passport-google-oauth2";

const verify = (request, accessToken, refreshToken, profile, done) => {
  if (profile && profile.email && profile.email.endsWith("@strapi.io")) {
    done(null, {
      email: profile.email,
      firstname: profile.given_name,
      lastname: profile.family_name,
    });
  } else {
    done(new Error("Forbidden email address"));
  }
};

export default ({ env }) => ({
  auth: {
    providers: [
      {
        uid: "google",
        displayName: "Google",
        icon: "https://cdn2.iconfinder.com/data/icons/social-icons-33/128/Google-512.png",
        createStrategy: (strapi) =>
          new GoogleStrategy(
            {
              clientID: env("GOOGLE_CLIENT_ID"),
              clientSecret: env("GOOGLE_CLIENT_SECRET"),
              scope: [
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
              ],
              callbackURL:
                env("CLOUD_APP_URL") +
                strapi.admin.services.passport.getStrategyCallbackURL("google"),
              passReqToCallback: true,
            },
            verify,
          ),
      },
    ],
  },
  flags: {
    nps: env.bool("FLAG_NPS", false),
    promoteEE: env.bool("FLAG_PROMOTE_EE", false),
  },
});
