# Pricing

**`src/js/calculator-config.js` is the only place a price is decided.** Every
dollar figure on the site — calculator output, service-page tables and
headlines, FAQ answers, homepage and `/services` copy, calculator intros,
`llms.txt` — is computed from it at build time. Nothing in `src/data/`,
`src/templates/` or `src/build/` types a price that could be computed, and
check-build fails if one appears in a service page's prose.

The only dollar figures that are *not* computed are figures that are not Burch
Contracting prices (a national average, a permit threshold). They are declared,
with their sources, in `src/data/cited-figures.js`.

---

## Where prices come from

| Source, in `calculator-config.js` | What it holds | Read by |
|---|---|---|
| `PRICING_CONFIG` | base direct cost per sq ft for each service tier; location, material, complexity and site factors; adders; the 20% overhead & profit; the budget/typical/custom output spread | `calculateEstimate()`, the browser calculators, and every helper in `pricing-sync.js` |
| `ADA_BATH_SHOWER_ITEMS` + `adaBathEstimate()` | the itemized tub-to-shower line items, and the one function that totals them (location factor and O&P applied) | the tub-to-shower calculator, its pricing table, and the service page's headline, all via this one function |
| `QUOTED_RATES` | owner-quoted **final** prices for work the calculator does not model — no factor or O&P is applied on top: `adu` ($225–$325/sq ft), `garageApartment` ($200–$325/sq ft), `handyman` ($65/hour, two-hour minimum), `wholeHomeTypical` ($60,000–$350,000, the typical whole-home job) | `quotedPerSqft()`, `quotedCost()`, `quotedEstimate()`, `handymanRate()`, `quotedTypical()` in `pricing-sync.js` |
| `CALCULATOR_PAGES` | each calculator page's service key and market area (its intro paragraph lives in `calculator-intros.js`, below) | the calculators, `calculator-tables.mjs` |

Owner decisions behind `QUOTED_RATES` and the ADA and basement figures are in
`docs/DECISIONS.md` (2026-09-23, and the 2026-09-24 whole-home correction).

**Custom quote, no price anywhere:** commercial upfits, commercial roofing,
insurance restoration, ADA compliance. Their headline reads "Custom Quote" and
they are left out of the priced-services tables.

---

## The three rounding tiers

A figure is rounded according to where it appears. Calculator math never
changes; only how a result is displayed.

| Where | Function (`pricing-sync.js`) | Rounding | Example |
|---|---|---|---|
| **Tables** (common projects, pricing tiers, calculator tables) | none | exact, as `calculateEstimate()` returns it | `$6,375–$7,677` |
| **Headlines** (`stats.costRange`: hero, stat bar, comparison cells) | `displayRound()`, `displayRange()` | nearest $500 | `$4,000–$98,000+` |
| **Sentences** (intros, FAQ answers, promoted answers, card blurbs) | `proseRound()`, `proseAmount()`, `proseCost()`, `proseRange()`, `proseOf()`, `proseSpan()` | nearest $100 under $10,000; $500 from $10,000; $1,000 from $100,000 | `$6,400–$7,700` |

Per-square-foot rates (`$39–$92/sq ft`) and the handyman's hourly rate are rates, not totals,
and stay whole dollars. The owner-stated ADA range (`adaBathRange()`) rounds to $100,
the way the owner states it: `$9,800–$25,400`.

Templates cannot call functions, so they use tokens that the build fills
(`src/build/prices.mjs`): `{{price.<service-id>}}` (the headline),
`{{range.<service-id>}}` (the headline without its label), and
`{{prose.<service-id>}}` (the service's table, prose-rounded).

---

## Prose that states a price

- **Service pages** — `services.js` intros call `proseCost()`; FAQ answers in
  `service-faqs.js` read the page's own table rows by name (`row()`,
  `low()`, `high()`, `price()`); the long-form sections take computed
  values and pass them through `proseAmount()`.
- **Calculator intros** — `src/data/calculator-intros.js`, one string per
  calculator, each figure computed from the scenario its sentence describes. The
  same string renders as the page's hero paragraph (`{{calculator.intro}}`) and
  as the answer under its pricing table.
- **`/faqs`, the homepage and `/services`** — `geo-aeo.js` and
  `promoted-faqs.js` read service rows and headlines; templates use the tokens
  above.
- **Cited figures** — `src/data/cited-figures.js` lists, per service, every
  dollar figure in its prose that is someone else's number, each with a
  source: This Old House's national bathroom averages, the Simpsonville median
  home price, Greenville County's permit threshold, the owner-stated ADA range,
  the handyman's exact $130 minimum. These are never rounded; rounding a
  citation misquotes it.

---

## What the gates check

| Gate | Asserts |
|---|---|
| check-build **check 12**, first half | every service's headline equals min–max of its own table rows in the same unit (dollars or per sq ft), exactly or after `displayRound()` |
| check-build **check 12**, second half | every price in a service page's prose (intro, FAQ answers, long-form sections) is `proseRound()` of a figure in that service's own tables, or a declared cited figure. A hand-typed number fails: it will not be the rounding of anything the page prices. Rates are not checked. |
| check-build **check 6** | each calculator intro's per-square-foot band equals `servicePerSqftBand()` for its service |
| **check-tier1** | each Tier 1 page's headline agrees with its table (same function as check 12) |

Check 12's prose half covers the 16 service pages. The homepage, `/faqs`,
promoted answers and calculator intros are computed by construction, not
gated.

---

## If you change a price

1. Change it in `calculator-config.js`: a rate or factor in `PRICING_CONFIG`,
   a line item in `ADA_BATH_SHOWER_ITEMS`, or an owner rate in `QUOTED_RATES`.
   Nowhere else.
2. `npm run build && npm test`. Every table, headline, sentence and intro
   follows. If check 12 fails, a headline or sentence is not reading the table
   it describes; fix the derivation, not the number.
3. **Move the dates.** A price change changes pages' visible text.
   - Pages dated by git move on their own. Run `node scripts/dates-set-by-head.mjs`
     to see which.
   - Pages dated by a literal override (the service pages, privacy, terms) do
     not. check-build **check 15** fails, naming each one: bump its
     `dateModified` in `src/data/content-date-overrides.json`, then run
     `node scripts/record-text-hashes.mjs`.
4. If the change is an owner decision (a new quoted rate, a different typical
   range), record it in `docs/DECISIONS.md` with the numbers and the date.
