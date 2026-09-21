/**
 * Shared chrome extraction and hashing, used by both scripts/snapshot-dist.mjs
 * (which records it per page) and scripts/check-build.mjs (which asserts every
 * page carries the same one). Kept in one place so the two can never disagree
 * about what "the same chrome" means — a gate and its baseline computing that
 * differently would be worse than having no gate.
 */
import crypto from 'node:crypto'

/** The raw <header> or <footer> block, or null if the page has none. */
export function chromeSource(html, tag) {
  const m = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, 'i').exec(html)
  return m ? m[0] : null
}

/**
 * Canonical form of a chrome block for hashing.
 *
 * The current page's nav link is styled differently from the rest — that is how
 * the nav shows where you are, and it is correct, not drift. There are two
 * mechanisms: the desktop nav uses aria-current plus active classes, the mobile
 * nav uses active classes ALONE with no aria-current. Keying off aria-current
 * alone therefore left /about, /contact, / and /projects each hashing uniquely
 * even though their chrome is the same.
 *
 * Rather than hardcode the active and inactive class strings, which would break
 * the moment the design changes, every anchor is reduced to its href and its
 * text. The hash then covers chrome structure, link targets and wording, and
 * ignores link styling.
 *
 * The trade-off, stated so nobody assumes otherwise: a change that alters only
 * anchor classes — restyling the nav without touching its links or text — will
 * not register. That is styling, not content. Everything else is verbatim.
 */
export function normalizeChrome(block) {
  return block
    .replace(/<a\b[^>]*>/gi, (openTag) => {
      const href = /href=["']([^"']*)["']/i.exec(openTag)?.[1] ?? ''
      return `<a href="${href}">`
    })
    .replace(/\s+/g, ' ')
    .trim()
}

/** Short stable hash of a page's chrome block, or null if it has none. */
export function chromeHash(html, tag) {
  const block = chromeSource(html, tag)
  if (!block) return null
  return crypto.createHash('sha1').update(normalizeChrome(block)).digest('hex').slice(0, 12)
}
