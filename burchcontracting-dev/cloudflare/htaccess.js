/**
 * Reads the redirect rules and security headers out of public/.htaccess so
 * the Cloudflare Worker (cloudflare/worker.js) and the Hostinger server
 * behave identically from one source file. Also used by
 * scripts/generate-cloudflare-headers.mjs and scripts/check-routing.mjs.
 *
 * Supported on purpose, because it's everything public/.htaccess uses:
 *   - `RewriteRule <pattern> <target> [R=301,L,NE]` external redirects,
 *     matched in file order against the path without its leading slash
 *     (Apache per-directory semantics), with $1-$9 substitution and the
 *     original query string appended unless the target has its own.
 *   - `Header always set <Name> "<value>"`.
 * Rules preceded by RewriteCond (the www/HTTPS canonicalization rules) are
 * skipped: Cloudflare handles those at the edge before the Worker runs.
 */

export function parseRedirectRules(htaccess) {
  const rules = []
  let conditional = false

  for (const raw of htaccess.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue

    if (/^RewriteCond\s/i.test(line)) {
      conditional = true
      continue
    }

    const match = line.match(/^RewriteRule\s+(\S+)\s+(\S+)(?:\s+\[([^\]]*)\])?$/i)
    if (!match) continue

    const skip = conditional
    conditional = false
    if (skip) continue

    const [, pattern, target, flagText = ''] = match
    const flags = flagText.split(',').map((flag) => flag.trim().toUpperCase())
    const redirectFlag = flags.find((flag) => /^R(=\d{3})?$/.test(flag))
    if (!redirectFlag) continue

    rules.push({
      pattern,
      regex: new RegExp(pattern),
      target,
      status: redirectFlag.includes('=') ? Number(redirectFlag.slice(2)) : 302,
    })
  }

  return rules
}

export function parseSecurityHeaders(htaccess) {
  const headers = {}
  for (const raw of htaccess.split(/\r?\n/)) {
    const match = raw.trim().match(/^Header\s+always\s+set\s+(\S+)\s+"(.*)"$/i)
    if (match) headers[match[1]] = match[2]
  }
  return headers
}

/** Returns { status, location } for the first matching rule, or null. */
export function findRedirect(rules, pathname, search = '') {
  let path = pathname
  try {
    path = decodeURIComponent(pathname)
  } catch {
    // Malformed escape sequence — match against the raw path instead.
  }
  const subject = path.replace(/^\//, '')

  for (const rule of rules) {
    const match = rule.regex.exec(subject)
    if (!match) continue
    let location = rule.target.replace(/\$(\d)/g, (_, n) => match[Number(n)] ?? '')
    if (search && !location.includes('?')) location += search
    return { status: rule.status, location }
  }

  return null
}
