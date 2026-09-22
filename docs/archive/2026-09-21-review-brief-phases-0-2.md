# Review brief — burchcontracting-static cleanup, Phases 0–2

**Status:** open review request, written 2026-09-21 against
`cleanup/one-source-of-truth` @ `4e3a776`. Becomes history once addressed; it
lives in `docs/archive/` because that directory is where dated reports belong
and because it is the one place exempt from the Phase 8 cleanliness grep — this
document necessarily names `burchcontracting-dev`, `BUILD_ENV=production`,
`flip-noindex`, `.htaccess` and `PHPMailer`, and would otherwise fail it.

You are reviewing work another agent did on this repo. You have full repo
access. **Verify; do not take this document at face value.** It was written by
the agent whose work you are checking, so treat every claim in it as something
to confirm against the code, the git history and the gates.

Priority order: correctness of the indexing inversion, then content loss, then
accuracy of the documentation that was written.

---

## 1. What to review

Six commits. Three landed on `main` earlier the same day; three are the cleanup
branch.

```
main:
  7cfd664  fix(seo): correct sitemap lastmod and refresh content dates
  392694c  docs(deploy): BUILD_ENV=production is required on check-build too
  b292d1f  chore(git): ignore .claude/settings.local.json

cleanup/one-source-of-truth (branched from main at b292d1f):
  fcc1831  chore: flatten repo, normalize line endings, pin Node 22, archive dated docs
  4e3a776  fix(seo): make index,follow the default; noindex only by explicit staging build
  <HEAD>   docs: add this brief; keep new scripts clean for the Phase 8 grep
```

The third branch commit is the one that adds this file, so it cannot cite its
own hash — take it from `git log`. Besides this brief it reworded two comments
in `scripts/apply-staging-noindex.mjs` and `scripts/snapshot-dist.mjs` that
would have failed the Phase 8.3 cleanliness grep. No behaviour change; worth a
glance to confirm that.

The governing plan is `Claude Prompts/CLAUDE-CODE-CLEANUP-PROMPT2.md`. **That
folder is gitignored**, so it is on the owner's disk but not in the repo — ask
for it if you need the full text. Its hard invariants are the bar:

1. **Zero URL changes.** Every sitemap URL (70) returns 200 before and after;
   every `migration/routing-baseline.json` entry resolves as recorded, zero
   differences; `check-routing` must pass before any commit touching routing,
   redirects, the worker or url-map.
2. **Zero content loss.** No page loses visible text, FAQs, tables, schema
   types, images or internal links. Whitespace and attribute-order differences
   are acceptable; anything else must be justified in the commit message.
3. **Zero pricing changes** unless they come from `src/js/calculator-config.js`
   via `src/data/pricing-sync.js`.
4. **Zero secrets in the repo**, and never run `wrangler deploy`,
   `wrangler secret`, or any FTP action.
5. **No deletion without a replacement or a git-history note.**
6. **Read before write** — file headers and `docs/archive/` are a landmine map;
   every "this was tried and failed" comment is load-bearing.

Phases 3–8 are NOT done.

---

## 2. How to re-run every gate yourself

From the repo root. Nothing here deploys.

```bash
npm ci
npm run build                 # plain: no BUILD_ENV, this is now the production build
npm run check-build

# content-loss gate
node scripts/snapshot-dist.mjs /tmp/after.json
node scripts/snapshot-dist.mjs --diff <baseline.json> /tmp/after.json

# routing parity (needs a local worker)
npx wrangler dev --port 8794 --local --persist-to /tmp/wstate
node scripts/check-routing.mjs http://127.0.0.1:8794
```

Expected: check-build passes; check-routing compares **481 paths, zero
differences**, 79 "notes" (paths not in the baseline — not failures); snapshot
diff reports 71 pages identical.

**Regenerating the Phase 0 baseline:** it was taken at `b292d1f` and lives only
in a scratch dir. To reproduce it, `git stash` any work, `git checkout b292d1f`,
`npm run build` with `BUILD_ENV=production` (that commit predates the
inversion), snapshot it, then return to the branch and snapshot again. The two
must match.

**`wrangler dev` cleanup matters.** It leaves process trees behind; killing
`workerd.exe` alone makes the parent respawn it, which then blocks `rm -rf dist`
with `Device or resource busy` and fails the next build with `ENOTEMPTY`. Kill
the roots:

```powershell
Get-CimInstance Win32_Process -Filter "Name='node.exe' or Name='workerd.exe'" |
  Where-Object { $_.CommandLine -like '*wrangler*' -or $_.Name -eq 'workerd.exe' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

---

## 3. What changed

### Phase 1 — `fcc1831`

- Project moved from `burchcontracting-dev/` to the repo root. 185 files via
  `git mv`.
- `.gitattributes` (`* text=auto eol=lf`) + full `git add --renormalize`, plus
  `.editorconfig`.
- Node pinned once in `.nvmrc` (22); all three workflows read
  `node-version-file`. `deploy.yml` had been on 20, `cloudflare.yml` on 22.
- Workflow paths fixed: `working-directory` removed, `cache-dependency-path` and
  the FTP `local-dir` repointed.
- `package.json` renamed to `burchcontracting-static`, `engines.node >=22`.
- 17 dated documents moved to `docs/archive/` unedited; `migration/` reduced to
  `legacy-urls.txt`, `routing-baseline.json`, `baseline-2026-09.md`.
- `docs/DECISIONS.md` written — 18 entries harvested from those documents
  before they were moved.

### Phase 2 — `4e3a776`

The indexing model was inverted. Previously all source pages carried
`noindex, nofollow` and `flip-noindex-production.mjs` rewrote `dist/` to
`index, follow` only when `BUILD_ENV=production` — so correctness depended on
remembering a variable, and forgetting it de-indexed all 70 pages.

- 70 source pages and all three `seoHead()` emitters (`scripts/page-chrome.mjs`,
  `scripts/generate-services.mjs`, `scripts/generate-geo-aeo.mjs`) now emit
  `index, follow`. `404.html` keeps `noindex` permanently.
- `flip-noindex-production.mjs` deleted, replaced by
  `scripts/apply-staging-noindex.mjs` which injects noindex only when
  `BUILD_ENV=staging`, and exits 1 if any page has no robots meta to replace.
- `BUILD_ENV=production` removed from both workflows and the documented hand
  sequence.
- `cloudflare/worker.js`: `fetch` body extracted into `route()`; the export now
  wraps it with `applyIndexingPolicy()`, which sets
  `X-Robots-Tag: noindex, nofollow` on any hostname that is not
  `burchcontracting.com`.
- `check-build` assertion 3 inverted and now runs on **every** build. Fails on a
  stray noindex in a normal build, a missing noindex in a staging build, or a
  blanket `Disallow: /` in `dist/robots.txt`.

---

## 4. Scrutinize these specifically

This is the part worth your time. Each item is something the author was least
certain about, or a place where the gates are weakest.

**4.1 — The `route()` extraction uses a bare block.**
`cloudflare/worker.js` wraps the original fetch body in `{ ... }` purely to
avoid re-indenting it, so the diff stays readable. It is valid JavaScript and
the file parses, but it is unusual. Confirm the control flow is genuinely
unchanged and that every original `return` path still returns.

**4.2 — `applyIndexingPolicy` early-returns when `X-Robots-Tag` already exists.**
The reason given is that `cloudflare/api.js` sets its own on admin pages and it
is already at least as restrictive. The author checked this: `api.js` has
exactly one `X-Robots-Tag`, at line 381, and it is `noindex, nofollow`. So the
early return is safe today. What is worth your confirmation is whether that
grep is exhaustive — a header set indirectly, via a spread or a helper, would
not show up that way. If any path can produce a permissive value, this early
return would preserve it on a preview host.

**4.3 — The `X-Robots-Tag` branch cannot be tested through `wrangler dev`.**
With a `routes` config, wrangler rewrites `request.url` to the route host, so
the Worker always sees `burchcontracting.com` locally regardless of the `Host`
header sent. The author verified the branch by temporarily pointing
`INDEXABLE_HOST` at a non-matching value, observing the header appear, then
reverting. **Confirm no debug code survived:** `grep -rn "X-Debug-Host\|
example.invalid" cloudflare/` must return nothing, and `INDEXABLE_HOST` must be
`'burchcontracting.com'`. This header is unverified in a real multi-host
environment and should be re-checked on a `workers.dev` preview URL when one
exists.

**4.4 — The snapshot gate compares links as a SET, not a sequence.**
`scripts/snapshot-dist.mjs` dedupes and sorts internal links, and deep-sorts
JSON-LD keys. This is deliberate so attribute order and link order never cry
wolf — Phase 6 reorders the nav on purpose. But it means a link that is lost in
one place and added in another, or a duplicate link, is invisible to the gate.
Judge whether that is an acceptable blind spot for Phase 3, which rewrites every
generator. If not, the gate needs strengthening before Phase 3, not after.

**4.5 — The snapshot gate excludes `dist/api/**`.**
Justification: that tree is the Hostinger PHP copied out of `public/`, not site
pages, and Phase 4 deletes it. Verify the exclusion cannot hide a real page.

**4.6 — `apply-staging-noindex.mjs` exits 1 on any page it cannot mark.**
Intended as fail-closed. Confirm it cannot fail a legitimate build — e.g. a page
type that correctly has no robots meta.

**4.7 — `deploy.yml` (Hostinger FTP) now builds with no `BUILD_ENV`.**
Under the new model a plain build is production-correct, so Hostinger should
still receive indexable pages. Confirm that is true and that removing the
`env:` block did not change what gets uploaded.

**4.8 — `docs/DECISIONS.md` contains 18 factual claims about history.**
They were written by reading `docs/archive/` and script headers. Spot-check the
load-bearing ones against the sources, particularly: the 2026-09-16 Git
integration incident, the `wrangler versions upload` secret wipe, the
`covered-patios` 404, and the claim that the legal-page date override has been
lost three times (`docs/archive/FINDINGS.md` #8 documents two; the third was
this session).

**4.9 — The renormalize touched every tracked file.**
Confirm it changed line endings only and no content. Suggested check: for files
in `fcc1831`, compare CR-stripped hashes across the commit boundary.

**4.10 — 185 files moved. Confirm nothing was lost.**
Tracked file counts are 191 at `b292d1f`, 195 at `fcc1831`, 195 at `4e3a776`.
The +4 should account exactly as: five files added (`.gitattributes`,
`.editorconfig`, `.nvmrc`, `docs/DECISIONS.md`, `scripts/snapshot-dist.mjs`)
minus one removed (`burchcontracting-dev/.gitignore`, merged into the root one).
Phase 2 is net zero because `flip-noindex-production.mjs` was replaced by
`apply-staging-noindex.mjs`. Confirm the arithmetic AND that the identities
match — a count can balance while a real file was swapped for a different one.
`git diff --stat --diff-filter=D b292d1f 4e3a776` should show only that one
deletion plus the replaced script.

---

## 5. Known deviations and open items

- **`burchcontracting-dev/` still exists on disk** as three empty, gitignored
  directory shells (`.wrangler`, `dist`, `node_modules`). The agent's shell cwd
  is pinned inside it by the harness, which locks it. No tracked file remains —
  `git ls-files burchcontracting-dev/` is empty — so the commits are correct.
  Needs a session restart or a manual delete.
- **`Claude Prompts/` was deliberately not committed.** `git add -A` swept it in;
  it was unstaged and added to `.gitignore` alongside the empty
  `baseline-2026-09/` and `SEO_GEO Reports/`. The owner may want it tracked.
- **`README.md` still describes the old layout** beyond one corrected path line.
  Phase 7 rewrites it from scratch.
- **`docs/DECISIONS.md` has a Phase 1 entry but no Phase 2 entry yet.** The plan
  puts per-phase entries in Phase 7; Phase 1's was written inline. Inconsistent
  but not wrong.
- **The "357 routing URLs" figure** quoted in `docs/archive/CLOUDFLARE-CUTOVER.md`
  and in the original cleanup prompt is stale. The baseline was re-recorded from
  production on 2026-09-12 and holds 402 entries; `check-routing` compares 481
  paths. The gate is zero differences, not a count.
- **`dist/api/**` ships the Hostinger PHP tree to Cloudflare** — PHPMailer, the
  admin PHP, `schema.sql`. It is NOT reachable: `worker.js` intercepts every
  `/api/*` before any asset lookup and `api.js` 404s unknown routes. Phase 4
  deletes it. Confirm the unreachability claim independently if you can.

---

## 6. What a useful review looks like

Run the gates first; if any fails, that outranks everything below.

Then judge, in order:

1. Does the indexing inversion actually make the failure mode impossible, or
   does it move it? Is there any path by which a normal build ships noindex, or
   a staging/preview host serves indexable pages?
2. Is there any content loss the snapshot gate would not catch (see 4.4)?
3. Are the claims in `docs/DECISIONS.md` and in the commit messages accurate? A
   confidently wrong comment is worse than no comment, because the next person
   will trust it.
4. Is the repo in a state where Phase 3 — which rewrites every generator and
   deletes 40+ committed HTML files — can proceed safely?

Report what is wrong and what you verified as correct. If you disagree with a
decision rather than finding a defect, say so separately — the author would
rather hear it than not, but the two should not be mixed.
