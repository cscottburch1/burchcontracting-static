# Runbook

How to operate this site. Read `ARCHITECTURE.md` first if you have not; this
assumes you know where things live.

Every rule here has an incident behind it. `DECISIONS.md` has the accounts.

---

## Merging

**Merge commits only. Never squash, never rebase. Every PR, no exceptions.**

Content dates are derived from git history at build time, so the shape of the
history is a content decision. A squash commit replaces a branch with one commit
that touches every file the branch touched, making it the newest touch on every
template and data file. Every page then takes its `dateModified` from it, and
the sitemap tells Google that all seventy URLs changed on merge day — after
every gate has already passed.

This cannot be enforced from inside the repo. It is a GitHub setting:

> Settings → General → Pull Requests → uncheck **Allow squash merging** and
> **Allow rebase merging**

---

## Before you push

```
BUILD_ENV=production npm run build
npm test
node scripts/dates-set-by-head.mjs
```

`npm test` is every gate: `check-build` (which contains the noindex scan),
`check-schema`, `check-links`, `check-wrangler-config`, and `check-routing`
against a `wrangler dev` it starts and tears down itself. Same command CI runs.
`npm test -- --no-routing` skips the Worker if you only touched content.

The build must run first. The gates read `.build/pages/` and `dist/`; on their
own they will validate a previous build's output.

`dates-set-by-head.mjs` lists every URL whose `dateModified` will be set by your
commit. If the commit did not change what a reader sees on those pages, mark it:

- add a `Content-Change: none` trailer to the commit message (amend if unpushed), or
- add the hash to `mechanicalCommits` in `src/data/content-date-overrides.json`.

---

## Deploy

**Actions tab → Deploy → Run workflow.** `.github/workflows/deploy.yml` is the
only thing that deploys.

It builds, runs every gate, runs `wrangler deploy`, then verifies against
production: exactly the five Worker secrets by name, the new commit answering,
five representative pages at 200 with `index, follow` and their own canonical,
every built page byte-for-byte, `check-routing`, `check-crawler-access`, and a
HEAD on both contact endpoints returning 405. **Any failure rolls the Worker
back automatically and then fails the job.**

### The push trigger

Commented out. It was held back until the verify-and-rollback path had been
exercised; that has now happened (every dispatch since 2026-09-22 has run
verification, and the rollback worked on the first real failure). **Enabling
it is an open owner decision.** If the owner decides to: confirm the latest
dispatch went green, confirm `wrangler secret list` returns all five names and
live pages say `index, follow`, then uncomment the two `push:` lines.

### Never connect the Cloudflare dashboard Git integration

**Workers & Pages → the Worker → Builds must never be connected to this repo.**

On 2026-09-16 it was. It deployed on every push, built without the indexing flag
the model then required, and carried none of the `wrangler secret put` secrets.
Every push shipped `noindex` on all 70 pages and wiped all five Worker secrets —
taking down admin login and lead emails, and silently disabling the reCAPTCHA
check while the form kept accepting submissions.

`check-wrangler-config` fails the build if a `build` block appears in
`wrangler.jsonc`, which is how that integration configures itself. The dashboard
setting is invisible from here, so this paragraph is the only guard against it.

### Deploying by hand

If you must:

```
BUILD_ENV=production npm run build
npm test
npx wrangler deploy
```

Then run the verification yourself — at minimum `npx wrangler secret list`,
`node scripts/check-routing.mjs https://burchcontracting.com`, and
`node scripts/check-crawler-access.mjs https://burchcontracting.com`. Never
`wrangler versions upload` plus `versions deploy`: that promoted a version with
no secrets on 2026-09-16.

---

## Rollback

```
npx wrangler rollback
```

**Not** deleting the Worker route. `wrangler.jsonc` notes that removing the
route sends traffic back to Hostinger; that is true and it is the wrong move —
Hostinger's copy is frozen at 2026-09-22, when the FTP deploy was deleted.

### When deploy auto-rolls back

The job already rolled the Worker back; the site is serving the previous
version. The failure is in the verification step's log, and it names which check
failed.

1. Confirm the site is healthy:
   `node scripts/check-routing.mjs https://burchcontracting.com`
2. Read which check failed. **Secrets** means something wiped them — do not
   redeploy until you know what. **Version marker** usually means propagation
   was slow; re-dispatch once before investigating. **Routing** or **content
   mismatch** means the build and production disagree, which is a real defect.
3. Fix on a branch, let CI go green, merge, dispatch again.

Do not disable the verification step to get a deploy out.

---

## When `crawler-access` fails

`crawler-access.yml` requests pages as GPTBot, ClaudeBot, PerplexityBot and the
search crawlers, and expects 200 on every one. This is why the site is on
Cloudflare at all: Hostinger's server-level rate limit was returning 429 to AI
crawlers on 12 of 14 pages, not disableable per site.

A failure means something is refusing a crawler again. Check, in order:

1. Cloudflare → Security → Bots. A "Block AI bots" or "Bot Fight Mode" toggle
   will do exactly this.
2. Cloudflare → Security → WAF, for a rule matching user agents.
3. `dist/robots.txt` — `check-build` catches a blanket `Disallow: /`, but not a
   narrower one.
4. Whether the failing path 404s for everyone, not just crawlers.

---

## Rotating a secret

Five Worker secrets. `npx wrangler secret put NAME`. Secrets apply immediately,
so no redeploy is strictly needed — but the deploy verification is the only
thing that checks all five are present, so dispatch a deploy afterwards.

| Secret | What it is |
|---|---|
| `RESEND_API_KEY` | Resend API key; burchcontracting.com is the verified domain |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA v3 **secret** — see the two-halves rule below |
| `ADMIN_USERNAME` | username for the leads admin |
| `ADMIN_PASSWORD_HASH` | `node scripts/generate-admin-hash.mjs <password>` |
| `SESSION_SECRET` | any random 32+ character string |

Set them with the CLI, never the dashboard.

### The reCAPTCHA two-halves rule

A reCAPTCHA key is **a pair**, and the halves live in different places:

- the **site key** (public) in `src/templates/contact.html`, as
  `data-recaptcha-site-key`. That attribute is the only source of truth;
  `src/js/main.js` reads it from the DOM and nowhere else.
- the **secret key** as the `RECAPTCHA_SECRET_KEY` Worker secret.

**Rotate both together, from the same key pair in the reCAPTCHA console.** A
mismatched pair fails in the worst possible way: the form still accepts
submissions, verification just never succeeds, and nothing surfaces an error.

A `VITE_RECAPTCHA_SITE_KEY` GitHub Actions secret used to override the attribute
at build time. It drifted, and editing `contact.html` never worked because the
build secret always won. It is gone; do not reintroduce one. `check-build`'s
check 4 asserts the key appears in `dist/contact.html` and in no bundled JS.

---

## Adding a page, service, city or guide

**A service:** add an entry to `src/data/services.js`, FAQs under the same
`service.id` in `src/data/service-faqs.js`, and entries in both maps in
`src/data/service-comparison.js`. `check-build`'s check 7 fails if you miss any
of the three, and fails on a key matching no service. Add the URL to
`src/data/url-map.js`.

**A city:** add to `SERVICE_AREAS` in `src/data/geo-aeo.js` and to
`url-map.js`. Unanswered local facts render as a `FACT-NEEDED` line in the build
log rather than as invented text.

**A cost guide or article:** add to `src/data/guides-cost.js` or
`guides-articles.js`, and to `url-map.js`.

**Any new page** needs an inbound link from somewhere, or `check-links` reports
it as a sitemap orphan — correctly, because a page reachable only from the
sitemap is a page a visitor cannot find.

---

## Changing a URL

**Don't.** Every URL on this site was recovered once already, from Search
Console click data, after a rebuild changed them all.

If you genuinely must:

1. Change it in `src/data/url-map.js`. Nothing else defines URLs.
2. Add the old URL to `MOVED_URLS` in the same file so it 301s to the new one.
   Never delete a redirect; an old URL keeps earning clicks for years.
3. `npm run build && npm test`. `check-links` catches references to the old
   address; `check-schema` catches `@id` values still pointing at it.
4. **Re-record the routing baseline**, because it is recorded from production
   and production has not changed yet:
   ```
   node scripts/check-routing.mjs --record https://burchcontracting.com
   ```
   Do this **before** deploying, commit the diff with the reason, and expect it
   to show exactly the paths you meant to change and nothing else.
5. Deploy, then `node scripts/indexnow-submit.mjs` if the deploy did not.

---

## Adding a gate

1. **Write the assertion against the tree it should read.** `ARCHITECTURE.md`
   has the table. A check reading the wrong tree can be satisfied by a stale one.
2. **Prove it fails.** Every new assertion must be shown to fail at least once
   before it is trusted. An assertion that matches nothing passes forever and
   looks exactly like a working check — this repo has shipped three of those: a
   regex containing a literal backspace character where a word boundary was
   meant, a FAQ check that claimed both directions and did one, and a Service
   check reading a `url` field that no node on the site has.
3. **Tamper properly, which is two assertions, not one:**
   - the edit landed — re-read the file and confirm it is there;
   - the edit **created the failure condition** — the duplicate is actually
     duplicated, the key is actually absent, the two strings are actually equal.

   The second is the one that gets skipped. A duplicate-title tamper once used a
   title two words off from the real one, produced no duplicate, and reported a
   working gate — while that gate was in fact broken.
4. **Restore, and confirm the gate passes again.** Both directions, always. A
   gate that has only ever been run against a failing input is half-tested: the
   first real run of `deploy.yml` failed on a *correct* page, because
   `printf | grep -q` under `set -o pipefail` reports a match as a miss.
   `grep -q` closes the pipe on its first hit, the writer takes `EPIPE`, and
   `pipefail` turns that into a non-zero pipeline.
5. **Never `| grep -q` in a shell gate.** Use `[[ "$var" == *"needle"* ]]`.
   Every `run:` block on GitHub is `bash -eo pipefail`, and any consumer that
   can exit early — `grep -q`, `grep -m`, `head` — will orphan its writer and
   invert the result. Consumers that read to EOF (`sed`, `cut`, `sha256sum`, a
   `while read` loop) are fine.
6. Add it to `npm test` via `scripts/test.mjs`, and to the header comment in
   `check-build.mjs` if it lives there.

### Inventory: every gate, what it reads, where it runs

When a gate is added, removed or changes the tree it reads, update this table
in the same commit. "Proven" names where a deliberate failing run is recorded.

**Scripts**

| Script | Reads | Runs in | Proven |
|---|---|---|---|
| `check-build.mjs` | `.build/pages/`, `dist/`, `src/` (per check, below) | `npm test` → CI, Deploy | per tag, below |
| `check-schema.mjs` | `.build/pages/`, `dist/sitemap.xml` | `npm test` → CI, Deploy | `6da83d9` (failed on its first run: four homepage FAQ questions) |
| `check-links.mjs` | `.build/pages/`, `dist/sitemap.xml` | `npm test` → CI, Deploy | `6da83d9` (a link to a missing page; an unlinked sitemap URL) |
| `check-tier1.mjs` | `dist/` | `npm test` → CI, Deploy | 10 findings at 6.0 (`8177031`); tamper in `d5db1db` |
| `check-wrangler-config.mjs` | `wrangler.jsonc` | `npm test` → CI, Deploy | `6da83d9` (a `build` block; `run_worker_first` false) |
| `check-routing.mjs` | a running Worker + `migration/routing-baseline.json` | `npm test` (local `wrangler dev`); Deploy, against production | `5738512` (hostname redirects) |
| `check-crawler-access.mjs` | production | `crawler-access.yml` (daily), Deploy | none recorded |

**check-build, by tag**

| Check | Tag | Reads | Proven |
|---|---|---|---|
| 1 | `double-encoded-ampersand` | `.build/pages/` | a real failure (commit history) |
| 2 | `orphan-page` | `.build/pages/` hrefs + `dist/sitemap.xml` | DECISIONS 2026-09-24 |
| 3 | `noindex-in-production` | `dist/` | `4e3a776`, `43cab1e` |
| 3 | `staging-build-missing-noindex` | `dist/` (`BUILD_ENV=staging`) | DECISIONS 2026-09-24 |
| 3 | `robots-txt-missing` | `dist/robots.txt` | DECISIONS 2026-09-24 |
| 3 | `robots-txt-disallows-everything` | `dist/robots.txt` | DECISIONS 2026-09-24 |
| 3b | `divergent-header`, `divergent-footer` | `dist/` | `6187ef5` |
| 3c | `inline-nav-handler`, `unbound-nav` | `.build/pages/` | `92f5094` |
| 3d | `nav-active-marking` | `.build/pages/` | `345484c` |
| 4 | `recaptcha-site-key` | `dist/contact.html` | DECISIONS 2026-09-24 |
| 4 | `recaptcha-key-baked-into-js` | `dist/assets/*.js` | DECISIONS 2026-09-24 |
| 5 | `faq-schema-visible-mismatch` | `.build/pages/` — **calculator pages only** | DECISIONS 2026-09-24 |
| 6 | `calculator-price-copy-drift` | `src/data/calculator-intros.js` | `dd4a1dd`, `36da544` |
| 7 | `service-data-gap` | `src/data/` | `bc5f0a2` |
| 8 | `duplicate-or-missing-title-or-description` | `.build/pages/` | `bc5f0a2` |
| 9 | `content-dates-not-derived` | `.build/pages/` (JSON-LD dates) | DECISIONS 2026-09-24 (a real shallow clone) |
| 10 | `todo-in-visible-text` | `.build/pages/` | `8177031` |
| 11 | `service-hierarchy-not-derived` | `src/data/` + the rendered footer | `0e1fe46` |
| 12 | `headline-price-disagrees-with-table` | `src/data/` | `d5db1db` |
| 12 | `prose-price-not-from-table` | `src/data/` (+ `cited-figures.js`) | `36da544` |
| 13 | `title-over-60-chars` | `.build/pages/` | `7e0d340` |
| 14 | `description-outside-120-155-chars` | `.build/pages/` (404 exempt) | `2a4ebc9` |
| 15 | `text-changed-date-did-not` | `.build/pages/` + `content-date-overrides.json` | DECISIONS 2026-09-24 |

Known limits, recorded in DECISIONS 2026-09-24 and left as found: check 5 does
not check the visible→schema direction outside the calculators, and check 9
only recognises a shallow clone whose commit is dated today.

### The search-display and price-copy gates (PR #28)

- **Titles, check 13:** no `<title>` over **60** characters, measured on the
  decoded text. To shorten one, apply in order until it fits: drop
  ` | Burch Contracting`; drop the trailing phrase after the last ` | ` (not
  when that phrase is the geography); only then replace "Simpsonville &
  Greenville SC" with "Upstate SC". The geography stays wherever it fits.
- **Descriptions, check 14:** every indexable page's meta description is
  **120–155** characters (404.html exempt). Trim from the end; keep the
  geography and the offer in the first 100; lengthen only with facts already on
  the site.
- **Prices in sentences, check 12 (second half):** every price in a service
  page's prose is `proseRound()` of a figure in that service's own tables, or
  a figure declared with its source in `src/data/cited-figures.js`. Rates
  (per sq ft, per hour, per month) are not checked.

**Three rounding tiers, one per place a price appears:**

| Where | Function | Rounding |
|---|---|---|
| Tables | none | exact, as the calculator computes |
| Headlines (`stats.costRange`) | `displayRound()` | nearest $500 |
| Sentences (intros, FAQs, cards, promoted answers) | `proseRound()` | nearest $100 under $10,000; $500 from $10,000; $1,000 from $100,000 |

A hand-typed price in a sentence fails check 12: it will not be the rounding of
anything the page prices. Use the helpers in `pricing-sync.js`, or the
`{{price.<id>}}` / `{{range.<id>}}` / `{{prose.<id>}}` tokens in a template.

---

## Next content

For the owner to write — Claude Code does not. Ranked by what the Phase 6
repositioning needs most. Every URL below was checked against
`src/data/url-map.js` on 2026-09-23 and collides with nothing; add each to
`guides-cost.js` or `guides-articles.js` and to `url-map.js` as described
above. Prices in a guide come from `calculator-config.js` through
`pricing-sync.js`, never typed.

1. **Whole-home renovation cost in SC** — `/cost/whole-home-renovation-cost-sc`.
   The whole-home page (`/remodeling`) is a lead offer with no cost guide of its
   own; until this exists it borrows the four kitchen and bath guides through
   `extraGuides` in `services.js`. Remove that entry when this ships, since the
   derived guide list will pick the new one up.
2. **How long does a bathroom remodel take?** —
   `/blog/how-long-does-a-bathroom-remodel-take`. The kitchen equivalent exists
   and earns its place; the bath page's own five-phase process is the outline.
3. **Aging-in-place bathroom guide** — `/blog/aging-in-place-bathroom-remodel-sc`.
   Gives the ADA tub-to-shower page (a lead offer with one article) a second
   one, and a /cost/-adjacent reason to link it.
4. **Portfolio: a full bathroom remodel.** `/projects` now has four bath or
   kitchen entries, meeting the Phase 6 floor (the Simpsonville whole-home
   renovation and its kitchen were added 2026-09-23), but both bathroom entries
   are tub/shower conversions. Needed: at least one full bathroom remodel, with
   photos and a one-paragraph write-up (city, scope, rough size, duration).

**Already live, so not queued** (the Phase 6 plan listed them before it knew):
bathroom remodel cost Simpsonville (`/cost/bathroom-remodel-cost-simpsonville-sc`)
and Greenville (`/cost/bathroom-remodel-cost-greenville-sc`); kitchen remodel
cost Simpsonville and Greenville (`/cost/kitchen-remodel-cost-*`); kitchen
remodel timeline (`/blog/how-long-does-a-kitchen-remodel-take`).

**Deliberately not queued:** "walk-in shower conversion cost SC". It targets
the same query as `/blog/bath-to-shower-conversion-cost-south-carolina`; a
second page would compete with the first. Deepen that article instead.

---

## Everything else

- **The mobile menu cannot be gated.** `check-build` asserts one nav handler and
  the snapshot proves the markup matches across pages, but neither can tell
  whether a tap opens the menu. Check it by hand at phone width after any change
  to nav markup or `src/js/main.js`.
