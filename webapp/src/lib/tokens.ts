import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The site's colours as globals.css defines them, for the places CSS cannot reach: the
// share card, the browser's theme colour and the install manifest. Reading the stylesheet
// keeps globals.css the only place a colour is written down.

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function block(selector: string) {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`globals.css has no ${selector} block`);
  const body = css.slice(start, css.indexOf("}", start));
  const tokens: Record<string, string> = {};
  for (const [, name, value] of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g)) tokens[name] = value;
  return tokens;
}

export const light = block(":root");
export const dark = { ...light, ...block(':root[data-theme="dark"]') };
