/**
 * `npm test` — every gate, in one command.
 *
 *   npm test                 build must have run first
 *   npm test --  --no-routing  skip the routing check (no wrangler dev)
 *
 * WHAT RUNS, AND WHY IN THIS ORDER
 *
 * The static gates first, cheapest and most specific first, so the failure you
 * see is the most useful one. Then the routing check, which needs a running
 * Worker and is the slowest thing here by an order of magnitude.
 *
 *   check-build            pages, chrome, indexing, nav, FAQ/schema agreement,
 *                          per-service data, unique titles, content-date shape.
 *                          Its check 3 IS the noindex scan — a stray noindex on
 *                          a normal build, a missing one on a staging build, and
 *                          a blanket Disallow in robots.txt. It is not repeated
 *                          as a separate script here: a second copy of an
 *                          assertion is a second thing to keep in step, and
 *                          "one source of truth" applies to gates too.
 *   check-schema           JSON-LD parses, is typed, resolves, and matches
 *                          visible content.
 *   check-links            every internal href resolves; no sitemap orphans.
 *   check-wrangler-config  no Cloudflare-side build block; the three asset
 *                          settings that cannot change.
 *   check-routing          481 paths against migration/routing-baseline.json,
 *                          served by a real Worker.
 *
 * THE ROUTING STEP MANAGES ITS OWN SERVER
 *
 * It starts `wrangler dev`, waits for it to answer, runs the check, and kills
 * it in a finally — including the workerd child processes, which on Windows
 * survive killing the parent and then hold a lock on dist/ that makes the NEXT
 * build fail with EPERM. That happened twice while this repo was being cleaned
 * up, and the second time a gate passed against a stale dist/ because of it.
 */
import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const skipRouting = process.argv.includes('--no-routing')
const PORT = 8787

if (!existsSync(resolve(root, 'dist')) || !existsSync(resolve(root, '.build/pages'))) {
  console.error('npm test: dist/ or .build/pages/ missing — run `npm run build` first.')
  process.exit(1)
}

function run(label, command, args) {
  process.stdout.write(`\n──────── ${label}\n`)
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' })
  return result.status === 0
}

const STATIC_GATES = [
  ['check-build', 'node', ['scripts/check-build.mjs']],
  ['check-schema', 'node', ['scripts/check-schema.mjs']],
  ['check-links', 'node', ['scripts/check-links.mjs']],
  ['check-wrangler-config', 'node', ['scripts/check-wrangler-config.mjs']],
]

const failed = []
for (const [label, command, args] of STATIC_GATES) {
  if (!run(label, command, args)) failed.push(label)
}

/** Kills wrangler and every workerd it spawned. See the note at the top. */
function killWorker(child) {
  try {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
      spawnSync('taskkill', ['/im', 'workerd.exe', '/F'], { stdio: 'ignore' })
    } else {
      process.kill(-child.pid, 'SIGKILL')
    }
  } catch {
    // Already gone.
  }
}

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      await fetch(url, { signal: AbortSignal.timeout(2000) })
      return true
    } catch {
      await new Promise((r) => setTimeout(r, 500))
    }
  }
  return false
}

if (skipRouting) {
  process.stdout.write('\n──────── check-routing SKIPPED (--no-routing)\n')
} else {
  process.stdout.write('\n──────── check-routing (starting wrangler dev)\n')
  const child = spawn('npx', ['wrangler', 'dev', '--local', '--port', String(PORT)], {
    cwd: root,
    stdio: 'ignore',
    shell: process.platform === 'win32',
    detached: process.platform !== 'win32',
  })

  try {
    if (!(await waitForServer(`http://localhost:${PORT}/`, 60000))) {
      console.error(`check-routing: wrangler dev did not answer on port ${PORT} within 60s`)
      failed.push('check-routing')
    } else if (!run('check-routing', 'node', ['scripts/check-routing.mjs', `http://localhost:${PORT}`])) {
      failed.push('check-routing')
    }
  } finally {
    killWorker(child)
  }
}

process.stdout.write('\n────────\n')
if (failed.length) {
  console.error(`npm test FAILED — ${failed.length} gate(s): ${failed.join(', ')}`)
  process.exit(1)
}
console.log('npm test passed — every gate green.')
