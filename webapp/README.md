# pageindex landing page

The public site for the skill, deployed at <https://pagindex.vercel.app>. Next.js,
in English, Vietnamese and Japanese (`/en`, `/vi`, `/ja`; `/` redirects by
`Accept-Language`).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Where the sample comes from

The interactive graph is the real viewer page, not a copy of it. `pi.py html` writes
`../example/preview-node-index.html` from the example store; `scripts/sync-demo.mjs`
copies it to `public/demo/shokunin.html` before every `dev` and `build`, and the site
embeds it with `?embed`. The numbers and section titles on the page are read from the
same file (`src/lib/demo.ts`), so they cannot drift from the graph.

To change the sample, regenerate the example from the repository root:

```bash
skills/pageindex/.venv/bin/python skills/pageindex/tools/pi.py \
  --store example/pageindex html --out example/preview-node-index.html
```

The recorded question on the page (`exampleRun` in `src/lib/demo.ts`) holds the
section ids and scores `pi.py retrieve` returned for it; its wording and answer live
in the dictionaries under `src/i18n/`.

## Copy

`src/i18n/en.ts` is the reference; `vi.ts` and `ja.ts` are typed against it, so a
missing or extra key fails the build.

## Deploying

A Vercel project with **Root Directory** set to `webapp`. The build reads
`../example/`, so the project must keep Vercel's default of including files outside
the root directory.
