import type { NextConfig } from "next";
import { defaultLocale } from "./src/i18n";

// English is served at the root, without a redirect: "/" is rewritten to the English page,
// and "/en" itself is sent back to "/" so the English page has one address. The other
// languages keep their prefix ("/vi", "/ja"). Redirects run before rewrites and not again
// after them, which is what keeps the two from chasing each other.
const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: `/${defaultLocale}`, destination: "/", permanent: true }];
  },
  async headers() {
    // icons and share cards change only with the site, so caches may keep them a day and serve
    // a stale copy for a week while revalidating; every page gets the usual hardening headers
    const cached = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];
    return [
      { source: "/icon/:file*", headers: cached },
      { source: "/:lang/opengraph-image/:id*", headers: cached },
      { source: "/:lang/twitter-image/:id*", headers: cached },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: `/${defaultLocale}` }], afterFiles: [], fallback: [] };
  },
};

export default nextConfig;
