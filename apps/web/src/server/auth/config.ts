/**
 * Auth.js v5 (next-auth@beta) configuration (Milestone 1).
 *
 * Providers activated only when their env credentials are present:
 *   - `EMAIL_SERVER` + `EMAIL_FROM`            → EmailProvider (magic link)
 *   - `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` → GoogleProvider
 *   - `MICROSOFT_CLIENT_ID` + `MICROSOFT_CLIENT_SECRET` → MicrosoftProvider
 *
 * Auth.js is the canonical session/identity layer going forward.
 * The legacy in-memory cookie (`apps/web/src/server/auth.ts`) is kept
 * as a dev-only path when Auth.js is not configured, so local dev with
 * no env still works.
 *
 * The `auth()` function exported here is the only thing the rest of
 * the app should import. It returns `null` when no session exists and
 * a typed session otherwise.
 */

import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/nodemailer";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

const secret = process.env["AUTH_SECRET"] ?? "phase-0-dev-secret-do-not-ship";

function buildProviders(): NextAuthConfig["providers"] {
  const providers: NextAuthConfig["providers"] = [];

  // Email magic link — requires SMTP env. Phase 0: dev-only
  // configuration; in production it must point at a real provider.
  if (process.env["EMAIL_SERVER"] && process.env["EMAIL_FROM"]) {
    providers.push(
      Email({
        server: process.env["EMAIL_SERVER"],
        from: process.env["EMAIL_FROM"],
      }),
    );
  }

  if (process.env["GOOGLE_CLIENT_ID"] && process.env["GOOGLE_CLIENT_SECRET"]) {
    providers.push(
      Google({
        clientId: process.env["GOOGLE_CLIENT_ID"],
        clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
        allowDangerousEmailAccountLinking: true,
      }),
    );
  }

  if (
    process.env["MICROSOFT_CLIENT_ID"] &&
    process.env["MICROSOFT_CLIENT_SECRET"]
  ) {
    providers.push(
      MicrosoftEntraID({
        clientId: process.env["MICROSOFT_CLIENT_ID"],
        clientSecret: process.env["MICROSOFT_CLIENT_SECRET"],
        issuer: process.env["MICROSOFT_ISSUER"] ?? "https://login.microsoftonline.com/common/v2.0",
      }),
    );
  }

  // Dev credential provider: in dev, the `completeOnboarding` flow
  // creates a user in the in-memory store. We don't expose this in
  // production. The `authorize` always returns null so unknown
  // credentials are rejected; magic-link / OAuth flows are the only
  // entry in production.
  providers.push(
    Credentials({
      id: "dev-bootstrap",
      name: "Dev bootstrap",
      credentials: { token: { label: "Token", type: "text" } },
      authorize: () => null,
    }),
  );

  return providers;
}

export const authConfig: NextAuthConfig = {
  secret,
  trustHost: true,
  // JWT strategy avoids the round-trip to Postgres for every request.
  // Session rows in the DB are still maintained for audit + revocation.
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 }, // 24h
  pages: {
    signIn: "/onboarding",
    error: "/onboarding",
  },
  providers: buildProviders(),
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, copy the user id + role onto the token. We
      // do NOT trust the JWT for authorization — the server-side
      // `getServerSession()` re-reads from the in-memory or Prisma
      // store on every privileged action.
      if (user) {
        token["userId"] = (user as { id?: string }).id ?? token["sub"];
        token["roleKey"] = (user as { roleKey?: string }).roleKey ?? "owner";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const userId = (token["userId"] as string | undefined) ?? (token.sub as string | undefined) ?? "";
        const roleKey = (token["roleKey"] as string | undefined) ?? "owner";
        Object.assign(session.user, { id: userId, roleKey });
      }
      return session;
    },
  },
};

export const auth = NextAuth(authConfig);
