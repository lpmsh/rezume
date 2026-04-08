import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";

const fallbackAuthUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const extraTrustedOrigins =
  process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];
const crossSubdomainCookieDomain =
  process.env.BETTER_AUTH_COOKIE_DOMAIN?.trim() || undefined;
const enableCrossSubdomainCookies =
  !!crossSubdomainCookieDomain && process.env.VERCEL_ENV !== "preview";

export const auth = betterAuth({
  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "127.0.0.1:3000",
      "rezume.so",
      "www.rezume.so",
      "*.vercel.app",
    ],
    fallback: fallbackAuthUrl,
  },
  trustedOrigins:
    extraTrustedOrigins.length > 0 ? extraTrustedOrigins : undefined,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    crossSubDomainCookies: enableCrossSubdomainCookies
      ? {
          enabled: true,
          domain: crossSubdomainCookieDomain,
        }
      : undefined,
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  plugins: [nextCookies()],
});
