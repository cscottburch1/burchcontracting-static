# Kitchen Remodeling Launch + Redirect Fixes — Deploy Notes

Generated 2026-08-29. Files in this package and where they go in
`burchcontracting-static/burchcontracting-dev/`:

| File in this package | Destination | Action |
|---|---|---|
| `.htaccess` | `public/.htaccess` | Replace (diff first — see §2) |
| `sitemap.xml` | `public/sitemap.xml` | Replace (adds 1 URL, 42 → 43) |
| `kitchen-remodeling-content.js` | `src/data/kitchen-remodeling-content.js` | New file |
| `kitchen-remodeling-services-entry.js` | paste into `src/data/services.js` | See §1 |
| `kitchen-remodeling-faqs.js` | paste into `src/data/service-faqs.js` | See §1 |

## 1. Wiring the kitchen page (3 edits)

1. **`src/data/services.js`** — add the import next to the existing
   bathroom-remodeling-content import:
   ```js
   import { kitchenRemodelingBeforeProcess, kitchenRemodelingAfterProcess }
     from './kitchen-remodeling-content.js'
   ```
   Then paste the entry from `kitchen-remodeling-services-entry.js` into the
   SERVICES array **directly after the `bathroom-remodeling` entry** (strip
   the comment header).

2. **Cross-links (required — check-build fails sitemap URLs with zero inbound
   links).** In `services.js`, add
   `{ name: 'Kitchen Remodeling', url: '/kitchen-remodeling/' }`
   to the `relatedServices` arrays of the `remodeling`,
   `bathroom-remodeling`, and `basement-finishing` entries. The generated
   pages will then link the new page, satisfying the guard. (The new entry
   already links back to all three.)

3. **`vite.config.js`** — add `kitchenRemodeling: resolve(root, 'kitchen-remodeling/index.html'),`
   to the build `input` map next to `bathroomRemodeling`. **Required:** service
   pages are hand-listed inputs (no auto-discovery); without this line the
   generator writes the source file but Vite never builds it into `dist/`, the
   FTP deploy never uploads it, and the live URL 404s while every guard stays
   green — the documented `calculator/covered-patios.html` failure mode.

4. **`src/data/service-faqs.js`** — paste the block from
   `kitchen-remodeling-faqs.js` after the `'bathroom-remodeling'` block
   (strip the comment header).

Then: `npm run prebuild && npm run build` locally and confirm
**`dist/kitchen-remodeling/index.html`** exists (in `dist/` specifically) with the pricing
table populated (verifies the pricing-sync helpers resolved), before pushing.

## 2. What changed in `.htaccess` (38 rule changes — diff before deploying)

- **34 trailing-slash fixes.** Every redirect target that is a directory now
  ends in `/` (e.g. `/garages` → `/garages/`). Kills the two-hop
  `legacy → /garages → /garages/` chains behind GSC's "Redirect error" and
  the split-URL impressions (`/garages` 588 impr vs `/garages/` 1,882).
- **1 rule removed:** `^kitchen-remodeling/?$ → calculator` — the page is
  real now. (Bare `/kitchen-remodeling` gets Apache's automatic slash
  redirect; no rule needed.)
- **3 rules repointed** to `/kitchen-remodeling/`:
  `locations/kitchen-remodeling-*-sc`, `cost/kitchen-remodel-cost-*-sc`,
  `kitchen_remodeling`. Rationale: `/locations/kitchen-remodeling-fountain-inn-sc`
  still ranks ~position 6 and `/cost/kitchen-remodel-cost-simpsonville-sc`
  ~position 2 while redirecting to a calculator; the service page is the
  content-equivalent target that lets that equity transfer.
  (`calculator/kitchen-remodeling` still points at the calculator —
  correct, it's a calculator URL.)
- Simulated against the full 197-URL legacy inventory after the changes:
  **0 redirect chains, 0 loops, no new 404s.**

## 3. Post-deploy verification (10 minutes)

```bash
# one hop, straight to the slash form:
curl -sI https://burchcontracting.com/garage-builder | grep -i location   # → /garages/
curl -sI https://burchcontracting.com/kitchen_remodeling | grep -i location  # → /kitchen-remodeling/
# the new page serves and is indexable:
curl -s https://burchcontracting.com/kitchen-remodeling/ | grep -i 'robots'  # → index, follow
# the www split (separate issue, check while you're here):
curl -sI https://www.burchcontracting.com/ | head -3   # want 301, not 200
```

If the www check returns 200, the fix is a Cloudflare Redirect Rule
(www/* → https://burchcontracting.com/$1, 301), not this repo.

Then in Search Console: Sitemaps → resubmit; URL Inspection →
`https://burchcontracting.com/kitchen-remodeling/` → Request indexing.

## 4. Still open (next PRs, in priority order)

1. `/basement-finishing/` content rebuild (658 words vs 1,768 on old site;
   321 interior impressions at position 37.9 waiting on it).
2. Restore the 9 interior blog articles (two still rank at positions 6 and
   10 while returning 404) — source: old repo `src/lib/seo/localSeoData.ts`.
3. The 85 GSC 404s — map against the 197-URL inventory from the old repo's
   sitemap generator, not the GSC top-200 sample.
4. Garage page rebuild + `/garage-builder` reversal (the big spring project:
   3,044 impressions at position 55).
5. nicheprohub.com still serving a full duplicate of the site at 200 —
   upload `migration/nicheprohub-redirect.htaccess` to that domain's docroot.
