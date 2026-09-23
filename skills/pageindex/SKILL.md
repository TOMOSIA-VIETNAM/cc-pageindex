---
name: pageindex
description: Answer questions about long documents — PDF, Word, PowerPoint, Markdown, plain text, and AsciiDoc specification trees (reports, contracts, screen specs, decks, Japanese client documents) — by indexing them once into a navigable tree, ranking its sections against the question without a model, and reading only those sections. Use when asked to index a document or a directory of specs, to search or answer questions inside indexed material, or when a document is too long to read file by file. Indexing and answering are separate jobs; an already indexed document is never re-indexed. The tool needs no LLM API key: this session writes every piece of generated text itself.
---

# PageIndex document retrieval

Index a document into a tree of sections, then answer questions by walking the
tree and reading only the sections that matter, instead of loading everything.
Sources: `.pdf`, `.docx`, `.pptx`, `.md`, `.txt`, and directories of AsciiDoc
(`.adoc`) files.

**Indexing and answering are separate jobs.** Indexing is done once per
document and serves every question anyone will ever ask of it, so nothing about
the question that prompted it may reach the index. Never pass a question, a
topic or a search term into the page reading or the summary writing — a summary
written to answer "which people appear in this book?" describes the people and
buries everything else, and the next question pays for it. Index neutrally,
then answer. If a question arrives for a document that is not indexed yet,
index it first as its own job, say so, and only then start the four steps under
**Answering a question**.

Two layers, strictly separated:

- **The tool** (`tools/pi.py`, backed by the `pageindex` library) does the
  mechanical work: turn the source into a section tree, store the tree and the
  text on disk, rank sections against a question, and serve the text back. It
  calls no model and needs no API key, and its ranking is the same every time.
- **You** do every generative step: read page images when a PDF has no text
  layer, write the section summaries, judge whether the ranked sections really
  answer the question, and write the answer itself.

## Setup

The tool runs on a virtualenv at `.venv` beside this file, built by the
`install.sh` at the root of the repository this skill lives in — that script
also links the skill into the personal skills directory, and `--uninstall`
removes the link.

**If `.venv` is missing, nothing here runs.** Follow the skill's own directory
to where it really lives (it is usually a link into a checkout) and run
`install.sh` from that repository's root. Do not install packages by hand and
do not build the virtualenv yourself — the script is the one place that knows
what goes in it. If the skill was copied rather than linked, so no `install.sh`
sits above it, say so and stop: it needs the repository. If the script reports
that Python or uv is missing, relay its message; installing a language runtime
is the person's decision, not yours.

Every command is then:

```bash
<skill-dir>/.venv/bin/python <skill-dir>/tools/pi.py <command> ...
```

Every command prints JSON. Pass a document as either its stored name or its
`doc_id`.

One store holds every document of every kind, in the platform's per-user data
directory — `$XDG_DATA_HOME/pageindex` or `~/.local/share/pageindex` on macOS
and Linux, `%LOCALAPPDATA%\pageindex` on Windows — unless `PAGEINDEX_STORE`
says otherwise. `pi.py --help` prints the resolved path. Every
session and every project reads and writes that one store, so **run `pi.py
list` before anything else**: a document already indexed is ready to answer
questions and must not be indexed again — re-indexing throws away the summaries
it carries. Never point the store at a temporary directory; the tool refuses
one.

Reads address a document by **unit** — a page, a slide, or a block of lines,
depending on the source. `index` reports how many units a document has.

## Indexing

Only after `pi.py list` shows the document is not there yet. One command reads
every source; the path decides which reader runs.

```bash
pi.py index <file or directory>
```

| Source | Where the tree comes from | Costs a model pass? |
| --- | --- | --- |
| `.pdf` with a text layer | The page layout and any bookmarks | No |
| `.pdf` that is scanned | Headings you write while reading page images | Yes, once |
| `.docx` | Word's own `Heading 1..9` styles | No |
| `.pptx` | One node per slide, titled by the slide | No |
| Directory of `.adoc` | The `=` heading levels, one node per file above them | No |
| `.md` | Its `#` headings | No |
| `.txt` | Nothing — headings you write after reading the text | Yes, once |

Whatever the source, check the result before moving on: `flat: true`, or a
`warning`, means the tree cannot guide a search and the document needs written
headings instead.

Anything else — `.doc`, `.ppt`, `.xls`, `.xlsx` — has no reader. Convert it to
one of the formats above first; a spreadsheet in particular has no hierarchy to
index and is better turned into a document that does.

### PDF

```bash
pi.py probe report.pdf
```

`route` is `text-layer` when the PDF carries real text, `ocr` when too many
pages are images. `cjk_chars` tells you whether the document is Japanese or
Chinese.

A text-layer PDF indexes directly. On success `structure_source` is `detected`,
`bookmarks` or `hybrid`; `flat: true` means no hierarchy was found, and that
document takes the scanned route below.

A scanned PDF needs its pages read first:

```bash
pi.py render report.pdf --out pages/ --pages 1-20
```

Read each `pages/page-NNNN.png` and write `md/page-NNNN.md` holding that page's
content as clean markdown. Two rules make the index work:

- One markdown file per PDF page, named for the page number, none missing.
  Page numbers are how every later citation points back at the document.
- Use `#`/`##`/`###` headings for the document's real section headings, at the
  depth the document uses. Those headings become the tree; a page with no
  heading continues the previous section.

Describe figures, tables and screenshots in words — they are part of the page's
content and nothing else will capture them. Then:

```bash
pi.py index report.pdf --md md/
```

For a long scan, render and read in batches of 10–20 pages, and dispatch the
batches to parallel subagents that write the markdown files; each batch is
independent.

### A directory of AsciiDoc files

```bash
pi.py index specs/会員管理
```

One directory becomes one document, so pick the directory that matches how
people ask — usually one feature or one screen, not the whole repository. The
tool reads every `.adoc` under it in natural filename order (`--no-recurse`
limits it to the files directly inside), and builds the tree from the `=`
heading levels: one node per file, that file's heading hierarchy underneath.
Headings inside delimited blocks are not mistaken for structure.

Images referenced with `image::` are not read. When a question turns on what a
screenshot shows, open that PNG yourself from the path in the macro, relative to
the indexed directory.

### Word and PowerPoint

```bash
pi.py index handbook.docx
pi.py index onboarding.pptx
```

Word carries outline level in its paragraph styles, so the hierarchy is already
in the file. A `.docx` written without heading styles has no hierarchy to find,
and the result says so — give it written headings, as for plain text below.

A deck is divided by slide: one slide is one node and one read unit, and each
unit opens with a `// slide <N>` marker, so an answer cites a slide number.
Speaker notes are indexed with the slide.

### Plain text, and documents with no headings

A `.txt` file carries no structure at all, and so does a `.docx` written
entirely in body text. Indexing one anyway gives a node per block, which keeps
every line reachable but guides no search. Write the headings instead — the one
generative pass these formats need:

```bash
pi.py chunks notes.txt --lines 200
```

Read each chunk (every line is numbered) and decide where the document really
divides. Write what you find as JSON, quoting each title exactly as its line
spells it:

```json
[{"title": "Refund process", "line": 42, "level": 1},
 {"title": "Held transactions", "line": 96, "level": 2}]
```

```bash
pi.py index notes.txt --headings headings.json
```

A title that does not appear on the line it claims is rejected, so copy from
the text rather than paraphrasing. Headings above sections that a reader would
actually look for beat headings for every paragraph.

### Read units

Reads address a document by unit, and what a unit is depends on the source: a
page for a PDF, a slide for a deck, and a fixed-size block of `--block-lines`
lines (60 by default) for everything else. Lower `--block-lines` for tighter
reads on dense material; raise it for prose.

## Summaries

**Write the summaries.** The tree is stored without them; summaries are what
make the next step able to choose a section without reading it.

```bash
pi.py nodes report.pdf --leaves --max-chars 6000
```

This returns every leaf section with its text. Write a 1–3 sentence summary per
section saying what it *contains* — the specific entities, numbers, decisions
and terms a reader would search for — not that it "discusses" a topic.

Fan the sections out to parallel subagents on a small fast model (Haiku),
roughly 10 sections per subagent. Give each subagent this prompt and nothing
else about why the document is being indexed:

> Read the JSON file `<batch file>`. It holds `nodes`, each with `node_id`,
> `title`, `parent_title` and `text` taken from `<what the document is>`.
>
> For every node write a summary of 1–3 sentences, in the language the document
> is written in, saying what that section CONTAINS: the concrete names,
> numbers, terms, rules and examples a reader might later search for. Do not
> write that it "discusses" or "explains" a topic — name the actual contents.
> Cover the whole section evenly; do not favour any particular subject. Keep
> names and terms exactly as the document writes them.
>
> Write the result to `<output file>` as JSON of exactly this shape, one entry
> per node_id in the input: `{"nodes": {"0004": "...", "0005": "..."}}`
>
> Then reply with only the number of nodes you summarized.

Collect the results into one file:

```json
{
  "document": "One or two sentences on what the whole document is.",
  "nodes": {"0004": "...", "0005": "..."}
}
```

```bash
pi.py set-summaries report.pdf --from summaries.json
```

Then do the parent sections, bottom-up, without re-reading any text:

```bash
pi.py nodes report.pdf --parents --ready --no-text
```

`--ready` returns only the parents whose children all have a summary, each with
those summaries. Write each parent's summary from its children's, call
`set-summaries`, and run the same command again: the next level up has become
ready. Repeat until it returns nothing. `without_summary` in the output of
`set-summaries` counts what is left overall.

Keep the document in the same language it is written in: summarize a Japanese
document in Japanese, so the words in the summary match the words in the pages.

## Answering a question

Four steps, in this order, every time. Do not answer from what you remember of
the document, and do not open the source PDF or `.adoc` files — the index is
the only thing you read.

**1. See what is indexed.**

```bash
pi.py list
```

If the document the question is about is missing, stop here: index it as its
own job, with no mention of the question anywhere in that work, and then come
back to step 2.

**2. Retrieve.** This is the step that decides what to read; it ranks every
indexed section against the question by term overlap, runs no model, and gives
the same ranking every time.

```bash
pi.py retrieve "how is the email column updated on withdrawal?" --doc specs
```

Without `--doc` it searches every document in the store, which is how a
question finds the right one. Each result carries the document, the `node_id`,
the section title, its unit range and a summary preview.

**3. Read the sections it ranked** — by `node_id`, so the text you get is the
section itself, not a page you guessed at.

```bash
pi.py read specs --nodes 0037,0038
```

A section longer than the response limit comes back cut, with `truncated` set
and a `warning` naming it — read its child nodes instead of asking for more of
the parent.

**4. Answer from that text**, citing what you read: page numbers for a PDF
(`p.12`, `p.12–18`), and for an AsciiDoc tree the file and heading named in the
block's `//` marker.

**A question that asks you to enumerate across the whole document** — every
person named, every screen that touches a table, all the rules of one kind — is
not a retrieval problem, and `retrieve` will rank badly on it because no single
section is "about" the list. Read the whole tree instead:

```bash
pi.py structure shokunin.pdf
```

The summaries are the scan surface: go through them, note every section that
carries an instance, read those with `read --nodes`, and build the list from
what they actually say. Say how far you looked — the whole document, or the
part you read.

When the retrieved sections do not answer the question, do not stretch them.
Take one of these and say which you did:

- The ranking is lexical, so a question phrased in different words than the
  document ranks poorly. Retry `retrieve` with the document's own nouns.
- `pi.py structure <doc>` walks the tree by meaning instead: read the summaries,
  pick sections yourself, and read them with `read --nodes`.
- If the document does not cover it, say so. Never fill the gap from general
  knowledge, and never quote a summary as if it were the document — summaries
  are a routing aid, written by a small model, and are not evidence.

`pi.py page <doc> --pages 12-18` still reads raw units, for following a section
past its own boundary.

A tree too large for one response comes back paginated: increment `--part N`
until the response's `pagination.has_more` is false.

## Commands

| Command | Purpose |
| --- | --- |
| `probe PDF` | Page count, text-layer quality, CJK content, `text-layer` or `ocr` route |
| `render PDF --out DIR [--pages 1-20] [--scale 2.0]` | Page images to read |
| `index PATH [--md DIR] [--headings FILE] [--block-lines N] [--no-recurse] [--name N] [--replace]` | Build and store the tree for any supported source |
| `chunks FILE [--lines N]` | Numbered text of a structureless file, to read before writing its headings |
| `nodes DOC [--leaves\|--parents] [--ready] [--all] [--no-text] [--max-chars N]` | Sections needing a summary, with their text |
| `set-summaries DOC --from FILE` | Write summaries and the document description into the tree |
| `list` | Stored documents — always the first call |
| `retrieve "QUESTION" [--doc NAME] [--top N]` | Rank the indexed sections against a question, no model involved |
| `read DOC --nodes 0037,0038` | The full text of those sections |
| `tree DOC [--summary] [--depth N] [--width N]` | The stored tree as an indented outline, with the nodes still missing a summary marked |
| `html --out FILE [--doc NAME]` | A self-contained page of the stored trees, offline: a board to drag and zoom with the sections as a node graph (tree or radial), plus a collapsible list; both searchable |
| `structure DOC [--part N]` | The tree: titles, summaries, unit ranges |
| `page DOC --pages 12-18` | The text of those units |
| `remove DOC` | Delete a document from the store |
