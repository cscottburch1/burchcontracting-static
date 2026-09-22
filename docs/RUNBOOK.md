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
npm run check-build
```

`BUILD_ENV=production` is required on both. The build must run before
`check-build`, which reads `.build/pages/` and `dist/`; run on their own they
will happily validate a previous build's output.

### 4. Deploy

A human runs the deploy, by hand. Automated deploy paths have taken this site
down. The full procedure, rollback, and secret rotation are Phase 7 additions.

---

## Everything else

To be written in Phase 7: verify; rollback (`wrangler rollback`); rotate each
secret including the reCAPTCHA two-halves rule; add a service; add a city; add a
cost guide or article; change a URL (the answer is "don't"); what to do when
`crawler-access` fails; what to do when `deploy` auto-rolls back; how to add a
gate (including: a tamper must be proven to create the failure condition, not
just to have edited the file); which gate reads which tree; and the ranked
content queue.
