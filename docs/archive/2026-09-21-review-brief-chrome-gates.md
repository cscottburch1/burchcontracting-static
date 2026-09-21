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

Hashing the raw chrome produced **seven** distinct headers across 71 pages,
where six of the differences were only the active marker moving. My first fix
normalized `aria-current` away; still seven, because the mobile nav does not use
it.

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

**7.4 — Out of scope, but real:** the mobile nav marks the current page with
styling only and no `aria-current`. Screen readers get no "current page"
announcement there. Not touched — it is a content/accessibility change, not gate
work — but someone should own it. Phase 3.3 rewrites this markup and would be
the natural place.

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
