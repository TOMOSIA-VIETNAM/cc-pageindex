import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The sample book as the viewer page carries it. The page embeds its data as JSON in
// <script id="payload">, so the numbers and titles on the landing page are read from
// the very file the graph shows, and cannot drift from it.

export type ViewerNode = {
  id: string;
  title: string;
  summary: string | null;
  start: number;
  end: number;
  nodes: ViewerNode[];
};

type ViewerDocument = { name: string; units: number; nodes: ViewerNode[] };

export const DEMO_PAGE = "/demo/shokunin.html";

function loadDocument(): ViewerDocument {
  const html = readFileSync(join(process.cwd(), "public", DEMO_PAGE), "utf8");
  const match = html.match(/<script id="payload" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error(`No payload in ${DEMO_PAGE}; run npm run sync-demo`);
  return JSON.parse(match[1].replace(/<\\\//g, "</")).documents[0];
}

export function demoStats() {
  const doc = loadDocument();
  const titles = new Map<string, ViewerNode>();
  let sections = 0, leaves = 0, levels = 0, summarized = 0;
  const walk = (nodes: ViewerNode[], depth: number) => {
    for (const node of nodes) {
      sections++;
      levels = Math.max(levels, depth);
      if (!node.nodes.length) leaves++;
      if (node.summary) summarized++;
      titles.set(node.id, node);
      walk(node.nodes, depth + 1);
    }
  };
  walk(doc.nodes, 1);
  return { name: doc.name, pages: doc.units, sections, leaves, levels, summarized, titles };
}

// One recorded run against the sample book: the sections `pi.py retrieve` ranked for
// the example question, with their scores, and the ones then read to answer it.
export const exampleRun = {
  ranked: [
    { id: "0036", score: 13.91 },
    { id: "0037", score: 8.78 },
    { id: "0042", score: 7.93 },
  ],
  read: ["0036", "0037"],
};

// The sections read for the example, and the page span they cover.
export function exampleReads(stats: ReturnType<typeof demoStats>) {
  const read = exampleRun.read.map(id => stats.titles.get(id)!);
  const pages = read.reduce((total, node) => total + node.end - node.start + 1, 0);
  return { read, pages, from: read[0].start, to: read[read.length - 1].end };
}
