import { ImageResponse } from "next/og";
import { dictionaries, fill, isLocale } from "@/i18n";
import { demoStats, exampleReads } from "@/lib/demo";
import { BRAND, SITE_URL } from "@/lib/site";

// The card social networks show when a page is shared: the wordmark, the page's own
// headline in its language, and the sample book's numbers from document to answer.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const alt = isLocale(lang) ? dictionaries[lang].social.alt : BRAND;
  return [{ id: "card", alt, size, contentType }];
}

// The same palette as the site in its light theme.
const ink = "#1c1b19", muted = "#6d6a64", accent = "#5b45e0", bg = "#f7f6f2", line = "#d6d3cb";

// Satori, which draws the card, needs the font files themselves, and only the glyphs the
// card uses: Google Fonts serves exactly that subset when asked with `text=`.
async function font(family: string, weight: number, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!src) throw new Error(`No font file for ${family} ${weight}`);
  return (await fetch(src[1])).arrayBuffer();
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = dictionaries[isLocale(lang) ? lang : "en"];
  const stats = demoStats();
  const reads = exampleReads(stats);
  const host = new URL(SITE_URL).host;
  const steps = [
    fill(t.hero.flowPages, { pages: stats.pages }),
    fill(t.hero.flowSections, { sections: stats.sections }),
    fill(t.social.read, { pages: reads.pages }),
  ];
  const headlineFamily = lang === "ja" ? "IBM Plex Sans JP" : "IBM Plex Sans";
  // the steps are in the page's language, so they share the headline's font, which has its glyphs
  const text = [t.hero.title, t.hero.eyebrow, ...steps, "→"].join("");
  const monoText = [BRAND, host].join("");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: bg,
                    backgroundImage: `radial-gradient(circle, ${line} 1.6px, transparent 1.8px)`, backgroundSize: "30px 30px",
                    padding: "64px 72px", fontFamily: "Headline", color: ink, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill={ink} />
            <circle cx="13" cy="13" r="6" fill="none" stroke="#a892ff" strokeWidth="3" />
            <circle cx="23" cy="22" r="3.2" fill="#a892ff" />
          </svg>
          <span style={{ fontFamily: "Mono", fontSize: 34, fontWeight: 600 }}>{BRAND}</span>
        </div>

        {/* the tree with one path lit, as the site and the viewer draw it */}
        <svg width="300" height="330" viewBox="0 0 300 330" style={{ position: "absolute", right: 64, top: 120 }}>
          {[[30, 165, 130, 60], [30, 165, 130, 165], [130, 60, 250, 30], [130, 60, 250, 95], [130, 165, 250, 140],
            [130, 270, 250, 250], [130, 270, 250, 305]].map(([x1, y1, x2, y2]) => (
            <path key={`${x1}${y1}${x2}${y2}`} d={`M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`}
                  fill="none" stroke={line} strokeWidth="3" />
          ))}
          {[[30, 165, 130, 270], [130, 270, 250, 205]].map(([x1, y1, x2, y2]) => (
            <path key={`lit${x1}${y1}`} d={`M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`}
                  fill="none" stroke={accent} strokeWidth="4" strokeDasharray="10 8" />
          ))}
          {[[130, 60], [130, 165], [250, 30], [250, 95], [250, 140], [250, 250], [250, 305]].map(([cx, cy]) => (
            <circle key={`n${cx}${cy}`} cx={cx} cy={cy} r="10" fill={bg} stroke={ink} strokeWidth="3" />
          ))}
          {[[30, 165], [130, 270], [250, 205]].map(([cx, cy]) => (
            <circle key={`l${cx}${cy}`} cx={cx} cy={cy} r="11" fill="#ebe7ff" stroke={accent} strokeWidth="4" />
          ))}
        </svg>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 52, maxWidth: 740 }}>
          <span style={{ fontSize: 26, color: accent, fontWeight: 600 }}>{t.hero.eyebrow}</span>
          <span style={{ fontSize: lang === "ja" ? 58 : 62, fontWeight: 700, lineHeight: 1.12, marginTop: 18, letterSpacing: "-0.02em", textWrap: "balance" }}>
            {t.hero.title}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: "auto", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, fontWeight: 600 }}>
            {steps.map((step, index) => (
              <div key={step} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {index > 0 && <span style={{ color: accent }}>→</span>}
                <span style={{ padding: "10px 18px", borderRadius: 12, border: `2px solid ${index === steps.length - 1 ? accent : line}`,
                               background: index === steps.length - 1 ? "#ebe7ff" : "#ffffff",
                               color: index === steps.length - 1 ? accent : ink }}>{step}</span>
              </div>
            ))}
          </div>
          <span style={{ fontFamily: "Mono", fontSize: 24, color: muted }}>{host}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Headline", data: await font(headlineFamily, 600, text), weight: 600, style: "normal" },
        { name: "Headline", data: await font(headlineFamily, 700, text), weight: 700, style: "normal" },
        { name: "Mono", data: await font("IBM Plex Mono", 600, monoText), weight: 600, style: "normal" },
      ],
    },
  );
}
