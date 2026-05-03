import {
  generatePassword,
  getGithubOwnerAvatarUrl,
  uploadFromUrl,
} from "./utils";

export const findOrCreateAuthor = async (email, name, githubUrl, createdAt) => {
  let author = await strapi.documents("plugin::better-auth.user").findFirst({
    fields: ["id"],
    filters: {
      email: email?.toLowerCase(),
    },
  });
  if (!author) {
    const profilePic = getGithubOwnerAvatarUrl(githubUrl);
    const uploadedAvatar = profilePic
      ? await uploadFromUrl(profilePic.url, profilePic.name)
      : null;
    await strapi["internal_config"]["better-auth"].api.signUpEmail({
      body: {
        name: name,
        email: email?.toLowerCase(),
        password: generatePassword(),
        image: uploadedAvatar?.formats?.small?.url || uploadedAvatar?.url,
      },
    });
    author = await strapi.documents("plugin::better-auth.user").findFirst({
      fields: ["id"],
      filters: {
        email: email?.toLowerCase(),
      },
    });
    await strapi.documents("plugin::better-auth.user").update({
      documentId: author.documentId,
      data: {
        createdAt: createdAt,
      },
    });
  }
  return {
    author,
    type: "plugin::better-auth.user",
  };
};
