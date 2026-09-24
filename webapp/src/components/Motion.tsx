"use client";

import { useEffect } from "react";

// Plays the page in as it scrolls into view:
//   [data-reveal]    rises and fades in; `--i` on the element staggers siblings.
//                    `data-reveal="load"` plays from CSS at first paint instead, for what
//                    is on screen before this script has loaded (the hero)
//   [data-count]     counts up from 0 to its value, siblings starting one after another by `--i`
//   [data-progress]  fills from 0 to the width in its `--w`
// The server renders every final state. Only <html class="motion">, set before first
// paint unless the visitor asked for reduced motion, holds them back until they play,
// so without script, or with reduced motion, nothing waits.

const COUNT_MS = 1400;
const COUNT_STAGGER_MS = 120;

function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count);
  const delay = Number(getComputedStyle(el).getPropertyValue("--i") || 0) * COUNT_STAGGER_MS;
  const start = performance.now() + delay;
  const step = (now: number) => {
    if (now < start) { requestAnimationFrame(step); return; }
    const t = Math.min(1, (now - start) / COUNT_MS);
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function Motion() {
  useEffect(() => {
    if (!document.documentElement.classList.contains("motion")) return;
    const targets = document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal="load"]), [data-count], [data-progress]');
    for (const el of targets) if (el.dataset.count !== undefined) el.textContent = "0";
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add("is-in");
        if (el.dataset.count !== undefined) countUp(el);
        observer.unobserve(el);
      }
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return null;
}
