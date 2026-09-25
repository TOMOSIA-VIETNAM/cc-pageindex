"use client";

import { useEffect, useRef, useState } from "react";
import { syncViewers } from "./ThemeToggle";

// The viewer page `pi.py html` writes, shown in embedded mode: board and search bar only,
// plain scrolling left to this page.
//
// Drawing the board is the heaviest work on the page, so the frame only gets its page once it
// is about to scroll into view. The browser's own loading="lazy" starts far too early for
// that (over a thousand pixels ahead), and on a phone it then competes with the hero.
// The theme is sent on load, and again on mount in case the frame loaded first.
const AHEAD = "300px";

export function GraphFrame({ src, title }: { src: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setNear(true); observer.disconnect(); }
    }, { rootMargin: `${AHEAD} 0px` });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(syncViewers, [near]);
  return (
    <iframe ref={frame} data-viewer src={near ? `${src}?embed` : undefined} title={title}
            className="graph-frame" onLoad={syncViewers} />
  );
}
