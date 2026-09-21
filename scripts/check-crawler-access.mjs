/**
 * Fails if any search or AI crawler user agent is refused on any page.
 *
 *   node scripts/check-crawler-access.mjs [base-url]   (default: https://burchcontracting.com)
 *
 * Requests robots.txt, llms.txt, sitemap.xml and every sitemap URL once per
 * crawler and expects HTTP 200 — no 429, no 403, no challenge, no redirect.
 * Runs daily from .github/workflows/crawler-access.yml so a host, CDN or
 * Cloudflare setting that starts refusing crawlers is caught within a day.
 * (In September 2026 Hostinger's server-level rate limit was returning 429
 * to GPTBot on most pages with nothing in any dashboard showing it.)
 *
 * Limit: these requests carry crawler user-agent strings but come from a
 * non-crawler IP, so they catch user-agent rules, not IP-range rules. Confirm
 * real crawler traffic in Cloudflare's AI Crawl Control dashboard.
 */

const base = (process.argv[2] ?? 'https://burchcontracting.com').replace(/\/+$/, '')
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'

const CRAWLERS = {
  GPTBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.3; +https://openai.com/gptbot)',
  'OAI-SearchBot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.3; +https://openai.com/searchbot',
  'ChatGPT-User': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
  ClaudeBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
  'Claude-SearchBot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-SearchBot/1.0; +searchbot@anthropic.com)',
  'Claude-User': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)',
  PerplexityBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
  'Perplexity-User': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)',
  Googlebot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/128.0.0.0 Safari/537.36',
  Bingbot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/128.0.0.0 Safari/537.36',
  Applebot: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)',
  'Meta-ExternalAgent': 'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
}

const sitemap = await fetch(`${base}/sitemap.xml`, { headers: { 'user-agent': BROWSER_UA } })
if (!sitemap.ok) {
  console.error(`check-crawler-access: ${base}/sitemap.xml returned ${sitemap.status}`)
  process.exit(1)
}
const pageUrls = [...(await sitemap.text()).matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) =>
  m[1].replace(/^https:\/\/burchcontracting\.com/, base)
)
const urls = [`${base}/robots.txt`, `${base}/llms.txt`, `${base}/sitemap.xml`, ...pageUrls]

const jobs = Object.entries(CRAWLERS).flatMap(([name, ua]) => urls.map((url) => ({ name, ua, url })))
const failures = []
const okCount = Object.fromEntries(Object.keys(CRAWLERS).map((name) => [name, 0]))

let next = 0
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (next < jobs.length) {
      const job = jobs[next++]
      const status = await statusFor(job)
      if (status === 200) okCount[job.name]++
      else failures.push(`${job.name.padEnd(18)} ${String(status).padEnd(5)} ${job.url}`)
    }
  })
)

console.log(`check-crawler-access: ${urls.length} URLs × ${Object.keys(CRAWLERS).length} crawlers on ${base}\n`)
for (const [name, ok] of Object.entries(okCount)) {
  console.log(`  ${name.padEnd(18)} ${ok}/${urls.length} ${ok === urls.length ? 'OK' : 'REFUSED ON SOME PAGES'}`)
}

if (failures.length) {
  console.error(`\nFAILED — ${failures.length} request(s) did not return 200:\n  ${failures.slice(0, 60).join('\n  ')}`)
  process.exit(1)
}
console.log('\nPassed: every crawler got HTTP 200 on every URL.')

async function statusFor({ ua, url }) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { redirect: 'manual', headers: { 'user-agent': ua } })
      await response.arrayBuffer()
      return response.status
    } catch (error) {
      if (attempt === 3) return `ERR ${error.message}`
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
    }
  }
}
