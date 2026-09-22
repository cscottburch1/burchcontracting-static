/**
 * The hand-authored pages, rendered through the shared chrome.
 *
 * Phase 3.3a-ii. These seven pages used to carry their own complete <head>,
 * <header> and <footer>, which is why they were copied verbatim into
 * .build/pages/ rather than generated, and why CHROME_EXEMPT existed. Now their
 * <main> bodies live in src/templates/ and everything around them comes from
 * src/chrome/, exactly like the other 52.
 *
 * 404.html is deliberately not here. It stays a verbatim copy: it must keep
 * noindex permanently, it is not in PAGE_URLS, and it is the one page whose
 * chrome is allowed to differ.
 *
 * WHAT THIS CHANGES, AND WHY THAT IS ACCEPTABLE
 *
 * The output is not byte-identical to what these pages shipped, for one
 * reason: their hand-written JSON-LD was pretty-printed, and documentHead()
 * emits it compact. Nothing semantic changes — snapshot-dist.mjs parses each
 * block and deep-sorts it before comparing, so the gate proves the graphs are
 * identical, and the block count stays at 75.
 *
 * Byte-identity was achievable by carrying the schema as raw strings. It was
 * rejected: it would have preserved formatting at the cost of keeping a second,
 * stringly-typed representation of data the rest of the pipeline holds as
 * objects, which is the opposite of what this phase is for.
 *
 * WHAT THE FIRST VERSION OF THIS FILE GOT WRONG
 *
 * It passed only title, description, canonical, ogImage and schema, and let
 * documentHead() default the rest. That silently changed og:type from 'website'
 * to 'article' on all seven pages, and on the home page it replaced a distinct
 * hand-written social blurb with the meta description — a content regression on
 * the most-shared URL on the site, in a commit whose message claimed the
 * extraction was mechanical.
 *
 * No gate saw it, because the snapshot captured the meta description and
 * nothing else from <head>. It now captures every og:* and twitter:*. The
 * lesson is narrower than "add a field": a default is a content decision when
 * the thing being defaulted already had a value.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { documentHead, pageFooter } from '../chrome/index.mjs'
import { HAND_AUTHORED_PAGES } from '../data/pages.js'
import { pageUrl } from '../data/url-map.js'

const templatesDir = resolve(import.meta.dirname, '../templates')

export function render() {
  return HAND_AUTHORED_PAGES.map((page) => {
    const name = page.file.replace(/\.html$/, '')
    const main = readFileSync(resolve(templatesDir, `${name}.html`), 'utf-8').trimEnd()

    return {
      url: pageUrl(page.file),
      file: page.file,
      html: [
        documentHead({
          title: page.title,
          description: page.description,
          canonical: page.canonical,
          ogImage: page.ogImage,
          ogType: page.ogType,
          ogDescription: page.ogDescription,
          schema: page.schema,
        }),
        main,
        pageFooter(page.scripts),
      ].join('\n'),
    }
  })
}
