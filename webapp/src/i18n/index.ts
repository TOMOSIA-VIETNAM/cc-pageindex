import en from "./en";
import vi from "./vi";
import ja from "./ja";

export const dictionaries = { en, vi, ja };
export type Locale = keyof typeof dictionaries;
export const locales = Object.keys(dictionaries) as Locale[];
export const defaultLocale: Locale = "en";

// How each language names itself in the switcher, and its BCP 47 tag for <html lang>.
export const localeNames: Record<Locale, string> = { en: "English", vi: "Tiếng Việt", ja: "日本語" };

export const isLocale = (value: string): value is Locale => value in dictionaries;

// Where each language lives: English at the root, the others under their own prefix.
// next.config.ts serves the root from the English page and sends /en back to the root.
export const pathFor = (locale: Locale) => (locale === defaultLocale ? "/" : `/${locale}`);

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (whole, key) => (key in values ? String(values[key]) : whole));
}
