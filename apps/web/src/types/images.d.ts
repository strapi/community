/** biome-ignore-all lint/style/noDefaultExport: Doesn't apply here */

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}
