import type { UID } from "@strapi/strapi";
import type services from "../services";

export const extractContentTypeName = (uid: UID.ContentType) =>
  uid.split(".")[1];

/**
 * A helper function to obtain a plugin service.
 * @param {string} name The name of the service.
 *
 * @return {any} service.
 */
type Services = typeof services;
export const getPluginService = <ServiceName extends keyof Services>(
  name: ServiceName,
) => {
  const service = strapi.service(`plugin::better-auth.${name}`);
  return service as ReturnType<Services[ServiceName]>;
};

export const communityContentTypes: UID.ContentType[] = [
  "api::package.package",
  "api::template.template",
];
