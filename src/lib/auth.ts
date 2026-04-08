import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "127.0.0.1:3000",
      "rezume.so",
      "www.rezume.so",
      "*.vercel.app",
    ],
    fallback: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
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
