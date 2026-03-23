const RESERVED_SLUGS = [
  "app",
  "home",
  "www",
  "api",
  "admin",
  "login",
  "signup",
  "register",
  "pricing",
  "blog",
  "help",
  "support",
  "about",
  "terms",
  "privacy",
  "contact",
  "dashboard",
  "upload",
  "settings",
  "setup",
  "account",
  "pro",
  "billing",
  "favicon",
  "robots",
  "sitemap",
] as const;

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export function normalizeSlug(input: string): string {
  return input.trim().toLowerCase();
}

export function validateSlugFormat(slug: string): {
  valid: boolean;
  reason?: string;
} {
  if (slug.length < 3 || slug.length > 30) {
    return { valid: false, reason: "Slug must be 3-30 characters" };
  }
  if (!SLUG_REGEX.test(slug)) {
    return {
      valid: false,
      reason:
        "Slug must be lowercase, alphanumeric with hyphens (no leading/trailing hyphens)",
    };
  }
  return { valid: true };
}

export function isReservedSlug(slug: string): boolean {
  return (RESERVED_SLUGS as readonly string[]).includes(slug);
}

export function validateSlug(input: string): {
  valid: boolean;
  slug: string;
  reason?: string;
} {
  const slug = normalizeSlug(input);
  const format = validateSlugFormat(slug);
  if (!format.valid) {
    return { valid: false, slug, reason: format.reason };
  }
  if (isReservedSlug(slug)) {
    return { valid: false, slug, reason: "This slug is reserved" };
  }
  return { valid: true, slug };
}
