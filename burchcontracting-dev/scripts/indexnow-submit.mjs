/**
 * Tells IndexNow which pages to re-crawl, so Bing, Yandex, Seznam and Naver
 * pick up changes in minutes instead of waiting for their own crawl. Bing's
 * index is what Copilot and ChatGPT search read from, and the retired Next.js
 * site had this while the static site did not.
 *
 * Runs after a verified production deploy (.github/workflows/cloudflare.yml).
 *
 *   node scripts/indexnow-submit.mjs                     # every sitemap URL
 *   node scripts/indexnow-submit.mjs --dry-run           # print, send nothing
 *   node scripts/indexnow-submit.mjs --url https://burchcontracting.com/faqs.html
 *
 * The key is a public file in public/ named <key>.txt whose only content is
 * <key> — that file is how the search engines verify a submission belongs to
 * whoever controls the site. It is not a secret, and it must stay reachable
 * for as long as it is used.
 */
import fs from 'node:fs'
import path from 'node:path'

const ENDPOINT = 'https://api.indexnow.org/indexnow'
const SITE = 'https://burchcontracting.com'
const MAX_URLS = 10000

const root = path.resolve(import.meta.dirname, '..')
const publicDir = path.join(root, 'public')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const explicitUrls = args.map((arg, i) => (arg === '--url' ? args[i + 1] : null)).filter(Boolean)

const key = findKey()
const urls = explicitUrls.length ? explicitUrls : sitemapUrls()

if (!urls.length) {
  console.error('indexnow-submit: no URLs to submit')
  process.exit(1)
}
if (urls.length > MAX_URLS) {
  console.error(`indexnow-submit: ${urls.length} URLs exceeds IndexNow's limit of ${MAX_URLS} per request`)
  process.exit(1)
}

const payload = {
  host: new URL(SITE).hostname,
  key,
  keyLocation: `${SITE}/${key}.txt`,
  urlList: urls,
}

console.log(`indexnow-submit: ${urls.length} URL(s), key file ${payload.keyLocation}`)

if (dryRun) {
  console.log(JSON.stringify(payload, null, 2))
  console.log('indexnow-submit: --dry-run, nothing sent.')
  process.exit(0)
}

// The key file has to be readable by the search engines, or every submission
// is rejected. Checking first turns a silent no-op into a clear failure.
const keyFile = await fetch(payload.keyLocation, { headers: { 'user-agent': 'burchcontracting-indexnow-check' } })
const keyFileBody = (await keyFile.text()).trim()
if (!keyFile.ok || keyFileBody !== key) {
  console.error(`indexnow-submit: ${payload.keyLocation} returned ${keyFile.status} with body "${keyFileBody.slice(0, 40)}" — expected the key itself. Deploy the key file before submitting.`)
  process.exit(1)
}

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
})
const body = (await response.text()).trim()

// 200 OK and 202 Accepted (key validation pending) both mean submitted.
if (response.status !== 200 && response.status !== 202) {
  console.error(`indexnow-submit: IndexNow returned ${response.status} ${response.statusText}${body ? ` — ${body}` : ''}`)
  process.exit(1)
}

console.log(`indexnow-submit: IndexNow accepted the submission (${response.status}${body ? ` ${body}` : ''}).`)

function findKey() {
  const candidates = fs.readdirSync(publicDir).filter((file) => /^[0-9a-zA-Z-]{8,128}\.txt$/.test(file))
  for (const file of candidates) {
    const name = file.replace(/\.txt$/, '')
    if (fs.readFileSync(path.join(publicDir, file), 'utf8').trim() === name) return name
  }
  throw new Error('indexnow-submit: no key file in public/ — expected <key>.txt containing exactly <key>')
}

function sitemapUrls() {
  const xml = fs.readFileSync(path.join(publicDir, 'sitemap.xml'), 'utf8')
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1])
}
