import { readFileSync, readdirSync } from 'node:fs'
import { SERVICES } from './src/data/services.js'
import { SERVICE_FAQS } from './src/data/service-faqs.js'

const src = readFileSync('src/build/trust-layer.mjs', 'utf-8')
function mapKeys(name) {
  const i = src.indexOf('const ' + name + ' = {')
  const j = src.indexOf('\n}', i)
  return [...src.slice(i, j).matchAll(/^\s+'?([a-zA-Z0-9/-]+)'?:/gm)].map((m) => m[1])
}
const chooseIf = mapKeys('CHOOSE_IF')
const permit = mapKeys('PERMIT_REQUIRED')

console.log('SERVICES: ' + SERVICES.length)
console.log()
console.log('--- 1. every service has FAQs (keyed by service.id) ---')
const noFaqs = SERVICES.filter((s) => !(SERVICE_FAQS[s.id]?.length))
console.log(noFaqs.length ? '  MISSING: ' + noFaqs.map((s) => s.id).join(', ') : '  all 16 covered')

console.log()
console.log('--- 2. CHOOSE_IF covers every slug (lookup is CHOOSE_IF[s.slug]) ---')
const noChoose = SERVICES.filter((s) => !chooseIf.includes(s.slug))
console.log('  keys: ' + chooseIf.length)
console.log(noChoose.length ? '  SLUGS WITH NO ENTRY (' + noChoose.length + '): ' + noChoose.map((s) => s.slug).join(', ') : '  all covered')
const deadChoose = chooseIf.filter((k) => !SERVICES.some((s) => s.slug === k))
console.log(deadChoose.length ? '  DEAD KEYS (match no slug): ' + deadChoose.join(', ') : '  no dead keys')

console.log()
console.log('--- 3. PERMIT_REQUIRED covers every slug ---')
const noPermit = SERVICES.filter((s) => !permit.includes(s.slug))
console.log('  keys: ' + permit.length)
console.log(noPermit.length ? '  SLUGS WITH NO ENTRY (' + noPermit.length + '): ' + noPermit.map((s) => s.slug).join(', ') : '  all covered')
const deadPermit = permit.filter((k) => !SERVICES.some((s) => s.slug === k))
console.log(deadPermit.length ? '  DEAD KEYS: ' + deadPermit.join(', ') : '  no dead keys')

console.log()
console.log('--- 4. unique title and description per page (built pages) ---')
function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = dir + '/' + e.name
    if (e.isDirectory()) walk(p, out)
    else if (e.name.endsWith('.html')) out.push(p)
  }
  return out
}
const titles = new Map()
const descs = new Map()
for (const f of walk('.build/pages')) {
  const html = readFileSync(f, 'utf-8')
  const rel = f.replace('.build/pages/', '')
  const t = (html.match(/<title>([^<]*)<\/title>/) || [])[1]
  const d = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1]
  if (t) titles.set(t, [...(titles.get(t) || []), rel])
  if (d) descs.set(d, [...(descs.get(d) || []), rel])
}
for (const [label, m] of [['title', titles], ['description', descs]]) {
  const dupes = [...m.entries()].filter(([, v]) => v.length > 1)
  console.log('  duplicate ' + label + 's: ' + dupes.length)
  for (const [k, v] of dupes) console.log('    ' + JSON.stringify(k.slice(0, 70)) + ' -> ' + v.join(', '))
}
