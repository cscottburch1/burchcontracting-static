# Runbook

How to operate this site: deploy, verify, roll back, rotate a secret, add a
page, add a service, add a city.

> **This file is a stub.** Phase 7 of the 2026-09-21 cleanup writes it in full.
> The Deploy section below exists ahead of that because merging PR #22 the wrong
> way would damage the site's search presence, and the instruction needed to be
> written down before that merge, not after it.

---

## Deploy

### 1. Never squash-merge or rebase-merge this repository

**Merge commits only. Every PR, no exceptions.**

Content dates are derived from git history at build time, so the shape of the
history is a content decision. A squash commit replaces a branch with one commit
that touches every file the branch touched, making it the newest touch on every
template and every data file. Every page then takes its `dateModified` from it,
and the sitemap tells Google that all seventy URLs changed on merge day — which
is the single worst thing you can do to `lastmod` credibility, and it happens
after every gate has already passed.

This cannot be enforced from inside the repo. It is a GitHub setting:

> Settings → General → Pull Requests → uncheck **Allow squash merging** and
> **Allow rebase merging**

Leave "Allow merge commits" checked. See `docs/DECISIONS.md`, 2026-09-22, for
the incident that prompted this — the same bug at nine pages instead of seventy.

### 2. Before you push: check what will claim today's date

```
node scripts/dates-set-by-head.mjs
```

It lists every URL whose `dateModified` will be set by the current HEAD. If the
commit did not actually change what a reader sees on those pages, mark it:

- add a `Content-Change: none` trailer to the commit message (amend if unpushed), or
- add the commit hash to `mechanicalCommits` in `src/data/content-date-overrides.json`, with a reason.

This is an aid, not a gate. `check-build`'s check 9 catches a whole site stamped
with today, which is what a shallow CI checkout produces; it deliberately does
not fire on a handful of pages, because a handful of genuinely edited pages is
an ordinary day and nothing in the data distinguishes the two.

### 3. Build and verify

```
BUILD_ENV=production npm run build
npm test
```

`npm test` is every gate: `check-build` (which includes the noindex scan),
`check-schema`, `check-links`, `check-wrangler-config`, and `check-routing`
against a `wrangler dev` it starts and tears down itself. It is the same
command CI runs, so green locally and green in CI mean the same thing.

Use `npm test -- --no-routing` to skip the Worker if you only touched content.

The build must run first. The gates read `.build/pages/` and `dist/`; run on
their own they will happily validate a previous build's output — which has
happened twice, when a `vite preview` or `wrangler dev` held a Windows file
lock on `dist/`, the build failed with `EPERM`, and the gates passed against
yesterday's files.

### 3a. Never connect the Cloudflare dashboard Git integration

**Workers & Pages → the Worker → Builds must never be connected to this repo.**

On 2026-09-16 it was. It deployed on every push, built without the indexing
flag the model then required, and carried none of the `wrangler secret put`
secrets. Every push shipped noindex on all 70 pages and wiped all five Worker
secrets, taking down admin login and lead emails and silently disabling the
reCAPTCHA check while the contact form kept accepting submissions.

`scripts/check-wrangler-config.mjs` fails the build if a `build` block appears
in `wrangler.jsonc`, which is how that integration configures itself. The
dashboard setting itself is invisible from inside the repo, so this line is the
only guard against it.

### 4. Deploy

Actions tab → **Deploy** → Run workflow. `.github/workflows/deploy.yml` is the
only thing that deploys, and its push trigger is commented out.

It builds, runs every gate, deploys with `wrangler deploy`, and then verifies
against production: exactly the five Worker secrets, the new commit answering,
five representative pages returning 200 with `index, follow` and their own
canonical, `check-routing`, `check-crawler-access`, and a HEAD on both contact
endpoints returning 405. **Any failure rolls the Worker back automatically and
then fails the job.** A rolled-back deploy is a failed deploy and shows red.

**The push trigger has never run.** Enabling it would make the first exercise of
an unproven deploy path a real deploy of whatever just merged. Run it once with
Run workflow, confirm it goes green, then uncomment the two `push:` lines in
`deploy.yml` if you want it automatic. The workflow header has the same
instructions.

### 5. Rollback is `wrangler rollback` — not deleting the Worker route

Phase 4 deleted the Hostinger FTP deploy, so Hostinger no longer receives a copy
of the site and is **not** a fallback. `wrangler.jsonc` still notes that removing
the Worker route sends traffic back to Hostinger; that is true and it is now the
wrong move — it would serve a copy frozen at 2026-09-22.

Roll back to a previous Worker version instead:

```
npx wrangler rollback
```

Hostinger remains the domain registrar and DNS origin, and holds an old mail
store, until December 2026. `/.well-known/*` is forwarded to it for certificate
renewal and is the only request path that still reaches it.

---

## Everything else

To be written in Phase 7: verify a deploy; rotate each secret including the
reCAPTCHA two-halves rule; add a service; add a city; add a cost guide or
article; change a URL (the answer is "don't"); what to do when
`crawler-access` fails; what to do when the Cloudflare deploy fails partway; how to add a
gate (including: a tamper must be proven to create the failure condition, not
just to have edited the file); which gate reads which tree; and the ranked
content queue.
