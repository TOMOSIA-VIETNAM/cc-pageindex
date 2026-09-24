import type { MetadataRoute } from "next";
import { locales } from "@/i18n";
import { SITE_URL } from "@/lib/site";

// One entry per language, each listing the others as its translations.
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map(locale => [locale, `${SITE_URL}/${locale}`]));
  return locales.map(locale => ({
    url: `${SITE_URL}/${locale}`,
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages },
  }));
}
