import type { MetadataRoute } from "next";
import { locales, pathFor } from "@/i18n";
import { SITE_URL } from "@/lib/site";

// One entry per language, each listing the others as its translations.
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (locale: (typeof locales)[number]) => new URL(pathFor(locale), SITE_URL).href;
  const languages = Object.fromEntries(locales.map(locale => [locale, url(locale)]));
  return locales.map(locale => ({
    url: url(locale),
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages },
  }));
}
