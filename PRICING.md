# Pricing: Single Source of Truth

**`src/js/calculator-config.js` is the only authoritative source for pricing on this site.**
Every dollar figure shown anywhere — calculator outputs, service page examples,
FAQ answers, hero copy — must be derived from it, directly or indirectly.
No other file should hand-type a price that could instead be computed from
the config.

## How it fits together

- **`src/js/calculator-config.js`** — base direct costs, location/material/
  complexity/site factors, adders, output ranges, and the 20% overhead &
  profit rate. This is the only place pricing *decisions* are made.
- **`src/js/calculator.js`** — the interactive calculator UI. Reads the
  config at runtime in the browser.
- **`src/data/pricing-sync.js`** — build-time helpers (`projectCostString`,
  `tierPerSqftString`, `projectEstimate`, etc.) that run the config's own
  `calculateEstimate()` formula to produce display-ready strings. Nothing
  in this file invents a number.
- **`src/data/services.js`** — data for the standalone service pages
  (`/garages/`, `/outdoor-living/decks/`, etc.), powering
  `scripts/generate-services.mjs`. For decks, screened-porches, garages,
  additions, and remodeling (bath/kitchen/whole-home), the `cost`/`range`/
  `costRange`/`pricePerSqFt` fields are computed via `pricing-sync.js`
  imports rather than hand-typed (reconciled 2026-07-05).
- **`src/data/geo-aeo.js`** — GEO/AEO FAQ content and service-area data.
  Any FAQ that states a dollar figure must match what the calculator
  produces for an equivalent scope — checked by hand since these are
  prose, not computed.

## Services with no calculator equivalent

`covered-patios`, `adu-builder`, `commercial-upfits`, and
`basement-finishing` have no corresponding service in
`calculator-config.js` — there's no calculator for them, so their
`services.js` pricing remains hand-authored. If a calculator is ever
added for one of these, reconcile it the same way as the others.

`insurance-restoration` has no fixed price at all — cost varies by
damage scope, quoted per-project after a free consultation. It's
intentionally excluded from the `pricing-sync.js` reconciliation.

## If you change a rate in calculator-config.js

Everything importing from `pricing-sync.js` picks up the change
automatically on the next build (`npm run prebuild` / `npm run build`).
Prose that states a specific dollar figure (hero paragraphs, FAQ answers
in `geo-aeo.js` and the hand-authored pages) does **not** update
automatically — search for the old figure and update it by hand, the
same way this reconciliation did.
