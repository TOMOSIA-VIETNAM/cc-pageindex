import type { MetadataRoute } from "next";
import { dictionaries, defaultLocale } from "@/i18n";
import { BRAND } from "@/lib/site";
import { light } from "@/lib/tokens";

// The install manifest, from the same name, description and colour the page uses;
// the icons are rendered by scripts/build-icons.mjs.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND,
    short_name: BRAND,
    description: dictionaries[defaultLocale].meta.description,
    start_url: "/",
    display: "browser",
    background_color: light.bg,
    theme_color: light.bg,
    icons: [
      { src: "/icon/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
