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
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: `/${defaultLocale}` }], afterFiles: [], fallback: [] };
  },
};

export default nextConfig;
