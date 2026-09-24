"use client";

import { Icon } from "./Icon";
import { THEME_KEY } from "@/lib/site";

// Tells every embedded viewer on the page to follow the site's theme.
export function syncViewers() {
  const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  for (const frame of document.querySelectorAll<HTMLIFrameElement>("iframe[data-viewer]"))
    frame.contentWindow?.postMessage({ type: "pageindex-theme", theme }, location.origin);
}

export function ThemeToggle({ label }: { label: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const dark = root.dataset.theme !== "dark";
    if (dark) root.dataset.theme = "dark";
    else delete root.dataset.theme;
    try {
      localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch {}
    syncViewers();
  };
  return (
    <button type="button" className="icon-button theme-toggle" onClick={toggle} aria-label={label} title={label}>
      <Icon name="sun" className="sun" />
      <Icon name="moon" className="moon" />
    </button>
  );
}
