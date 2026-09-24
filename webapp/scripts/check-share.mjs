// Checks that every language unfurls into its own share card: the page names a card, the
// card answers, it is the size the page declares, and it has alt text, for Open Graph and X.
//   node scripts/check-share.mjs [base URL]   (default: the production site)
const BASE = (process.argv[2] ?? "https://pagindex.vercel.app").replace(/\/$/, "");
const PAGES = ["/", "/vi", "/ja"];
let failures = 0;
const check = (ok, message) => { if (!ok) { failures++; console.error(`✗ ${message}`); } };

const meta = (html, attr, name) => {
  const tag = html.match(new RegExp(`<meta[^>]*${attr}="${name}"[^>]*>`));
  return tag?.[0].match(/content="([^"]*)"/)?.[1]?.replace(/&amp;/g, "&");
};

for (const path of PAGES) {
  const html = await (await fetch(BASE + path)).text();
  for (const [attr, prefix] of [["property", "og:image"], ["name", "twitter:image"]]) {
    const url = meta(html, attr, prefix);
    check(Boolean(url), `${path}: no ${prefix}`);
    if (!url) continue;
    const response = await fetch(url.replace(/^https?:\/\/[^/]+/, BASE));
    check(response.ok, `${path}: ${prefix} ${url} answers ${response.status}`);
    const png = Buffer.from(await response.arrayBuffer());
    const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    const declared = [meta(html, attr, `${prefix}:width`), meta(html, attr, `${prefix}:height`)];
    check(String(width) === declared[0] && String(height) === declared[1],
          `${path}: ${prefix} is ${width}x${height}, the page declares ${declared.join("x")}`);
    check(Boolean(meta(html, attr, `${prefix}:alt`)), `${path}: ${prefix} has no alt text`);
    console.log(`${failures ? "…" : "✓"} ${path} ${prefix} ${width}x${height}`);
  }
}
if (failures) { console.error(`${failures} problem(s)`); process.exit(1); }
console.log("every language unfurls into its own card");
