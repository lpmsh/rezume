/**
 * Shared SEO foundation. Import from "@/lib/seo".
 *
 *   import { buildMetadata, JsonLd, organizationSchema } from "@/lib/seo";
 */
export * from "./config";
export * from "./metadata";
export * from "./json-ld";
export * from "./sitemap";
export { ogTemplate, ogImageResponse, OG_SIZE } from "./og";
export type { OgTemplateOptions } from "./og";
