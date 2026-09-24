# Burch Contracting

The website at **https://burchcontracting.com** — 71 static pages generated from
data, served by a Cloudflare Worker.

Nothing in `dist/` is written by hand, and nothing generated is committed.

## Getting started

Node 22 (see `.nvmrc`).

```bash
npm install
npm run dev            # dev server
```

## Build and check

```bash
BUILD_ENV=production npm run build
npm test
```

`npm test` runs every gate: `check-build`, `check-schema`, `check-links`,
`check-tier1`, `check-wrangler-config`, and `check-routing` against a
`wrangler dev` it starts and stops itself. (`check-crawler-access` needs the
live site, so it runs daily and on deploy instead.) It is the same command CI runs. Use `npm test -- --no-routing`
to skip the Worker.

The build must run first — the gates read `.build/pages/` and `dist/`, and on
their own they will validate a previous build's output.

`npm run preview` serves the built site at http://localhost:4173.

## Making a change

1. Edit the data, not the output. `docs/ARCHITECTURE.md` says where each kind of
   fact lives.
2. `BUILD_ENV=production npm run build && npm test`
3. `node scripts/dates-set-by-head.mjs` — lists which pages will tell Google
   they changed today. If that is not true, add a `Content-Change: none` trailer
   to the commit.
4. Open a PR. **Merge it with a merge commit. Never squash, never rebase** —
   `docs/RUNBOOK.md` explains what a squash does to every page's content date.

## Deploying

Actions tab → **Deploy** → Run workflow. Pushing to `main` does not deploy: the
push trigger is commented out. The verify-and-rollback path it was waiting on
has since run many times (every dispatch from 2026-09-22 on; the rollback
worked on the first real failure), so **whether to turn on deploy-on-push is
now an open owner decision**, not a technical precondition. The workflow
builds, runs every gate, deploys, verifies against production, and rolls back
automatically if any check fails.

**Read `docs/RUNBOOK.md` before your first deploy.**

## Prices

`src/js/calculator-config.js` is the single authoritative source for every
dollar figure on this site. Read [PRICING.md](PRICING.md) before changing any
rate or the overhead-and-profit percentage. `check-build` fails when prose and
computed prices disagree.

## Layout

```
src/data/        the facts: services, cities, guides, pricing, nav, URLs
src/templates/   the <main> body of each hand-authored page
src/chrome/      one <head>, one header, one footer, for every page
src/build/       pure render() per page type; index.mjs is the one entry point
src/js|css/      client-side behaviour and Tailwind
cloudflare/      the Worker, the API, the redirect and header tables
scripts/         the gates, the snapshot tool, the deploy helpers
migration/       routing baseline, legacy URL list, and the pre-change search baselines
.github/         CI, the Deploy workflow, the daily crawler-access check
public/          images and files copied verbatim
docs/            the four documents below, plus archive/
404.html         the only .html outside src/templates/, and deliberately so
```

## Documentation

| | |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How a page gets built, where each fact lives, which gate reads which tree |
| [docs/RUNBOOK.md](docs/RUNBOOK.md) | Deploy, roll back, rotate a secret, add a service or city, change a URL, add a gate |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Dated record of every non-obvious choice, and the incident behind it |
| [PRICING.md](PRICING.md) | How pricing is computed and what you may change |

`docs/archive/` holds the superseded documents, unedited. `DECISIONS.md` is the
index of *why*; the archive is the record of *what*.

## Stack

Vite 8, Tailwind CSS 4, Cloudflare Workers + D1, Resend for mail. No framework.
