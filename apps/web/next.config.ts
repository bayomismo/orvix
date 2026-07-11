import type { NextConfig } from "next";

/**
 * next.config.ts — ORVIX web app.
 *
 * Phase 0 config: enable strict mode, optimize package imports for
 * workspace packages, and require src/ structure (see PRD §09 §2).
 */
const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: false,
  // Locks server-only modules out of the client bundle.
  serverExternalPackages: ["@orvix/db"],
  // Markdown / mdx: Phase 0 disables; Phase 1 enables.
  pageExtensions: ["ts", "tsx", "mdx"].filter((e) => e !== "mdx"),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default config;
