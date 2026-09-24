"use client";

import { useEffect } from "react";
import { syncViewers } from "./ThemeToggle";

// The viewer page `pi.py html` writes, shown in embedded mode: board and search bar only,
// plain scrolling left to this page. The theme is sent both on mount and on load, since the
// frame can finish loading before this page hydrates and its load event is then missed.
export function GraphFrame({ src, title }: { src: string; title: string }) {
  useEffect(syncViewers, []);
  // lazy: on a phone the board sits below the first screen, and drawing it is the heaviest work on the page
  return <iframe data-viewer src={`${src}?embed`} title={title} className="graph-frame" loading="lazy" onLoad={syncViewers} />;
}
