# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A Claude Code skill that answers questions about long documents without an LLM API key. The `pageindex` library does the mechanical work — parse a PDF's layout into a section tree, store it, serve reads. The session that runs the skill does every generative step: OCR page images, write section summaries, write the answer. Nothing in `tools/pi.py` calls a model.

There is no application here beyond the skill. `notebooks/spec/` holds design documents, one directory per work item.

## Commands

```bash
./install.sh              # build .venv, link skills into ~/.claude/skills (macOS/Linux/WSL)
./install.sh --uninstall  # remove the links only
```

`install.ps1` is the Windows equivalent; it copies when the shell cannot create symlinks.

Run the tool through the skill's own virtualenv — it is the only interpreter with `pageindex` installed:

```bash
skills/pageindex/.venv/bin/python skills/pageindex/tools/pi.py <command>
```

`pi.py --help` lists the commands and prints the resolved store path. `SKILL.md` documents what each command is for and the order they run in; read it before changing behaviour, since it is the contract the agent follows.

There is no test suite. Verify changes by running the tool against real documents and comparing the output to the previous run: `index` reports node and unit counts, `tree <doc>` prints the whole structure, and those numbers must not move when a change is meant to preserve behaviour.

## Architecture

### Two layers, and the line between them

The split is the reason the skill needs no API key, so keep it:

- `tools/pi.py` — mechanical only. Structure extraction, storage, ranking, text slicing. Deterministic: same store and same query produce the same output every time.
- The agent session — every generated word. Summaries, OCR, answers.

A change that puts a model call inside `pi.py` breaks the premise.

### Store

The store is the `pageindex` library's own `DocStore` format, written through `DocStore.save_document()`, so anything that reads a pageindex local store reads this one: `manifest.json` plus `docs/<doc_id>/{doc,tree,pages}.json`.

It lives in the platform's per-user data directory (`$XDG_DATA_HOME/pageindex`, `%LOCALAPPDATA%\pageindex`), overridable with `PAGEINDEX_STORE`. `store_dir()` refuses a path inside the system temp directory — a store that dies with the session silently re-indexes and throws away summaries that cost real tokens to produce.

Two fields are this tool's additions to the library's node shape: `lines` (the node's own line span, used to slice its text for summarizing) and `metadata.structure_source`. Both are additive; the library passes unknown keys through.

### One indexing pipeline, several readers

Every source lands on one tree shape:

| Source | How the tree is built |
| --- | --- |
| PDF with a text layer | `page_index_flash(pdf, summary=False, optimize=False)` — layout statistics, no LLM |
| PDF without one | page images the session reads into `page-NNNN.md` files, then the markdown heading reader |
| `.docx` | Word's `Heading 1..9` paragraph styles |
| `.pptx` | one node per slide; the unit is the slide, not a block of lines |
| A directory of `.adoc` files | the AsciiDoc heading reader |
| `.md` | the library's own markdown heading reader |
| `.txt`, or anything with no headings of its own | headings the session writes after reading `chunks`, validated against the text |

Everything but the PDF and the deck shares the same path after heading extraction: `extract_node_text_content` and `build_tree_from_nodes` come from `pageindex.page_index_md` and are used as they ship, then `blocked_document()` cuts the lines into units. Only the heading readers differ, and they return the library's own shape (`{node_title, line_num, level}`).

`cmd_index` dispatches on the path; `source_lines()` is the one place that maps a suffix to a reader, and `chunks` uses it too so an outline is written against the same lines the index will number.

**Adding a format means writing one heading reader and one line in the dispatch, nothing else.** Do not add a route with its own tree builder or its own `index` subcommand — both duplications were removed once already.

`headings_to_tree()` is the glue the library does not provide: it turns line numbers into the store's addressing. Every node gets `start_index`/`end_index` spanning its descendants, for navigation, and `lines` covering only its own prose, so a summary describes that section instead of everything filed under it.

### Read units

Reads address a document by unit: a page for a PDF, a slide for a deck, a fixed-size block of lines for everything else. Each AsciiDoc block opens with a `// <file> line <N>` marker, which is how an answer cites a source file rather than a meaningless block number. `units_to_lines()` maps between the two.

### Retrieval

`retrieve` ranks sections by term overlap weighted by rarity, titles counting double, dropping any term carried by more than a quarter of the sections — that replaces a stopword list in every language at once. Runs of Japanese or Chinese characters become overlapping two-character pieces, since those languages write without spaces.

It is lexical, not semantic. A question phrased in different words than the document ranks badly, and a question asking to enumerate across a whole document ranks badly by nature. `SKILL.md` tells the agent what to do in both cases; keep that guidance in step with any change here.

### Limits

Response ceilings come from the library (`TOOL_RESPONSE_CHAR_LIMIT`), not from numbers invented here. `structure` and `page` go through `agent_tools.call_tool`, so they are capped and paginated by the library already. `read` is this tool's own command and shares that same ceiling across the sections requested in one call.

## Conventions

Durable files — code, comments, `SKILL.md`, the documents under `notebooks/spec/` — must stand on their own. No references to things that move: no section numbers, no phase names, no design-document titles, no internal jargon left undefined where it is used. Name things for what they do.

`notebooks/spec/README.md` sets the layout for design documents: one directory per work item, named for what it produces, never numbered.
