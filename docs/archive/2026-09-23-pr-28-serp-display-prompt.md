> **Archived 2026-09-24. Rebuilt from the Claude Code conversation in which it
> was pasted, not from an original file.** The text below is the prompt as the
> owner pasted it on 2026-09-23, reproduced verbatim, including the blank
> owner-decision placeholder. The owner's answers were given in the same
> conversation, not in this text:
> - whole-home typical range $8,000 to $350,000 (later corrected to $60,000 to
>   $350,000, PR #29);
> - the title rules reordered (drop the trailing phrase before replacing the
>   geography).
>
> Both are recorded in `docs/DECISIONS.md`. The work shipped as PR #28 (merge
> `e5d56d9`).

---

# PR #28 — SERP display polish: titles, descriptions, price copy

Paste into Claude Code with the repo open at `main` (`db10a0f` or later). Branch `fix/serp-display` from `main`. Merge commit only. Push after every commit. Run `node scripts/dates-set-by-head.mjs` before each push; these are content commits (no `Content-Change: none` trailer) except where noted.

## Owner decision needed first — fill in before pasting

**Whole-home remodel, realistic range you would quote.** The page currently shows a "Whole-House Remodel" row of $250,430–$644,314+ (the calculator's maximum configuration) and a page headline of $5,500–$644,500. Give the low and high you'd actually tell a homeowner for a whole-home job you'd take:

> Whole-home typical range: $______ to $______

If left blank, Claude Code stops at item 3 and asks.

## Why this PR

Phase 6 shipped the right words, but the SERP display cuts them off. Titles on the four lead pages and the homepage are 79–99 characters; Google shows about 60. Descriptions are 164–179; Google shows about 155. And the body copy on the bathroom and kitchen pages repeats calculator-exact table figures ("$6,375 to $30,708") in sentences, which reads as false precision on the two pages the whole repositioning points at. Every fix here is data-only and measurable.

## Invariants

Same as PR #23: zero URL changes, zero content loss outside the fields named below, every price derives through `pricing-sync.js`, no invented facts, `npm test` green before every push, snapshot diff attributed per item in the PR body. Every changed title and description appears in a before/after table in the PR body.

## Items

### 1. Titles ≤ 60 characters (one commit, all pages)

Rule, applied in this order until the title fits:
1. Drop the `| Burch Contracting` suffix. Google appends the site name on its own line from the `WebSite`/`Organization` schema; the suffix only spends characters.
2. Replace `Simpsonville & Greenville SC` with `Upstate SC` where the page is not itself a city page.
3. Drop the trailing intent phrase after the last `|` only if still over.

Keep the lead words exactly as Phase 6 set them; the service and the geo come first, and that part must survive truncation. City pages keep their city name. Add a `check-build` assertion: no `<title>` over 60 characters (fail, not warn). Prove it fails on current `main` before the data change, then passes after. Put the before/after table in the commit message.

### 2. Descriptions 140–155 characters (one commit, all pages)

Trim from the end; keep the geo and the offer in the first 100 characters. Do not add new claims. `check-build` assertion: every description between 120 and 155 characters. Same prove-it-fails-first rule.

### 3. Price copy in prose, and the whole-home range (one commit)

- Add `proseRound(amount)` to `pricing-sync.js`: nearest $100 under $10,000, nearest $500 from $10,000, nearest $1,000 from $100,000. Every dollar figure that appears in a `<p>`, an FAQ answer, a card blurb, or a promoted answer goes through it. Tables keep exact figures (that is their job); headlines keep `displayRound`. Extend the existing headline-agrees-with-table assertion so prose figures must equal `proseRound` of a figure in the same page's table, which is how a hand-typed number gets caught.
- Whole-home: set the "Whole-House Remodel" row's range from the owner's answer above (through `calculator-config`, as a typical-range tier, not a hand-typed string), and let the headline follow. If the calculator's maximum configuration still exceeds the owner's high, the table row shows the owner's typical range with a `+` and the calculator keeps its own math. Record the decision in `DECISIONS.md` with the owner's numbers and the date.

### 4. Housekeeping (mechanical, `Content-Change: none`)

- `RUNBOOK.md`, "adding a gate": add the two new assertions and the three rounding tiers.
- Note in `DECISIONS.md` why titles were allowed to overshoot in Phase 6 and why 60 is now enforced.

### 5. PR

Fresh-clone proof (`npm ci`, `npm run build`, `npm test`), the before/after tables for titles and descriptions, the list of every prose figure that changed with its old and new value, and deploy instructions (merge commit, manual `workflow_dispatch`). After deploy, the owner will request indexing on `/`, the four Tier 1 pages, and `/services` in Search Console; say so in the body.

## Owner actions (not for Claude Code)

- Delete the stale branches `copilot/fix-build-and-deploy-job` (close its PR first) and `fix-years-and-rule-order` on GitHub.
- Confirm what production is serving: open `https://burchcontracting.com/version.txt`. If it does not show `db10a0f`, Phase 6 is not live yet; dispatch Deploy for `main` before this PR merges so the two changes are measured separately.
