#!/usr/bin/env bash
#
# Verifies that a deployed Worker version serves exactly what was built.
#
# Usage (run from burchcontracting-dev/):
#   ../.github/scripts/verify-deployment.sh <base-url> <mode>
#
#   mode=preview     checks that work against any URL, including a version
#                    preview URL that carries no production traffic
#   mode=production  adds the checks that only mean anything on the real
#                    domain (the Worker answering /api/contact.php, and the
#                    http:// and www redirects Cloudflare performs)
#
# Requires GITHUB_SHA and GITHUB_RUN_ID in the environment.
#
# Why this is a separate file: cloudflare.yml runs it twice — once against the
# preview URL before promoting, once against production afterwards. Keeping one
# copy means the pre-promotion gate can never drift from the post-deploy check.
set -euo pipefail

BASE_URL="$1"
MODE="${2:-preview}"

echo "Verifying $BASE_URL (mode: $MODE)"

# 1. The new version is the one answering.
live=""
for attempt in 1 2 3 4 5 6; do
  live=$(curl -fsSL "$BASE_URL/version.txt?nocache=$GITHUB_RUN_ID-$attempt" | grep '^commit=' | cut -d= -f2 || true)
  [ "$live" = "$GITHUB_SHA" ] && break
  sleep 10
done
echo "Live commit:     $live"
echo "Expected commit: $GITHUB_SHA"
if [ "$live" != "$GITHUB_SHA" ]; then
  echo "::error::$BASE_URL is not serving commit $GITHUB_SHA"
  exit 1
fi

# 2. Every built page is served byte-for-byte (after normalizing Cloudflare's
#    email obfuscation, as deploy.yml does).
#
#    This is the check that catches a deploy where the Worker updates but its
#    assets do not: version.txt is the one file whose bytes change every build,
#    so step 1 alone would pass while every page still served stale HTML.
#
#    Each page's URL comes from src/data/url-map.js, not from its filename.
mismatch=0
while IFS='|' read -r rel url_path; do
  [ -n "$rel" ] || continue
  local_hash=$(python3 ../.github/scripts/strip-cf-email-obfuscation.py "dist/$rel" | sha256sum | cut -d' ' -f1)
  live_hash=$(curl -fsSL "$BASE_URL$url_path?nocache=$GITHUB_RUN_ID" | python3 ../.github/scripts/strip-cf-email-obfuscation.py | sha256sum | cut -d' ' -f1)
  if [ "$local_hash" != "$live_hash" ]; then
    echo "::error::Content mismatch on $url_path (built from $rel)"
    mismatch=1
  fi
done < <(node --input-type=module -e '
  import { PAGE_URLS } from "./src/data/url-map.js";
  for (const [file, url] of Object.entries(PAGE_URLS)) console.log(`${file}|${url}`);
')
[ "$mismatch" = "0" ] || exit 1
echo "Content check passed: every built page matches $BASE_URL."

# 3. Same status codes, redirects and security headers as the Hostinger site
#    (migration/routing-baseline.json).
node scripts/check-routing.mjs "$BASE_URL"

# 4. Every search and AI crawler gets HTTP 200 on every page.
node scripts/check-crawler-access.mjs "$BASE_URL"

if [ "$MODE" != "production" ]; then
  echo "Preview checks passed for $BASE_URL."
  exit 0
fi

# 5. On the real domain only: cloudflare/api.js answers /api/contact.php, and
#    http:// and www redirect exactly as Hostinger's .htaccess did (Cloudflare's
#    Always Use HTTPS and a www Redirect Rule do this now — CLOUDFLARE-CUTOVER.md,
#    step 4). Neither can be exercised through a workers.dev preview URL.
contact_status=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/contact.php")
echo "contact.php status: $contact_status"
if [ "$contact_status" != "405" ]; then
  echo "::error::api/contact.php returned $contact_status through the Worker, expected 405 from cloudflare/api.js"
  exit 1
fi

redirect_pairs=(
  "http://burchcontracting.com/garages/?utm_source=ci|https://burchcontracting.com/garages/?utm_source=ci"
  "https://www.burchcontracting.com/garages/?utm_source=ci|https://burchcontracting.com/garages/?utm_source=ci"
)
for pair in "${redirect_pairs[@]}"; do
  from="${pair%%|*}"
  want="${pair#*|}"
  got=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$from")
  echo "$from -> $got"
  if [ "$got" != "301 $want" ]; then
    echo "::error::$from should 301 to $want — check Always Use HTTPS and the www Redirect Rule (CLOUDFLARE-CUTOVER.md, step 4)"
    exit 1
  fi
done

echo "Production checks passed for $BASE_URL."
