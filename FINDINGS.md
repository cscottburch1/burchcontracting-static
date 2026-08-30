# Findings — Kitchen Remodeling Launch PR

Out-of-scope items noticed while applying the kitchen-remodeling package.
Not touched, per the frozen scope for this PR.

## 1. Stray tracked file at git root: `sitemap.xml/xml version=1.0 encoding=UTF-8.txt`

Pre-existing, unrelated to this PR. Commit `8bbcab6` ("sitemap.xml file
update") accidentally committed a directory literally named `sitemap.xml`
at the repo root (`burchcontracting-static/`, one level above
`burchcontracting-dev/`) containing a single file with the garbled name
`xml version=1.0 encoding=UTF-8.txt` — apparently a raw XML declaration
line that got saved as a filename instead of file content, likely from a
botched save/extract at some point. That file is missing from the working
tree (`git status` shows it as deleted) even on a clean checkout, so
`git status` at repo root always shows one pending deletion regardless of
what else is going on.

Recommend a follow-up commit that does `git rm` on that path and, if a
real `sitemap.xml` was intended to live in that commit, verifies
`burchcontracting-dev/public/sitemap.xml` (the real one) already has
that content instead.

## 2. `generate-trust-layer.mjs`'s `CHOOSE_IF` map has no entry for `bathroom-remodeling` (and now `kitchen-remodeling`)

`scripts/generate-trust-layer.mjs` builds the "Compare All Services" table
on `services.html` from a hand-maintained `CHOOSE_IF` lookup keyed by
`service.slug`. `bathroom-remodeling` was never added to that map, so its
row has always rendered "Choose this if " with nothing after (empty
string default, no fallback text). The new `kitchen-remodeling` entry
inherits the same gap for the same reason — DEPLOY-NOTES.md doesn't
mention this map at all, and it's a pre-existing omission that predates
this PR (bathroom-remodeling already has the same blank), so it was left
alone rather than patched only for the new page.

Recommend a follow-up PR that adds `'bathroom-remodeling'` and
`'kitchen-remodeling'` entries to `CHOOSE_IF` (and confirms
`PERMIT_REQUIRED` coverage while at it — that map defaults to
"Case-by-case" so it doesn't visibly break, but is equally incomplete).

## 3. `core.autocrlf=true` + `generate-trust-layer.mjs`'s patch step produces mixed-EOL files

Running `npm run prebuild` regenerates ~30+ hand-authored HTML pages via
`generate-trust-layer.mjs`'s patch markers. On this Windows checkout
(`core.autocrlf=true`), the patched files end up with mixed CRLF/LF line
endings (the base file is CRLF from checkout; the injected block is
written with bare `\n`). This makes `git status` flag most of the site's
hand-authored pages as modified after every `prebuild` run even when no
visible content changed — confirmed by comparing CRLF-stripped content
hashes against HEAD for the affected files in this PR (all identical
except the ones with genuine kitchen-remodeling-related changes).

Not fixed here since it's pre-existing build-tooling behavior, not
something introduced by this PR, and touching the generator's write path
is outside the frozen scope. Worth a follow-up: either normalize line
endings in the writeFileSync calls, or add a `.gitattributes` rule so git
stops flagging phantom diffs.

## 4. Task B's cited restore commit (`7bfd612`) was the wrong SHA — used `fd7b28e` instead

Task B (sitemap regression fix) said to restore `public/sitemap.xml` from
`7bfd612` ("PR #7"). Checked: `7bfd612`'s tree has all 42 URLs on uniform
`2026-07-23`, zero `<changefreq>`/`<priority>` tags — i.e. it's the *stale*
version, not the good one. Tracing the file's history: `fd7b28e` ("PR #8",
one merge later and already an ancestor of `main`) is the commit that
actually has the real per-page `2026-08-22` dates plus a varied
`changefreq`/`priority` spread (1.0 down to 0.3 by page importance).
`7bfd612`'s own merge (parents `fd7b28e` "good" + `6d7e74b` "stale
feature-branch tip") resolved sitemap.xml by picking the stale side,
which is the actual regression commit — not something that happened
after `7bfd612` as the task assumed.

This restoration (see #5 below) turned out to be the wrong fix
regardless of which commit it came from — noted here only so the
commit-hash discrepancy isn't silently invisible in the history.

## 5. CORRECTED: `public/sitemap.xml` *is* generator-owned — Task B's original fix was wrong and was reverted

The Task B commit above (hand-restoring `public/sitemap.xml` with
static per-page dates + `changefreq`/`priority`) was reverted. It was
based on an ownership check that returned a false negative: the check
ran `npm run prebuild` on a clean tree and saw no diff, and concluded
no generator touches the file. In fact `generate-geo-aeo.mjs` has a
`generateSitemap()` function that `writeFileSync`s `public/sitemap.xml`
on every single `prebuild` run — the check's `grep` for candidate
generator logic never searched for the literal string "sitemap", so it
missed this function entirely. The "no diff" result was a coincidence:
at the time of that check, the generator's own (stale-dated) output
already byte-matched what was committed, so overwriting it with itself
looked like no drift.

Worse, the generator's current design is deliberately *better* than
what got hand-restored: its own comment states `changefreq`/`priority`
are omitted because Google ignores both, and `<lastmod>` per page comes
from `src/data/content-dates.js` (checked in, refreshed by hand via
`node scripts/compute-content-dates.mjs`, itself derived from real git
history — see that script's header for why it isn't computed live in
CI). The uniform `2026-07-23` dates that looked like "the regression"
are really just `content-dates.js` being stale (last refreshed
2026-08-05, predating kitchen-remodeling's existence and every change
made in this session). The actual fix was to refresh `content-dates.js`
from current git history and let the generator produce the real sitemap
from that — see the commit that replaces this one for details.

## 6. `LAUNCH-CHECKLIST.md` references the now-deleted `SFTP-GUIDE.md`

Task C4 deleted `SFTP-GUIDE.md` (the manual VS Code SFTP right-click
upload guide, including its `npm run deploy` script call) along with the
script itself, since the guide's whole premise was the guard-bypassing
manual workflow the task retires. `LAUNCH-CHECKLIST.md` line 97 links to
`SFTP-GUIDE.md` in an unrelated context — using an SFTP *client* to
manually browse the live docroot for diagnostic verification, not to
upload a build — which is still a legitimate (if now undocumented)
technique. Left `LAUNCH-CHECKLIST.md` untouched since it's a dated,
already-finalized audit report, not something in scope for Task C4;
noting the now-dangling reference here instead of editing that report.
