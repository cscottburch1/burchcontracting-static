# Review brief — Phase 3.1 (chrome unification) and the pre-Phase-3 gate work

**Status:** open review request, written 2026-09-21 against
`cleanup/one-source-of-truth`. Supplements
`2026-09-21-review-brief-phases-0-2.md`; read that one first if you have not.

**Phase 3 is 1 of 7 sub-steps complete.** This covers only 3.1. The steps that
can actually lose content — converting the generators and extracting the
hand-authored pages — are not started.

As before: **verify, do not trust.** Written by the agent whose work you are
checking.

---

## 1. Commits under review

```
43cab1e  fix(gates): strengthen the content gate and the indexing policy before Phase 3
f477faf  refactor(chrome): one header and footer for every page, and close a footer gap
```

`43cab1e` is the follow-up to your Phases 0–2 review. `f477faf` is Phase 3.1.

---

## 2. Correction to f477faf's commit message

Its subject says "one header and footer for **every page**." That is wrong, and
I found it while writing this brief rather than before committing. It is one
footer for every **generated** page. Three variants still ship:

| Footer | Pages | Unique internal links |
|---|---|---|
| Unified (this commit) | 52 generated | 30 |
| Hand-authored | 8 — `index`, `about`, `contact`, `services`, `projects`, `privacy-policy`, `terms-of-service`, `404` | 8 |
| Calculators | 11 — `calculator/*.html` | **3** |

The 19 hand-authored and calculator pages do not import the chrome module at
all; their footers are baked into the committed HTML. **Phase 3.3 is what
unifies them**, by moving those pages to `src/templates/` as `<main>` bodies
rendered through the same chrome.

So the footer disparity this commit set out to fix is two-thirds fixed. The
calculator pages are now the worst internal-linking gap on the site at three
footer links each — worse than the service-area pages were before this change.

---

## 3. What 3.1 actually did

`scripts/page-chrome.mjs` → `src/chrome/index.mjs`, now the single definition of
the chrome for generated pages. `generate-services.mjs` and
`generate-geo-aeo.mjs` each carried a verbatim copy and now import it.

Headers were byte-identical across all three (sha `4085a75a15`, 14,505 chars),
so unifying them changed nothing. Footers were not, and no one of them was a
superset:

```
guides    21 internal links
services  17
geo        8      <- the local-SEO landing pages
union     26
```

The service-area pages linked to no service page, no sibling city, and neither
`/cost` nor `/blog`. They also hardcoded "BBB A+ Rated" where the others
interpolate `SITE.bbb`.

Unified to the union, so the change is strictly additive:

- every page keeps every link it had — **zero `links LOST`**
- Service Areas derived from `SERVICE_AREAS`: 4 hand-listed cities → all 8
- a Company block (`/`, `/about`, `/projects`, `/faqs`, `/contact`) added; it
  existed only in the geo footer

Measured: 2,680 → 2,773 unique internal links (+93); 6,480 → 7,138 total (+658).
52 of 71 pages changed; the only fields that moved are `links added` and
`link COUNT`. Visible text byte-identical on all 71.

`43cab1e` separately added the per-page link total to the snapshot gate and made
`applyIndexingPolicy` check the header's value rather than its presence, both
per your review.

---

## 4. Scrutinize these

**4.1 — The gate structurally cannot verify what this commit changed.**
`snapshot-dist.mjs` strips `<header>` and `<footer>` before extracting visible
text. That is deliberate and correct for content-loss detection, but it means
the 71/71 "identical text" result says *nothing* about whether the new footer
renders correctly. I verified tag balance programmatically (div/ul/li counts
match on generated pages) and link sets by extraction — **nobody has looked at
the rendered page.** A visual check at desktop and mobile width is the missing
verification. This is the weakest point in the commit.

**4.2 — Is linking all 8 service areas from every page right?**
It is additive and defensible, and it fixes a real gap for the four cities that
were previously unlinked from the footer. But it is also a judgment call about
link-graph shape, not a mechanical refactor, and reasonable people differ on
sitewide city lists. Worth a second opinion before Phase 6 builds on it.

**4.3 — Company block placement.**
Appended inside the Contact column rather than as a fifth column, to avoid
changing the 4-column grid. Check it does not look wrong on mobile.

**4.4 — The orphan gate's continued usefulness.**
It counts hrefs from all pages including chrome, so a richer footer could
neuter it. My check says it survives: the shared header already covered 29 of 70
sitemap URLs, and this adds only 6 more (`/cost`, `/blog`,
`/calculator/estimate`, `/services`, `/faqs`, `/privacy-policy`), leaving the
~35 guides and calculators still dependent on body links. Confirm that
reasoning — if it is wrong, the gate is now much weaker than it looks.

**4.5 — Deferred derivation.**
The "Our Services" list stays literal. Deriving it now would change its labels
and membership; Phase 6 rebuilds that ordering from the new `tier` field. Judge
whether deferring is right or whether it should have been done once, here.

---

## 5. Gates

All re-run on the PR head after `f477faf`:

- `check-build` — passed
- `snapshot-dist` — 71/71, zero content loss, only additive link changes
- `check-routing` — 481 paths against `wrangler dev`, **zero differences**

---

## 6. What remains in Phase 3

| Step | Scope | Risk |
|---|---|---|
| 3.2 | Generators → pure `render(data) → {url, html}` in `src/build/`; vite scans `.build/pages/` | high |
| 3.3 | 8 hand-authored pages → `src/templates/` `<main>` bodies; delete patch-marker mechanism | high |
| 3.4 | Fail build on missing data (`CHOOSE_IF`, `PERMIT_REQUIRED`, FAQs, unique titles) | low |
| 3.5 | Delete 40+ generated HTML files from git | medium |
| 3.6 | Per-entry content dates + committed overrides file | medium |
| 3.7 | Final snapshot diff + routing | — |

3.2 and 3.3 are ~2,600 lines of generator restructuring plus extracting eight
pages down to their `<main>` bodies. They are the reason the snapshot gate
exists, and the reason §4.1 above matters: the gate covers body content well and
chrome not at all.

**Question worth answering before 3.3:** should the content gate be extended to
capture footer/header link sets per page as a separate field, so the chrome
changes in 3.3 are covered the way body content already is? It would have caught
the overclaim in §2 automatically.
