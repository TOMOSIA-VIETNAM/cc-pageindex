// Renders the PNG icons browsers and home screens ask for from the one brand mark,
// public/icon/favicon.svg, so the mark is drawn in one place only. Runs before every
// dev and build; the PNGs are not committed.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const dir = resolve(dirname(fileURLToPath(import.meta.url)), "../public/icon");
const mark = readFileSync(resolve(dir, "favicon.svg"));
const sizes = { "icon-48.png": 48, "apple-touch-icon.png": 180, "icon-192.png": 192, "icon-512.png": 512 };

for (const [name, size] of Object.entries(sizes)) {
  await sharp(mark, { density: Math.ceil((size / 32) * 72) }).resize(size, size).png().toFile(resolve(dir, name));
}
console.log(`icons: ${Object.keys(sizes).join(", ")}`);
