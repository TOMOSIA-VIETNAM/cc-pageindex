# pageindex landing page

The public site for the skill, deployed at <https://pagindex.vercel.app>. Next.js,
in English at `/`, Vietnamese at `/vi` and Japanese at `/ja`. `/en` redirects to `/`, so
the English page has one address.

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

Production is <https://pagindex.vercel.app>, Vercel project `pageindex` in the
`minhtang1s-projects` scope. It is deployed from a machine, not from Git: there is no Git
integration, so a push deploys nothing. The build must run here, next to `../example/`,
which is why it is built locally and only the output is uploaded:

```bash
cd webapp
npx vercel build --prod
timeout 300 npx vercel deploy --prebuilt --prod
```

`npx vercel login` once per machine; `npx vercel link --project pageindex` once per clone.

### The commit at HEAD decides whether Vercel accepts the deploy

Vercel reads the Git commit at `HEAD` and deploys only if that commit's author email
belongs to a member of the Vercel project. A commit made on this machine carries the
local `git config user.email`, which does. A merge commit made with GitHub's
**Merge** button carries the GitHub noreply address
(`<id>+<login>@users.noreply.github.com`), which Vercel cannot match, and the deploy is
**blocked**: the CLI prints a URL and returns, but the deployment never goes live.

So:

- Deploy from a commit made locally. To merge a pull request, merge it locally and push,
  and GitHub marks the pull request merged by itself:

  ```bash
  git checkout main && git pull --ff-only
  git merge --no-ff feat/<branch>
  git push origin main
  ```

  Do not use GitHub's Merge button for a commit that will be deployed. If one was used,
  make the next change locally before deploying.
- Before deploying, check `git log -1 --format='%ae'` prints the local email, not a
  `users.noreply.github.com` address.
- After deploying, confirm it is live rather than trusting the CLI's exit:
  `npx vercel inspect <deployment url>` must say `Ready`. `UNKNOWN` there means blocked;
  the Vercel dashboard, or the deployment's `readyStateReason` from the API, says why.
  Then `curl -I https://pagindex.vercel.app/robots.txt` should answer 200.

Linking the GitHub account to the Vercel account (Vercel → Account Settings →
Authentication) makes GitHub's own commits acceptable too, but the rules above hold
either way.
