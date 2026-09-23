#!/usr/bin/env python3
"""Document index/query CLI backed by the PageIndex local store.

Splits the work so that no step in this file calls an LLM:

  * structure extraction  -> pageindex Flash (layout statistics, LLM-free)
  * page text             -> the PDF text layer, or markdown written by the
                             caller after reading page images
  * node summaries        -> written in by the caller through set-summaries
  * retrieval             -> the pageindex agent tool contract over the store

The caller (an agent session) supplies every piece of generated text, so the
tool needs no model credentials.

Store layout is the pageindex local store: <store>/docs/<doc_id>/{doc,tree,
pages}.json plus manifest.json. One store holds every kind of document, in the
platform's per-user data directory unless PAGEINDEX_STORE says otherwise, so
every session queries the same index instead of building its own.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

STORE_NAME = "pageindex"
PAGE_FILE = re.compile(r"^page-(\d+)\.md$")
CJK = re.compile(r"[぀-ヿ㐀-鿿ｦ-ﾟ]")
SURROGATES = re.compile("[\ud800-\udfff]")

# A page with less text than this carries no usable text layer: a scan, a
# full-page figure, or a cover. Measured after whitespace is stripped.
MIN_PAGE_CHARS = 50
# Fraction of such pages above which the text layer is not worth indexing.
OCR_PAGE_RATIO = 0.3
# A query term found in more than this share of the indexed sections cannot
# separate them, so it is dropped from the ranking.
COMMON_TERM_SHARE = 0.25
# Summary characters shown per ranked section; `read` returns the real text.
SUMMARY_PREVIEW = 300

# What built a document's tree, recorded as the store's `mode`. The Flash
# extractor reports which of its paths it took; the rest are this tool's own
# heading parsers, and saying "flash" for those would misname them.
INDEX_MODE = {"detected": "flash", "bookmarks": "flash", "hybrid": "flash",
              "pages": "flash", "unreadable": "flash",
              "markdown-headings": "markdown", "adoc-headings": "asciidoc"}


def fail(message: str) -> "NoReturn":  # type: ignore[name-defined]
    print(json.dumps({"error": message}, ensure_ascii=False))
    raise SystemExit(1)


def emit(payload) -> None:
    print(json.dumps(payload, ensure_ascii=False, indent=2))


def default_store() -> str:
    """Where indexed documents live when nothing else says.

    Per-user application data, in each platform's own place: an absolute path
    every session resolves the same way. Never a synced folder — a store under
    Documents rides iCloud or OneDrive to other machines, which both copies the
    indexed text off the machine and breaks the store's atomic writes.
    """
    if sys.platform == "win32":
        base = os.environ.get("LOCALAPPDATA") or os.path.expanduser("~")
    else:
        base = (os.environ.get("XDG_DATA_HOME")
                or os.path.expanduser("~/.local/share"))
    return os.path.join(base, STORE_NAME)


def is_temporary(path: str) -> bool:
    """True for a path inside this platform's temp directory, whose contents
    the system may delete at any time."""
    import tempfile
    roots = [tempfile.gettempdir(), "/tmp"]
    for root in roots:
        try:
            if os.path.commonpath([os.path.realpath(path),
                                   os.path.realpath(root)]) == \
                    os.path.realpath(root):
                return True
        except ValueError:  # different drives on Windows: not under it
            continue
    return False


def store_dir(args) -> str:
    path = os.path.abspath(os.path.expanduser(
        args.store or os.environ.get("PAGEINDEX_STORE") or default_store()))
    if is_temporary(path):
        fail(f"The store must outlive the session, and {path} does not. "
             f"Leave it at {default_store()} or set PAGEINDEX_STORE to a "
             "directory that persists.")
    return path


def open_store(args):
    from pageindex.local_store import DocStore
    return DocStore(store_dir(args))


def open_client(args):
    from pageindex import PageIndexLocalClient
    return PageIndexLocalClient(storage_path=store_dir(args))


def now_iso() -> str:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    return now.replace(microsecond=now.microsecond // 1000 * 1000).isoformat()


def scrub(text: str) -> str:
    """PyPDF2 decodes broken ToUnicode maps with surrogatepass; a lone
    surrogate breaks every later UTF-8 write."""
    return SURROGATES.sub("�", text or "")


def pdf_page_texts(pdf_path: str) -> list[str]:
    import PyPDF2
    with open(pdf_path, "rb") as handle:
        reader = PyPDF2.PdfReader(handle)
        return [scrub(page.extract_text() or "") for page in reader.pages]


def resolve_doc(store, wanted: str) -> dict:
    """Accept a doc_id or a document name."""
    metas = store.list_metas()
    for meta in metas:
        if meta.get("id") == wanted:
            return meta
    matches = [meta for meta in metas if meta.get("name") == wanted]
    if len(matches) == 1:
        return matches[0]
    if len(matches) > 1:
        fail(f"{wanted!r} matches {len(matches)} documents; pass a doc_id")
    known = ", ".join(sorted(str(meta.get("name")) for meta in metas)) or "none"
    fail(f"No document {wanted!r} in {store._root}. Indexed: {known}")


def walk(nodes, parent=None):
    for node in nodes:
        yield node, parent
        yield from walk(node.get("nodes") or [], node)


# ── probe ────────────────────────────────────────────────────────────────

def cmd_probe(args) -> None:
    texts = pdf_page_texts(args.pdf)
    lengths = [len(text.strip()) for text in texts]
    thin = [index + 1 for index, size in enumerate(lengths)
            if size < MIN_PAGE_CHARS]
    joined = "".join(texts)
    cjk = len(CJK.findall(joined))
    needs_ocr = bool(lengths) and len(thin) / len(lengths) > OCR_PAGE_RATIO
    emit({
        "pdf": os.path.abspath(args.pdf),
        "pages": len(texts),
        "chars_total": sum(lengths),
        "pages_without_text": thin[:50],
        "pages_without_text_count": len(thin),
        "cjk_chars": cjk,
        "needs_ocr": needs_ocr,
        "route": "ocr" if needs_ocr else "text-layer",
    })


# ── render ───────────────────────────────────────────────────────────────

def parse_pages(spec: str, page_count: int) -> list[int]:
    pages: list[int] = []
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            first, last = part.split("-", 1)
            pages.extend(range(int(first), int(last) + 1))
        else:
            pages.append(int(part))
    bad = [page for page in pages if not 1 <= page <= page_count]
    if bad:
        fail(f"Pages out of range 1-{page_count}: {bad}")
    return sorted(set(pages))


def cmd_render(args) -> None:
    import pypdfium2
    pdf = pypdfium2.PdfDocument(args.pdf)
    pages = (parse_pages(args.pages, len(pdf)) if args.pages
             else list(range(1, len(pdf) + 1)))
    out = Path(os.path.expanduser(args.out))
    out.mkdir(parents=True, exist_ok=True)
    written = []
    for page in pages:
        image = pdf[page - 1].render(scale=args.scale).to_pil()
        path = out / f"page-{page:04d}.png"
        image.save(path)
        written.append(str(path))
    emit({"pdf": os.path.abspath(args.pdf), "pages": pages,
          "out_dir": str(out), "files": written})


# ── index ────────────────────────────────────────────────────────────────

def flash_structure(pdf_path: str) -> tuple[list, str]:
    """Layout-only tree. summary/optimize off keeps the call LLM-free."""
    from pageindex.flash import page_index_flash
    result = page_index_flash(pdf_path, summary=False, optimize=False)
    return result.get("structure") or [], result.get("toc_source") or "unknown"


def read_page_markdown(md_dir: str, page_count: int) -> list[str]:
    directory = Path(os.path.expanduser(md_dir))
    if not directory.is_dir():
        fail(f"Not a directory: {directory}")
    found: dict[int, str] = {}
    for entry in sorted(directory.iterdir()):
        match = PAGE_FILE.match(entry.name)
        if match:
            found[int(match.group(1))] = entry.read_text(encoding="utf-8")
    if not found:
        fail(f"No page-NNNN.md files in {directory}")
    missing = [page for page in range(1, page_count + 1) if page not in found]
    if missing:
        fail(f"Missing markdown for pages {missing[:20]} "
             f"({len(missing)} of {page_count})")
    extra = [page for page in found if page > page_count]
    if extra:
        fail(f"Markdown for pages beyond the PDF's {page_count}: {extra[:20]}")
    return [found[page] for page in range(1, page_count + 1)]


def headings_to_tree(headings: list[dict], lines: list[str],
                     line_unit: list[int]) -> list:
    """Heading list plus text lines -> the stored tree.

    The heading extraction, the per-node text slicing and the nesting by level
    are the pageindex markdown pipeline, used as it ships. What this adds is
    the store's addressing: every node gains the range of read units it covers,
    children included, and keeps its own line span so a summary describes that
    section rather than everything filed under it.
    """
    from pageindex.page_index_md import (build_tree_from_nodes,
                                         extract_node_text_content)
    if not headings:
        return []
    tree = build_tree_from_nodes(extract_node_text_content(headings, lines))
    last_line = len(lines) - 1

    def span(nodes: list, stop: int) -> None:
        for position, node in enumerate(nodes):
            children = node.get("nodes") or []
            first = node.pop("line_num") - 1          # the library counts from 1
            following = (nodes[position + 1]["line_num"] - 2
                         if position + 1 < len(nodes) else stop)
            span(children, following)
            own_end = (children[0]["lines"][0] - 1 if children else following)
            node["lines"] = [first, max(first, min(own_end, last_line))]
            node["start_index"] = line_unit[first] + 1
            node["end_index"] = line_unit[max(first, min(following,
                                                         last_line))] + 1
            node.pop("text", None)
            if not children:
                node.pop("nodes", None)

    span(tree, last_line)
    return tree


def markdown_headings(text: str) -> tuple[list[dict], list[str]]:
    """pageindex's own markdown heading reader, verbatim."""
    from pageindex.page_index_md import extract_nodes_from_markdown
    return extract_nodes_from_markdown(text)


def units_to_lines(units: list[str]) -> tuple[list[str], list[int]]:
    """The read units flattened to lines, plus the unit each line belongs to."""
    lines: list[str] = []
    line_unit: list[int] = []
    for index, unit in enumerate(units):
        body = unit.split("\n")
        lines.extend(body)
        line_unit.extend([index] * len(body))
    return lines, line_unit


def page_nodes(page_texts: list[str]) -> list:
    """No hierarchy found: one node per page, so every page stays reachable."""
    return [{"title": f"Page {index}", "start_index": index,
             "end_index": index}
            for index in range(1, len(page_texts) + 1)]


def check_page_bounds(structure: list, page_count: int) -> None:
    for node, _ in walk(structure):
        start, end = node.get("start_index"), node.get("end_index")
        if start is None or end is None:
            fail(f"Node {node.get('title')!r} has no page range")
        if not (1 <= start <= end <= page_count):
            fail(f"Node {node.get('title')!r} spans pages {start}-{end}, "
                 f"outside the document's {page_count} pages")



def save_document(store, args, raw_name: str, structure: list,
                  page_texts: list[str], source: str,
                  source_path: str) -> dict:
    """Store one document: the tree, the unit texts, and the metadata."""
    from pageindex.naming import sanitize_filename, truncate_filename
    from pageindex.utils import write_node_id

    check_page_bounds(structure, len(page_texts))
    write_node_id(structure)
    name = sanitize_filename(raw_name)
    with store.lock():
        taken = {meta.get("name") for meta in store.list_metas()}
        if name in taken:
            if args.replace:
                for meta in store.list_metas():
                    if meta.get("name") == name:
                        store.delete_document(meta["id"])
            else:
                for number in range(1, 100):
                    candidate = truncate_filename(name, suffix=f"_{number}")
                    if candidate not in taken:
                        name = candidate
                        break
                else:
                    fail(f"Too many documents named like {name!r}")
        doc_id = "pi-" + uuid.uuid4().hex
        meta = {
            "id": doc_id,
            "name": name,
            "description": None,
            "status": "completed",
            "createdAt": now_iso(),
            "pageNum": len(page_texts),
            "folderId": None,
            "metadata": {"source_path": source_path,
                         "structure_source": source},
            "mode": INDEX_MODE.get(source, source),
        }
        pages = [{"page_index": index + 1, "markdown": text}
                 for index, text in enumerate(page_texts)]
        store.save_document(doc_id, meta, structure, pages)
    return {"doc_id": doc_id, "name": name, "units": len(page_texts),
            "nodes": sum(1 for _ in walk(structure)),
            "structure_source": source, "store": store_dir(args),
            "flat": source == "pages",
            "next": "Fill summaries: `nodes` then `set-summaries`."}


def cmd_index(args) -> None:
    pdf_path = os.path.abspath(os.path.expanduser(args.pdf))
    if not os.path.isfile(pdf_path):
        fail(f"No such file: {pdf_path}")
    store = open_store(args)

    page_texts = pdf_page_texts(pdf_path)
    if args.md:
        page_texts = read_page_markdown(args.md, len(page_texts))
        lines, line_unit = units_to_lines(page_texts)
        headings, _ = markdown_headings("\n".join(lines))
        structure, source = (headings_to_tree(headings, lines, line_unit),
                             "markdown-headings")
        if not structure:
            structure, source = page_nodes(page_texts), "pages"
    else:
        if not any(text.strip() for text in page_texts):
            fail("The PDF has no text layer. Render the pages with `render`, "
                 "write page-NNNN.md files, then re-run index with --md.")
        structure, source = flash_structure(pdf_path)
        if not structure:
            structure, source = page_nodes(page_texts), "pages"

    name = args.name or os.path.basename(pdf_path)
    emit(save_document(store, args, name, structure, page_texts,
                       source, pdf_path))



# ── asciidoc ─────────────────────────────────────────────────────────────

ADOC_HEADING = re.compile(r"^(={1,6})\s+(\S.*?)\s*$")
# Delimited blocks whose contents must not be read as headings. An example
# block opens with four or more '=' and nothing else, which is why the
# heading pattern above requires text after the '='.
ADOC_FENCE = re.compile(r"^(-{4,}|\.{4,}|={4,}|\*{4,}|_{4,}|\+{4,}|/{4,})\s*$")


def natural_key(name: str):
    return [int(part) if part.isdigit() else part.lower()
            for part in re.split(r"(\d+)", name)]


def adoc_files(directory: Path, recurse: bool = True) -> list[Path]:
    found = directory.rglob("*.adoc") if recurse else directory.glob("*.adoc")
    return sorted((path for path in found if path.is_file()),
                  key=lambda path: natural_key(str(path.relative_to(directory))))


def adoc_headings(lines: list[str], first_line: int = 0) -> list[dict]:
    """AsciiDoc headings in the shape pageindex's markdown reader returns.

    pageindex reads `#` headings and fenced code; AsciiDoc writes `=` headings
    and delimited blocks, so this is the part with no library equivalent. What
    it produces feeds the same pipeline: 1-based line numbers and a level.
    """
    found: list[dict] = []
    fence = None
    for offset, line in enumerate(lines):
        match = ADOC_FENCE.match(line)
        if match:
            token = match.group(1)[0]
            if fence is None:
                fence = token
            elif fence == token:
                fence = None
            continue
        if fence is not None:
            continue
        match = ADOC_HEADING.match(line)
        if match:
            found.append({"node_title": match.group(2),
                          "line_num": first_line + offset + 1,
                          "level": len(match.group(1))})
    return found


def adoc_document(directory: Path, block_lines: int,
                  recurse: bool = True) -> tuple[list, list[str]]:
    """One document out of a directory of AsciiDoc files.

    The files are concatenated in natural filename order and cut into
    fixed-size blocks, the unit later reads ask for. Each block opens with a
    comment naming the file and line numbers it came from, so an answer can
    cite the source file rather than a block number. Every file also enters the
    tree as a node of its own, above the headings it contains.
    """
    files = adoc_files(directory, recurse)
    if not files:
        fail(f"No .adoc files under {directory}")

    lines: list[str] = []
    headings: list[dict] = []
    for path in files:
        relative = str(path.relative_to(directory))
        body = path.read_text(encoding="utf-8", errors="replace").splitlines()
        offset = len(lines)
        marked = insert_markers(body, relative, block_lines, offset)
        lines.extend(marked)
        # level 0 sits above every heading level, so a file holds its own
        headings.append({"node_title": relative, "line_num": offset + 1,
                         "level": 0})
        headings.extend(adoc_headings(marked, offset))

    units = ["\n".join(lines[start:start + block_lines])
             for start in range(0, len(lines), block_lines)]
    line_unit = [index // block_lines for index in range(len(lines))]
    return headings_to_tree(headings, lines, line_unit), units


def insert_markers(body: list[str], relative: str, block_lines: int,
                   offset: int) -> list[str]:
    """The file's lines with a source marker every block_lines lines, so no
    block can be read without knowing which file and lines it holds."""
    out: list[str] = []
    for number, line in enumerate(body, start=1):
        if not out or (offset + len(out)) % block_lines == 0:
            out.append(f"// {relative} line {number}")
        out.append(line)
    return out


def cmd_index_adoc(args) -> None:
    directory = Path(os.path.abspath(os.path.expanduser(args.dir)))
    if not directory.is_dir():
        fail(f"Not a directory: {directory}")
    if args.block_lines < 10:
        fail("--block-lines below 10 makes the read unit useless")
    structure, page_texts = adoc_document(directory, args.block_lines,
                                          not args.no_recurse)
    store = open_store(args)
    result = save_document(store, args, args.name or directory.name, structure,
                           page_texts, "adoc-headings", str(directory))
    result["files"] = len(structure)
    result["block_lines"] = args.block_lines
    emit(result)


# ── summaries ────────────────────────────────────────────────────────────

def document_lines(pages: list[dict]) -> list[str]:
    """The stored blocks back as the line list they were cut from."""
    return "\n".join(page["markdown"] for page in pages).splitlines()


def node_text(node: dict, pages: list[dict], lines: list[str]) -> str:
    span = node.get("lines")
    if span:
        return "\n".join(lines[span[0]:span[1] + 1])
    start, end = node["start_index"], node["end_index"]
    return "\n".join(page["markdown"] for page in pages
                     if start <= page["page_index"] <= end)


def cmd_nodes(args) -> None:
    store = open_store(args)
    meta = resolve_doc(store, args.doc)
    tree = store.get_tree(meta["id"]) or []
    pages = store.get_pages(meta["id"]) or []
    lines = document_lines(pages)

    out = []
    for node, parent in walk(tree):
        children = node.get("nodes") or []
        if args.leaves and children:
            continue
        if args.parents and not children:
            continue
        if args.ready and not all(child.get("summary") for child in children):
            continue
        if not args.all and node.get("summary"):
            continue
        entry = {
            "node_id": node.get("node_id"),
            "title": node.get("title"),
            "pages": [node["start_index"], node["end_index"]],
            "parent_title": parent.get("title") if parent else None,
            "children": [{"title": child.get("title"),
                          "summary": child.get("summary")}
                         for child in children],
        }
        if not args.no_text:
            text = node_text(node, pages, lines)
            entry["truncated"] = len(text) > args.max_chars
            entry["text"] = text[:args.max_chars]
        out.append(entry)
    emit({"doc_id": meta["id"], "name": meta["name"], "count": len(out),
          "nodes": out})


def cmd_set_summaries(args) -> None:
    store = open_store(args)
    meta = resolve_doc(store, args.doc)
    payload = json.loads(Path(os.path.expanduser(args.file)).read_text("utf-8"))
    if not isinstance(payload, dict):
        fail('The summary file must be an object: '
             '{"document": "...", "nodes": {"0001": "..."}}')
    summaries = payload.get("nodes") or {}
    description = payload.get("document")

    tree = store.get_tree(meta["id"]) or []
    pages = store.get_pages(meta["id"]) or []
    known = {node.get("node_id") for node, _ in walk(tree)}
    unknown = sorted(set(summaries) - known)
    if unknown:
        fail(f"No such node_id in {meta['name']}: {unknown[:20]}")

    written = 0
    for node, _ in walk(tree):
        summary = summaries.get(node.get("node_id"))
        if summary:
            node["summary"] = summary
            written += 1
    if description:
        meta["description"] = description
    with store.lock():
        store.save_document(meta["id"], meta, tree, pages)

    remaining = sum(1 for node, _ in walk(tree) if not node.get("summary"))
    emit({"doc_id": meta["id"], "name": meta["name"], "written": written,
          "description_set": bool(description), "without_summary": remaining})


# ── retrieval over the tree ──────────────────────────────────────────────

WORD = re.compile(r"[^\W\d_]+|\d+", re.UNICODE)
CJK_RUN = re.compile(r"^[\u3040-\u30ff\u3400-\u9fff\uff66-\uff9f]")


def terms(text: str) -> list[str]:
    """Match terms out of a string, in any of the languages indexed here.

    Latin and Vietnamese words are whole tokens. Japanese and Chinese write
    without spaces, so a run of those characters becomes its overlapping
    two-character pieces — the unit that actually repeats between a question
    and a section summary.
    """
    out: list[str] = []
    for match in WORD.finditer(text.lower()):
        run = match.group()
        if CJK_RUN.match(run) and len(run) > 1:
            out.extend(run[at:at + 2] for at in range(len(run) - 1))
        else:
            out.append(run)
    return out


def scored_nodes(store, metas: list[dict], query: str) -> list[dict]:
    """Rank every summarized node against the query.

    The score is term overlap weighted by how rare each term is across the
    nodes in scope, title matches counting double. No model runs: the ranking
    is the same for the same store and query, every session.
    """
    import math

    entries = []
    for meta in metas:
        for node, _ in walk(store.get_tree(meta["id"]) or []):
            title = node.get("title") or ""
            summary = node.get("summary") or ""
            entries.append({
                "doc": meta.get("name"), "doc_id": meta["id"],
                "node_id": node.get("node_id"), "title": title,
                "summary": summary,
                "pages": [node.get("start_index"), node.get("end_index")],
                "title_terms": set(terms(title)),
                "body_terms": set(terms(summary)),
            })
    if not entries:
        return []

    document_count = {}
    for entry in entries:
        for term in entry["title_terms"] | entry["body_terms"]:
            document_count[term] = document_count.get(term, 0) + 1

    # A term carried by most sections says nothing about which one to read —
    # grammar words in every language land here without a stopword list.
    too_common = len(entries) * COMMON_TERM_SHARE

    results = []
    for entry in entries:
        matched, score = [], 0.0
        for term in dict.fromkeys(terms(query)):
            in_title = term in entry["title_terms"]
            in_body = term in entry["body_terms"]
            if not (in_title or in_body) or document_count[term] > too_common:
                continue
            weight = math.log(1 + len(entries) / document_count[term])
            score += weight * (2.0 if in_title else 1.0)
            matched.append(term)
        if score:
            summary = entry["summary"]
            results.append({"doc": entry["doc"], "node_id": entry["node_id"],
                            "title": entry["title"], "pages": entry["pages"],
                            "summary": summary[:SUMMARY_PREVIEW]
                            + ("…" if len(summary) > SUMMARY_PREVIEW else ""),
                            "score": round(score, 2), "matched": matched})
    results.sort(key=lambda row: (-row["score"], row["doc"], row["node_id"]))
    return results


def cmd_retrieve(args) -> None:
    store = open_store(args)
    metas = ([resolve_doc(store, name) for name in args.doc] if args.doc
             else store.list_metas())
    if not metas:
        fail(f"No documents in {store_dir(args)}")
    unsummarized = [meta.get("name") for meta in metas
                    if not any(node.get("summary") for node, _
                               in walk(store.get_tree(meta["id"]) or []))]
    results = scored_nodes(store, metas, args.query)[:args.top]
    payload = {"query": args.query,
               "searched": [meta.get("name") for meta in metas],
               "results": results}
    if unsummarized:
        payload["warning"] = (
            "These documents have no summaries, so nothing in them can rank: "
            + ", ".join(str(name) for name in unsummarized)
            + ". Run `nodes` and `set-summaries` on them first.")
    payload["next"] = (
        "Read the ranked sections with `read <doc> --nodes <id,id>`, then "
        "answer from that text. Widen with more nodes if it falls short."
        if results else
        "Nothing matched. Try the question's own nouns, or `tree <doc>` to "
        "see what the index actually holds.")
    emit(payload)


def cmd_read(args) -> None:
    store = open_store(args)
    meta = resolve_doc(store, args.doc)
    tree = store.get_tree(meta["id"]) or []
    pages = store.get_pages(meta["id"]) or []
    lines = document_lines(pages)
    wanted = [one.strip() for group in args.nodes for one in group.split(",")
              if one.strip()]
    by_id = {node.get("node_id"): node for node, _ in walk(tree)}
    missing = [node_id for node_id in wanted if node_id not in by_id]
    if missing:
        fail(f"No such node_id in {meta['name']}: {missing}")
    from pageindex.agent_tools import TOOL_RESPONSE_CHAR_LIMIT
    budget = TOOL_RESPONSE_CHAR_LIMIT
    sections, truncated = [], []
    for node_id in wanted:
        node = by_id[node_id]
        text = node_text(node, pages, lines)
        # the same ceiling the pageindex tools answer under, shared across the
        # sections asked for in one call
        room = max(budget // max(len(wanted) - len(sections), 1), 0)
        if len(text) > room:
            text = text[:room]
            truncated.append(node_id)
        budget -= len(text)
        sections.append({
            "node_id": node_id, "title": node.get("title"),
            "pages": [node["start_index"], node["end_index"]],
            "truncated": node_id in truncated, "text": text,
        })
    payload = {"doc": meta["name"], "sections": sections,
               "cite": "Cite the pages listed for each section, or the file "
                       "and line named in the text's // markers."}
    if truncated:
        payload["warning"] = (
            "Cut to fit the response limit: " + ", ".join(truncated)
            + ". Ask for fewer sections, or read their child nodes instead.")
    emit(payload)


# ── inspection ───────────────────────────────────────────────────────────

def cmd_tree(args) -> None:
    """The tree as an indented outline, for reading the index yourself."""
    store = open_store(args)
    meta = resolve_doc(store, args.doc)
    tree = store.get_tree(meta["id"]) or []
    counts = {"nodes": 0, "summarized": 0}

    def show(nodes, depth=0):
        for node in nodes:
            counts["nodes"] += 1
            summary = node.get("summary")
            if summary:
                counts["summarized"] += 1
            if args.depth and depth >= args.depth:
                continue
            units = f"{node['start_index']}-{node['end_index']}"
            mark = " " if summary else "!"
            line = (f"{mark} {node.get('node_id')} {'  ' * depth}"
                    f"{node.get('title')}  [{units}]")
            if args.summary and summary:
                line += f"\n    {'  ' * depth}{summary[:args.width]}"
            print(line)
            show(node.get("nodes") or [], depth + 1)

    print(f"# {meta['name']} — {meta.get('pageNum')} units, "
          f"{meta.get('metadata', {}).get('structure_source')}")
    if meta.get("description"):
        print(f"# {meta['description']}")
    show(tree)
    print(f"# {counts['summarized']}/{counts['nodes']} nodes summarized "
          f"(a leading ! marks one without a summary)")


def viewer_nodes(nodes: list) -> list:
    return [{"id": node.get("node_id"), "title": node.get("title"),
             "summary": node.get("summary"),
             "start": node.get("start_index"), "end": node.get("end_index"),
             "nodes": viewer_nodes(node.get("nodes") or [])}
            for node in nodes]


def cmd_html(args) -> None:
    """A self-contained page of the stored trees, to read in a browser.

    Everything is inlined, so the file works offline and nothing about the
    documents leaves the machine.
    """
    template = Path(__file__).with_name("viewer.html")
    if not template.is_file():
        fail(f"Missing the page template: {template}")
    store = open_store(args)
    metas = sorted(store.list_metas(), key=lambda meta: str(meta.get("name")))
    if args.doc:
        metas = [resolve_doc(store, name) for name in args.doc]
    if not metas:
        fail(f"No documents in {store_dir(args)}")

    documents = []
    for meta in metas:
        documents.append({
            "name": meta.get("name"),
            "description": meta.get("description"),
            "units": meta.get("pageNum"),
            "source": (meta.get("metadata") or {}).get("structure_source"),
            "nodes": viewer_nodes(store.get_tree(meta["id"]) or []),
        })
    payload = json.dumps({"generated": now_iso(), "store": store_dir(args),
                          "documents": documents}, ensure_ascii=False)
    # the payload sits in a <script type="application/json">, so the only
    # sequence that could break out of it is a literal closing script tag
    payload = payload.replace("</", "<\\/")
    out = Path(os.path.abspath(os.path.expanduser(args.out)))
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(template.read_text(encoding="utf-8")
                   .replace("__DATA__", payload), encoding="utf-8")
    emit({"out": str(out), "documents": len(documents),
          "bytes": out.stat().st_size})


# ── retrieval ────────────────────────────────────────────────────────────

def run_tool(args, name: str, arguments: dict) -> None:
    from pageindex.agent_tools import call_tool
    envelope, is_error = call_tool(open_client(args), name, arguments)
    print(envelope)
    if is_error:
        raise SystemExit(1)


def cmd_list(args) -> None:
    run_tool(args, "browse_documents", {"limit": args.limit})


def drop_key(value, key: str):
    if isinstance(value, list):
        return [drop_key(item, key) for item in value]
    if isinstance(value, dict):
        return {name: drop_key(item, key)
                for name, item in value.items() if name != key}
    return value


def cmd_structure(args) -> None:
    from pageindex.agent_tools import call_tool
    store = open_store(args)
    meta = resolve_doc(store, args.doc)
    arguments = {"doc_name": meta["name"]}
    if args.part:
        arguments["part"] = args.part
    envelope, is_error = call_tool(open_client(args),
                                   "get_document_structure", arguments)
    # the line spans are internal bookkeeping, not routing information
    print(json.dumps(drop_key(json.loads(envelope), "lines"),
                     ensure_ascii=False))
    if is_error:
        raise SystemExit(1)


def cmd_page(args) -> None:
    store = open_store(args)
    meta = resolve_doc(store, args.doc)
    run_tool(args, "get_page_content",
             {"doc_name": meta["name"], "pages": args.pages})


def cmd_remove(args) -> None:
    store = open_store(args)
    meta = resolve_doc(store, args.doc)
    removed = store.delete_document(meta["id"])
    emit({"doc_id": meta["id"], "name": meta["name"], "removed": removed})


# ── cli ──────────────────────────────────────────────────────────────────

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="pi", description=__doc__.splitlines()[0])
    parser.add_argument("--store", help="store directory "
                        f"(default: $PAGEINDEX_STORE or {default_store()})")
    sub = parser.add_subparsers(dest="command", required=True)

    probe = sub.add_parser("probe", help="report the PDF's text layer and "
                                         "whether it needs page images")
    probe.add_argument("pdf")
    probe.set_defaults(func=cmd_probe)

    render = sub.add_parser("render", help="write page images to read")
    render.add_argument("pdf")
    render.add_argument("--out", required=True)
    render.add_argument("--pages", help="e.g. 1-20,25 (default: all)")
    render.add_argument("--scale", type=float, default=2.0)
    render.set_defaults(func=cmd_render)

    index = sub.add_parser("index", help="index a PDF into the store")
    index.add_argument("pdf")
    index.add_argument("--md", help="directory of page-NNNN.md files to use "
                                    "as the page text instead of the text layer")
    index.add_argument("--name", help="stored name (default: the file name)")
    index.add_argument("--replace", action="store_true",
                       help="replace a document already stored under that name")
    index.set_defaults(func=cmd_index)

    adoc = sub.add_parser("index-adoc",
                          help="index a directory of AsciiDoc files as one "
                               "document")
    adoc.add_argument("dir")
    adoc.add_argument("--name", help="stored name (default: the directory name)")
    adoc.add_argument("--replace", action="store_true",
                      help="replace a document already stored under that name")
    adoc.add_argument("--block-lines", type=int, default=60,
                      help="lines per read unit (default: 60)")
    adoc.add_argument("--no-recurse", action="store_true",
                      help="only the .adoc files directly in the directory")
    adoc.set_defaults(func=cmd_index_adoc)

    nodes = sub.add_parser("nodes", help="nodes and their text, for writing "
                                         "summaries")
    nodes.add_argument("doc")
    nodes.add_argument("--leaves", action="store_true",
                       help="only nodes without children")
    nodes.add_argument("--parents", action="store_true",
                       help="only nodes with children")
    nodes.add_argument("--ready", action="store_true",
                       help="only nodes whose children all have a summary, so "
                            "parents can be summarized bottom-up in rounds")
    nodes.add_argument("--all", action="store_true",
                       help="include nodes that already have a summary")
    nodes.add_argument("--no-text", action="store_true")
    nodes.add_argument("--max-chars", type=int, default=6000)
    nodes.set_defaults(func=cmd_nodes)

    summaries = sub.add_parser("set-summaries",
                               help="write summaries into the stored tree")
    summaries.add_argument("doc")
    summaries.add_argument("--from", dest="file", required=True,
                           help='JSON: {"document": "...", '
                                '"nodes": {"0001": "..."}}')
    summaries.set_defaults(func=cmd_set_summaries)

    tree = sub.add_parser("tree", help="the tree as an indented outline")
    tree.add_argument("doc")
    tree.add_argument("--summary", action="store_true",
                      help="print each node's summary under its title")
    tree.add_argument("--depth", type=int,
                      help="stop at this depth (default: the whole tree)")
    tree.add_argument("--width", type=int, default=120,
                      help="characters of summary to print (default: 120)")
    tree.set_defaults(func=cmd_tree)

    html = sub.add_parser("html", help="write a browsable page of the trees")
    html.add_argument("--out", required=True, help="the .html file to write")
    html.add_argument("--doc", action="append",
                      help="only this document (repeatable; default: all)")
    html.set_defaults(func=cmd_html)

    retrieve = sub.add_parser("retrieve",
                              help="rank the indexed sections against a "
                                   "question, without running a model")
    retrieve.add_argument("query")
    retrieve.add_argument("--doc", action="append",
                          help="restrict to this document (repeatable)")
    retrieve.add_argument("--top", type=int, default=12,
                          help="how many sections to return (default: 12)")
    retrieve.set_defaults(func=cmd_retrieve)

    read = sub.add_parser("read", help="the full text of named sections")
    read.add_argument("doc")
    read.add_argument("--nodes", action="append", required=True,
                      help="node ids, comma-separated (repeatable)")
    read.set_defaults(func=cmd_read)

    listing = sub.add_parser("list", help="documents in the store")
    listing.add_argument("--limit", type=int, default=50)
    listing.set_defaults(func=cmd_list)

    structure = sub.add_parser("structure",
                               help="the tree, titles and summaries only")
    structure.add_argument("doc")
    structure.add_argument("--part", type=int,
                           help="page of a tree too large for one response")
    structure.set_defaults(func=cmd_structure)

    page = sub.add_parser("page", help="the text of specific pages")
    page.add_argument("doc")
    page.add_argument("--pages", required=True, help="e.g. 12 or 12-18")
    page.set_defaults(func=cmd_page)

    remove = sub.add_parser("remove", help="delete a document from the store")
    remove.add_argument("doc")
    remove.set_defaults(func=cmd_remove)
    return parser


def main(argv: list[str]) -> None:
    args = build_parser().parse_args(argv)
    if getattr(args, "leaves", False) and getattr(args, "parents", False):
        fail("--leaves and --parents select disjoint sets; pass neither for all")
    args.func(args)


if __name__ == "__main__":
    main(sys.argv[1:])
