import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_JP } from "next/font/google";
import { dictionaries, isLocale, locales, pathFor, type Locale } from "@/i18n";
import { BRAND, LICENSE_URL, ORGANIZATION, REPO_URL, SITE_URL, THEME_KEY } from "@/lib/site";
import { dark, light } from "@/lib/tokens";
import "../globals.css";

const sans = IBM_Plex_Sans({ subsets: ["latin", "latin-ext", "vietnamese"], weight: ["400", "500", "600", "700"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin", "latin-ext", "vietnamese"], weight: ["400", "500", "600"], variable: "--font-mono" });
const japanese = IBM_Plex_Sans_JP({ weight: ["400", "500", "600", "700"], variable: "--font-jp", preload: false });

export function generateStaticParams() {
  return locales.map(lang => ({ lang }));
}

// Open Graph names a locale by language and region.
const ogLocale: Record<Locale, string> = { en: "en_US", vi: "vi_VN", ja: "ja_JP" };

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { meta } = dictionaries[lang];
  return {
    metadataBase: new URL(SITE_URL),
    title: meta.title,
    description: meta.description,
    applicationName: BRAND,
    authors: [ORGANIZATION],
    publisher: ORGANIZATION.name,
    icons: {
      icon: [{ url: "/icon/favicon.svg", type: "image/svg+xml" }, { url: "/icon/icon-48.png", sizes: "48x48", type: "image/png" }],
      apple: { url: "/icon/apple-touch-icon.png", sizes: "180x180" },
    },
    keywords: ["Claude Code", "Claude Code skill", "PageIndex", "vectorless RAG", "document QA", "PDF", "table of contents", "no API key"],
    alternates: {
      canonical: pathFor(lang),
      languages: { ...Object.fromEntries(locales.map(locale => [locale, pathFor(locale)])), "x-default": "/" },
    },
    openGraph: {
      title: meta.title, description: meta.description, url: pathFor(lang), siteName: BRAND, type: "website",
      locale: ogLocale[lang], alternateLocale: locales.filter(locale => locale !== lang).map(locale => ogLocale[locale]),
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: light.bg },
    { media: "(prefers-color-scheme: dark)", color: dark.bg },
  ],
};

// Before first paint: the theme (light unless the visitor chose dark before, so dark never
// flashes light), and `motion` on <html> unless reduced motion is asked for, which holds the
// scroll-in elements back until components/Motion.tsx plays them.
const themeScript = `try{if(localStorage.getItem(${JSON.stringify(THEME_KEY)})==="dark")document.documentElement.dataset.theme="dark"}catch(e){}` +
  `if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("motion")`;

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang} className={`${sans.variable} ${mono.variable} ${japanese.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData(lang) }} />
        {children}
      </body>
    </html>
  );
}

// Tells search engines what the page is about: a free developer tool, in this language.
function structuredData(lang: Locale) {
  const { meta } = dictionaries[lang];
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: BRAND,
    description: meta.description,
    url: new URL(pathFor(lang), SITE_URL).href,
    inLanguage: lang,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "macOS, Linux, Windows",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    codeRepository: REPO_URL,
    license: LICENSE_URL,
    author: { "@type": "Organization", ...ORGANIZATION },
    publisher: { "@type": "Organization", ...ORGANIZATION },
    image: `${SITE_URL}/${lang}/opengraph-image/card`,
  }).replace(/</g, "\\u003c");
}
