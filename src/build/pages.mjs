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
 *
 * THE TRUST LAYER (Phase 3.3c)
 *
 * Five of these seven also carry a byline, an answers section, a comparison
 * table and an Article/Person graph, which a separate script used to inject
 * into the committed HTML between marker comments. Those are computed here now,
 * from src/data/, and land on named {{trust.*}} placeholders in the template.
 *
 * That is why the Article graph is appended to page.schema rather than stored
 * in it: its headline comes from the template's own <h1> and its dates from git
 * history, so storing it would be storing a derived value — the exact
 * duplication this phase removes. Every block and every graph this produces was
 * verified byte-identical to what the marker spans held before the conversion.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { documentHead, imageUrl, pageFooter } from '../chrome/index.mjs'
import { CALCULATOR_PAGES_META } from '../data/calculators.js'
import { HAND_AUTHORED_PAGES } from '../data/pages.js'
import { pageUrl } from '../data/url-map.js'
import { calculatorTable, tabledPages } from './calculator-tables.mjs'
import { assertNoPlaceholders, fillBlocks } from './placeholders.mjs'
import { trustRender } from './trust-layer.mjs'

const templatesDir = resolve(import.meta.dirname, '../templates')

/**
 * One page: its template, its generated blocks, and the chrome around both.
 *
 * ORDER IS LOAD-BEARING on the calculators. The pricing table goes in first,
 * because trustRender() reads the table's own <h2> and the paragraph under it
 * to build the page's FAQPage schema — that is the visible question the schema
 * marks up. Fill the trust blocks first and every calculator's FAQPage silently
 * loses an entry, with nothing failing.
 *
 * This used to be enforced by the order of two commands in package.json's
 * prebuild ("ORDER MATTERS", said a comment in index.mjs). It is a sequence of
 * two statements in one function now, which is where a dependency between two
 * steps belongs.
 */
function renderPage(page, dates) {
  const name = page.file.replace(/\.html$/, '')
  let main = readFileSync(resolve(templatesDir, `${name}.html`), 'utf-8').trimEnd()

  if (main.includes('{{calculator.')) {
    main = fillBlocks(main, 'calculator', { table: calculatorTable(page.file) }, page.file)
  }

  // The two legal pages have no trust layer and no Article schema, so
  // trustRender is not called for them rather than called and discarded.
  const schema = page.schema ? [...page.schema] : []
  if (main.includes('{{trust.')) {
    const trust = trustRender({
      relFile: page.file,
      main,
      description: page.description,
      canonical: page.canonical,
      image: imageUrl(page.ogImage),
      dates: dates[page.file],
    })
    main = fillBlocks(trust.main, 'trust', trust.blocks, page.file)
    schema.push(trust.schema)
  }

  assertNoPlaceholders(main, page.file)

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
        schema,
      }),
      main,
      pageFooter(page.scripts),
    ].join('\n'),
  }
}

export function render({ dates }) {
  // Every page calculator-tables.mjs builds a table for must be rendered here,
  // or a pricing table is computed and thrown away — the failure fillBlocks()
  // catches per page, asserted once for the set.
  const rendered = new Set(CALCULATOR_PAGES_META.map((p) => p.file))
  for (const file of tabledPages()) {
    if (!rendered.has(file)) {
      throw new Error(`${file}: a pricing table is built for this page, but it is not in src/data/calculators.js`)
    }
  }

  for (const page of [...HAND_AUTHORED_PAGES, ...CALCULATOR_PAGES_META]) {
    if (!dates[page.file]) throw new Error(`${page.file}: no content dates — see src/build/content-dates.mjs`)
  }

  return [...HAND_AUTHORED_PAGES, ...CALCULATOR_PAGES_META].map((page) => renderPage(page, dates))
}
