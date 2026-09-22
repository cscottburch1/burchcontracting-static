/**
 * Guards wrangler.jsonc against the config that caused the 2026-09-16 outage.
 *
 *   node scripts/check-wrangler-config.mjs
 *
 * THE INCIDENT
 *
 * A Cloudflare-side Git integration (Workers & Pages → the Worker → Builds) was
 * connected to this repo. It deployed on every push, built with a plain
 * `npm run build` under the then-current opt-in indexing model, and carried none
 * of the `wrangler secret put` secrets. Every push therefore shipped noindex on
 * all 70 pages and wiped ADMIN_USERNAME, ADMIN_PASSWORD_HASH, SESSION_SECRET,
 * RESEND_API_KEY and RECAPTCHA_SECRET_KEY — taking down admin login and lead
 * emails, and silently disabling the reCAPTCHA check while the contact form
 * kept accepting submissions. Full account in docs/archive/LAUNCH-CHECKLIST.md.
 *
 * WHAT THIS CAN AND CANNOT DO
 *
 * The integration itself is a dashboard setting, and nothing in a repository
 * can see it — that is why docs/RUNBOOK.md says never to connect it. What this
 * can see is the config change that comes with it: a `build` block in
 * wrangler.jsonc, which is how Cloudflare-side builds are configured. Its
 * appearance means someone is setting that path up again.
 *
 * Also checked, because each is load-bearing and each has a comment in
 * wrangler.jsonc explaining why it cannot change:
 *   - run_worker_first must stay true, or /about.html is served as a file and
 *     can never 301 to /about.
 *   - html_handling must stay "none", or the asset server issues its own 307s
 *     and every clean URL changes.
 *   - not_found_handling must stay "none", so notFound() in the Worker owns the
 *     404 and its status code.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const file = resolve(root, 'wrangler.jsonc')

// jsonc: strip // line comments and /* */ blocks. No string in this file
// contains "//", and the parse below would fail loudly if that changed.
const raw = readFileSync(file, 'utf8')
const stripped = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

let config
try {
  config = JSON.parse(stripped)
} catch (error) {
  console.error(`check-wrangler-config: wrangler.jsonc does not parse after stripping comments — ${error.message}`)
  process.exit(1)
}

const failures = []

if (config.build !== undefined) {
  failures.push(
    'wrangler.jsonc has a "build" block. That is how a Cloudflare-side Git integration ' +
      'configures its own builds, and that integration deployed without secrets and with ' +
      'noindex on every page on 2026-09-16. Deploys run from .github/workflows/deploy.yml ' +
      'and nowhere else. See docs/RUNBOOK.md.'
  )
}

const assets = config.assets ?? {}
if (assets.run_worker_first !== true) {
  failures.push('assets.run_worker_first must be true — without it /about.html is served as a file and can never 301 to /about.')
}
if (assets.html_handling !== 'none') {
  failures.push(`assets.html_handling must be "none", not ${JSON.stringify(assets.html_handling)} — the automatic modes issue 307s and change every clean URL.`)
}
if (assets.not_found_handling !== 'none') {
  failures.push(`assets.not_found_handling must be "none", not ${JSON.stringify(assets.not_found_handling)} — the Worker's notFound() owns the 404 and its status code.`)
}

if (failures.length) {
  console.error(`check-wrangler-config FAILED — ${failures.length} issue(s):\n`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

console.log(
  'check-wrangler-config passed — no build block, run_worker_first true, html_handling and not_found_handling both "none".'
)
