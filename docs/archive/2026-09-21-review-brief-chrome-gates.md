# Review brief — chrome capture and assertion (pre-Phase-3.3 gate work)

**Status:** open review request, written 2026-09-21 against
`cleanup/one-source-of-truth`. Third in the series; see
`2026-09-21-review-brief-phases-0-2.md` and
`2026-09-21-review-brief-phase-3-1.md`.

**Phase 3 remains 1 of 7 sub-steps complete.** This commit is gate work
requested by the Phase 3.1 review as a precondition for 3.3. No site content
changed. 3.2 has not started.

As always: **verify, do not trust.**

---

## 1. Commit under review

```
6187ef5  feat(gates): capture and assert the page chrome before 3.3 touches it
```

Requested by the 3.1 review: extend `snapshot-dist.mjs` with per-page
`headerLinks`, `footerLinks` and a header/footer hash; re-record the baseline;
add a `check-build` assertion that all pages except `404.html` share one header
hash and one footer hash.

All three done. One implemented differently from the literal instruction, for a
reason that needs your agreement.

---

## 2. The deviation — read this first

**A strict "one header hash" assertion cannot pass, and forcing it would cause
harm.**

The current page's nav link is styled differently from the others. That is how
the nav shows where you are. There are **two** mechanisms:

- the desktop nav marks it with `aria-current="page"` plus active classes
- the **mobile nav marks it with active classes alone — no `aria-current`**

Hashing the raw chrome produced **seven** distinct headers across 71 pages. My
first fix normalized `aria-current` away; still seven, because the mobile nav
does not use it.

**Corrected after review.** An earlier version of this section said "six of the
differences were only the active marker moving." That was wrong, and the real
breakdown matters:

| Raw header group | Pages | Cause |
|---|---|---|
| 1 | 52 generated | already byte-identical — no variance at all |
| 1 | 11 calculators | a genuinely different header, not active state |
| 4 | `/about`, `/contact`, `/`, `/projects` | one each — active marker |
| 1 | `/privacy-policy`, `/services`, `/terms-of-service`, `404` | grouped: no active marker at all |

So the active-state variance is confined to four hand-authored pages, and the
eight hand-authored pages split five ways. Verified while checking the reviewer's
correction: the 52 generated pages contain **zero** `aria-current` inside
`<header>` — all 52 occurrences are in the breadcrumb, outside it. The
calculators have none anywhere.

That last fact is a finding in its own right: **the generated pages do not mark
the current page in the nav at all.** Normalization is still required, for the
four hand-authored pages that do — but it was buying less than this section
originally claimed.

So `normalizeChrome()` reduces every anchor in the chrome to its `href` and its
text before hashing. The hash covers chrome structure, link targets and wording;
it ignores link styling.

**Why this matters beyond correctness:** without normalization, the only way to
make the assertion green would be to delete `aria-current="page"` — trading a
real accessibility feature for a passing check. A gate that pressures someone
into that is worse than no gate.

**The trade-off, stated plainly:** a change that alters only anchor classes —
restyling the nav without touching its links or text — will not register. That
is styling rather than content, and the owner's visual check covers it. Judge
whether that is the right line.

---

## 3. What the new fields found that manual inspection had not

**Three distinct headers, not one.** The Phase 3.1 brief stated headers were
byte-identical. That was true across the three *generators*, but the
hand-authored and calculator pages carry their own and were never compared.

| | Groups |
|---|---|
| header | 52 generated · 11 calculators · 8 hand-authored |
| footer | 52 generated · 11 calculators · 5 hand-authored · 3 hand-authored |

The 8 hand-authored pages share one header but split into two footers:
`/about, /contact, /projects, /services, 404` against
`/, /privacy-policy, /terms-of-service`. That is the precise Phase 3.3 target.

---

## 4. Design choice: the assertion is active now, not deferred

You specified it as "active from 3.3 onward." I made it active immediately with
an explicit `CHROME_EXEMPT` list naming the 19 non-generated pages, rather than
gating it behind a flag.

Two reasons: it protects the 52 already-unified pages from regressing *while*
3.2 rewrites the generators, which is exactly when a chrome regression would be
easiest to introduce and hardest to notice. And shrinking that list to just
`404.html` becomes the measurable definition of 3.3 being finished.

If you would rather it were dormant until 3.3, say so — it is a one-line change.

Normalization and hashing live in `scripts/lib/chrome-hash.mjs`, imported by
both the snapshot and the guard, so a gate and its baseline can never disagree
about what "the same chrome" means.

---

## 5. Two bugs in the gate, found and fixed in the same commit

Both are the same class: comparing against a baseline recorded before a field
existed.

- **Chrome links** are compared only when *both* snapshots carry the field.
  Treating absent as empty reported every chrome link on every page as newly
  added — 71 of 71 pages "changed" on a diff where nothing had. This is the
  identical trap the `linkCount` guard already documents; I walked into it
  again with the new fields.
- **`/assets/*` is now excluded** from link sets. Vite content-hashes those, so
  they changed whenever the bundle did and said nothing about whether a page
  lost a link. The file header had already *claimed* hashed bundle filenames
  were not captured; captured via `href`, they were. The header was wrong
  before this commit, not after.

---

## 6. Proven by tampering, not asserted

| Test | Expected | Result |
|---|---|---|
| Footer heading changed on one generated page | fail | `[divergent-footer]` |
| Nav link text changed on one page | fail | `[divergent-header]` |
| `/faqs` removed from one page's footer | fail | `footer links LOST (1)`, attributed to the footer rather than lumped with body links |
| Two snapshots of the same `dist/` | pass | 71/71 identical, no false positives |
| Two consecutive builds | same asset hashes | identical — the build is deterministic |

**One of these initially lied.** My first footer tamper used a string that did
not match the built markup, so the edit silently no-opped and `check-build`
reported a pass. I took that at face value for one step and reported the footer
assertion as not working. Re-run with an assertion that the edit had landed, it
failed correctly.

Recorded because a negative test that never executed is indistinguishable from a
gate that works, and the failure mode is silent in both directions.

---

## 7. Scrutinize these

**7.1 — Is the normalization too lossy?** §2. Reducing anchors to href + text
means nav restyling is invisible to the hash. The alternative — hardcoding the
active and inactive class strings — breaks the moment the design changes. If you
want a middle ground, the obvious one is to keep non-anchor attributes verbatim
(already the case) and additionally hash the *count* of anchors carrying each
distinct class string. Worth a view before 3.3 relies on it.

**7.2 — Is `CHROME_EXEMPT` complete and correct?** It should be exactly the 19
pages that do not import `src/chrome/`. If a generated page were wrongly listed,
the gate would silently stop protecting it. Checked while writing this: all 19
entries exist in `dist/`, leaving exactly 52 governed pages, which matches the
generated count. That confirms the arithmetic, not the membership — a generated
page swapped for a hand-authored one would keep both totals intact.

**7.3 — Does excluding `/assets/*` hide anything real?** Verified while writing
this: there are only **4 distinct** `/assets/` hrefs sitewide
(`analytics-*.css`, `analytics-*.js`, `calculator-config-*.js`, `main-*.js`),
every one carrying a vite content hash. The sitewide unique-link count drops
2,773 → 2,697 because those four appear in most pages' per-page sets, not
because 76 distinct URLs vanished. Confirm no content link legitimately lives
under that prefix.

**7.4 — RESOLVED by the Phase 3.3 decision below.** The mobile nav marks the
current page with styling only and no `aria-current`, and the 52 generated pages
mark it nowhere at all. Both are fixed together in 3.3; see §10.

---

## 8. Gates

- `check-build` — passed, including the two new assertions
- `snapshot-dist` — self-consistent; 2,697 unique internal links, 7,062 total,
  after excluding build artifacts
- `check-routing` — 481 paths against `wrangler dev`, **zero differences**

Baseline re-recorded with the chrome fields, ready for 3.2.

---

## 9. Next

Phase 3.2: convert the generators to pure `render(data) → {url, html}`, one
generator at a time with a snapshot diff after each, as directed. Three
checkpoints: `generate-guides`, `generate-services`, `generate-geo-aeo`.

The chrome assertion now covers the risk that made that sequencing necessary —
a generator rewrite that quietly drops or diverges the chrome will fail the
build rather than pass a body-only gate.

---

## 10. Decisions taken from this review

Recorded here and in `docs/DECISIONS.md`.

**Normalization stays as written.** No class histogram. The reviewer accepted
the trade-off in §2 and §7.1.

**Phase 3.3 must emit active nav state from the chrome module.** The chrome
emits `aria-current="page"` plus the active class on the matching top-level nav
item for every page, in **both** the desktop and mobile navs. This does three
things at once: the hand-authored pages keep the active state they have today
when they move to templates, the mobile nav gains the accessibility affordance
it never had, and the 52 generated pages gain active state they currently lack.

Expect that to show as a chrome-hash change on every page. It is intended, and
it is the one change in 3.3 that is additive rather than structure-preserving.

**Definition of Phase 3.3 done:** `CHROME_EXEMPT` in `scripts/check-build.mjs`
is exactly `['404.html']`. Not "smaller", not "mostly empty" — that list.

**Every negative test asserts its edit landed** before drawing a conclusion
from the result. A tamper that silently no-ops reports a pass, which is
indistinguishable from a working gate; this already happened once (§6).

**The snapshot header states the general rule**, not one instance of it: a field
added to the snapshot is compared only when both sides carry it. Applies to
`linkCount`, the chrome fields, and anything added later.
