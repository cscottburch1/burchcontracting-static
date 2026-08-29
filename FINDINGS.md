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
