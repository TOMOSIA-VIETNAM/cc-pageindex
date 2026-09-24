// The English copy is the reference: its shape is the type every other language must fill.
// `{name}` placeholders are filled by `fill()` in ./index.ts.

const en = {
  meta: {
    title: "pageindex — read long documents the way a person does, in Claude Code",
    description:
      "A Claude Code skill that turns PDFs, Word files, decks and spec folders into a table-of-contents tree, ranks sections locally with no model call, and reads only the pages that answer. No API key.",
  },
  nav: {
    how: "How it works",
    graph: "Graph",
    install: "Install",
    github: "GitHub",
    theme: "Switch theme",
    language: "Language",
  },
  hero: {
    eyebrow: "Claude Code skill · no API key",
    title: "Read a 300-page document the way a person does.",
    lead:
      "pageindex turns a PDF, Word file, deck or folder of specs into its table of contents. Claude looks at the tree, opens the few sections that matter, and answers with the page it read. Nothing to embed, no vector database, no model key.",
    ctaGraph: "Explore the graph",
    ctaGithub: "View on GitHub",
    copy: "Copy",
    copied: "Copied",
    flowPages: "{pages} pages",
    flowSections: "{sections} sections",
    flowAnswer: "Answer, with its source",
    flowCite: "pages {from}–{to}",
  },
  graph: {
    title: "This is a real index.",
    caption:
      "{book} — {pages} pages became {sections} sections on {levels} levels. Hover a node to trace its path, click a circle to fold a branch, click a title to read its summary.",
    meta: "{pages} pages · {sections} sections",
    open: "Open the full viewer",
    frameTitle: "Interactive section graph of the sample book",
  },
  numbers: {
    pages: "pages in the book",
    sections: "sections in the tree",
    leaves: "leaf sections",
    read: "pages read to answer the question below",
    keys: "API keys",
  },
  problem: {
    title: "Long documents break the usual ways of asking",
    items: [
      {
        title: "Paste it all in",
        body: "Tokens burn, the context overflows, and the longer it gets the more the model skims.",
      },
      {
        title: "Chop it into vectors",
        body: "Chunks lose the chapter they belonged to, tables split in half, and “sounds similar” is not “contains the answer”.",
      },
      {
        title: "Walk the table of contents",
        body: "Serious documents already carry their structure. pageindex keeps it, so finding the answer becomes choosing a section — and the citation comes for free.",
      },
    ],
  },
  how: {
    title: "Two layers, one clean line between them",
    lead: "The tool does the mechanical work and never calls a model. Your Claude Code session writes every word.",
    tool: "tool",
    session: "Claude",
    steps: [
      {
        title: "Index once",
        body: "A PDF's layout, Word heading styles, AsciiDoc levels or slide titles become a section tree, stored on your machine. Scanned pages and plain text get headings Claude writes — once.",
      },
      {
        title: "Rank locally",
        body: "Each question is matched against titles and summaries by rarity-weighted term overlap; Japanese and Chinese are split into two-character pieces. The same question ranks the same way every time.",
      },
      {
        title: "Read and cite",
        body: "Claude opens only the top sections, checks they really answer, and replies with the page, slide, or file and line — citations you can follow back.",
      },
    ],
  },
  example: {
    title: "One question, {pages} pages read",
    lead: "A recorded run against the sample book. The tool ranks every section without a model; Claude reads {read} of them and answers.",
    you: "You",
    question: "How does a shokunin combine Kaizen with AI?",
    ranked: "Ranked by the tool — no model call",
    readTag: "read",
    answer:
      "They don't pick one. A shokunin keeps Kaizen — improving in small, continuous steps, the 1% principle of (1.01)^365 — and treats AI as a tool that amplifies that effort. Improvement only lasts once it becomes a shared standard, like the wedge that stops a cannon sliding back while the team hauls it uphill.",
    score: "score {score} · p. {from}–{to}",
    source: "Source: pages {from}–{to}",
  },
  features: {
    title: "The graph ships with the skill",
    lead: "writes one offline file. What you dragged above is that file.",
    items: [
      { title: "Trace any path", body: "Hover a node or an edge and the route from the root flows toward it, its whole subtree lit." },
      { title: "Fold what you don't need", body: "Click a circle to collapse a branch; the node stays exactly where your eye was." },
      { title: "Tree or radial", body: "Left to right for reading titles, radial to take in the whole shape at once." },
      { title: "Search and triage", body: "Matches light up and unfold, Enter steps through them, and one click shows every section still missing a summary." },
      { title: "Numbers at a glance", body: "Sections per level, leaves, folded branches, and how much of the document each section covers." },
      { title: "One file, offline", body: "No server, no CDN, nothing leaves the machine. Light and dark, mouse, keyboard and touch." },
    ],
  },
  formats: {
    title: "Reads what your documents already are",
    lead: "Most formats carry their own outline, so indexing them costs nothing. Two need Claude to read once.",
    free: "no model pass",
    pass: "one model pass",
    rows: {
      pdf: { format: "PDF with text", source: "layout and bookmarks" },
      scan: { format: "Scanned PDF", source: "page images Claude reads" },
      docx: { format: "Word .docx", source: "Heading 1–9 styles" },
      pptx: { format: "PowerPoint .pptx", source: "one node per slide" },
      md: { format: "Markdown", source: "# headings" },
      txt: { format: "Plain text", source: "headings Claude writes" },
      adoc: { format: "AsciiDoc folder", source: "= levels, cited by file and line" },
    },
  },
  install: {
    title: "Install in a minute",
    lead: "Needs uv or Python 3.10+. The script builds a private environment and links the skill into ~/.claude/skills.",
    clone: "Clone",
    setup: "Install",
    windows: "On Windows, run .\\install.ps1 instead.",
    use: "Then ask, from any directory",
    indexPrompt: "Use the pageindex skill to index ~/Documents/report-2025.pdf",
    askPrompt: "Use the pageindex skill. What was Q3 revenue in the 2025 report?",
  },
  cta: {
    title: "Point it at your longest document.",
    lead: "Install once, index once, and ask from any Claude Code session after that.",
    button: "Get it on GitHub",
  },
  footer: {
    builtOn: "Built on PageIndex by VectifyAI, run as a Claude Code skill.",
    notOfficial: "Not an official product of either; names and logos belong to their owners.",
    sample: "Sample book: “SHOKUNIN IT – Cách người TOMOSIA làm việc” by Lưu Tuấn Anh (TOMOSIA), used with permission.",
  },
};

export default en;
export type Dictionary = typeof en;
