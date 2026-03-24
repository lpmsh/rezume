import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  trustedOrigins: ["https://rezume.so", "https://www.rezume.so"],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    crossSubDomainCookies: {
      enabled: isProduction,
      domain: ".rezume.so",
    },
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
