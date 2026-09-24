import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, locales, type Locale } from "@/i18n";

// A path without a language prefix goes to the visitor's preferred language, taken
// from Accept-Language, falling back to English.
function preferred(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map(part => {
      const [tag, q] = part.trim().split(";q=");
      return { base: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.map(entry => entry.base).find(isLocale) ?? defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (locales.some(locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))) return;
  request.nextUrl.pathname = `/${preferred(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // pages only: not Next's own files, not the embedded viewer, not anything with an extension
  matcher: ["/((?!_next|demo|.*\\..*).*)"],
};
