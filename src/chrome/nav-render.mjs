/**
 * Renders the nav elements of the header from src/data/nav.js.
 *
 * Only the anchors and dropdown buttons are generated here; the surrounding
 * structure stays a literal in index.mjs. That split is deliberate — it makes
 * the rewrite provably neutral, because header(null) must come out
 * byte-identical to the 147-line literal it replaced, and the fewer lines this
 * file is responsible for, the smaller the surface where that can go wrong.
 *
 * Every class string comes from NAV_CLASS. Nothing here writes a class literal,
 * so the markup and the constants check-build asserts against cannot drift
 * apart — which was the whole objection to doing this with a regex substitution.
 *
 * Indentation is significant: it is reproduced exactly so the output matches
 * what shipped before.
 */
import { AREAS_MENU, NAV_CLASS, SERVICES_MENU } from '../data/nav.js'

const I16 = ' '.repeat(16)
const I18 = ' '.repeat(18)
const I20 = ' '.repeat(20)

/**
 * aria-current goes on the element itself, never on a wrapper — a wrapper
 * survives normalizeChrome() and would give every page a different header hash.
 *
 * The VALUE matters too. "page" means "this link points to the page you are
 * on", so it is only correct on an exact href match. A section parent — the
 * Cost Guides link while you are reading /blog/something — gets "true", which
 * means "this is the current item in its set". Marking that "page" would have a
 * screen reader announce "current page" for a link that navigates elsewhere.
 */
function current(match) {
  if (match === 'page') return ' aria-current="page"'
  if (match === 'section') return ' aria-current="true"'
  return ''
}

/** How an item relates to the current path: exact page, section parent, or no. */
export function matchKind(href, currentPath, isActiveItem = false) {
  if (href && href === currentPath) return 'page'
  return isActiveItem ? 'section' : null
}

export function desktopTopLink(item, isActive, currentPath) {
  const cls = isActive ? NAV_CLASS.desktopTopActive : NAV_CLASS.desktopTop
  return `${I16}<a href="${item.href}"${current(matchKind(item.href, currentPath, isActive))} class="${cls}">${item.label}</a>`
}

export function desktopCta(item) {
  return [
    `${I16}<a href="${item.href}" class="${NAV_CLASS.desktopCta}">`,
    `${I18}${item.label}`,
    `${I16}</a>`,
  ].join('\n')
}

/**
 * Dropdown buttons are deliberately NOT marked. See the note on marking in
 * src/data/nav.js: a <button> survives normalizeChrome(), so marking one would
 * give every service page a different header hash and break the assertion that
 * all 71 share one. The anchor inside the dropdown carries aria-current
 * instead, which is also where the ARIA spec wants it — on the link to the
 * current page.
 */
export function desktopDropdownButton(label) {
  const cls = NAV_CLASS.desktopButton
  return [
    `${I16}<button type="button" class="${cls}">`,
    `${I18}${label}`,
    `${I18}<svg class="w-3.5 h-3.5 transition-transform group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>`,
    `${I16}</button>`,
  ].join('\n')
}

export function desktopServicesColumns(currentPath) {
  return SERVICES_MENU.map((column) => {
    const inner = column.map((section) => [
      `${I20}<p class="px-3 pb-1 pt-3 first:pt-0 text-xs font-semibold uppercase tracking-wide text-slate-400">${section.heading}</p>`,
      ...section.items.map((i) => `${I20}<a href="${i.href}"${current(matchKind(i.href, currentPath))} class="${NAV_CLASS.desktopItem}">${i.label}</a>`),
    ].join('\n')).join('\n')
    return [`${I20}<div>`, inner, `${I20}</div>`].join('\n')
  }).join('\n')
}

export function desktopAreasItems(currentPath) {
  return AREAS_MENU.map((a) => `${I20}<a href="${a.href}"${current(matchKind(a.href, currentPath))} class="${NAV_CLASS.desktopItem}">${a.label}</a>`).join('\n')
}

export function mobileTopLink(item, isActive, currentPath) {
  const cls = isActive ? NAV_CLASS.mobileTopActive : NAV_CLASS.mobileTop
  return `${I16}<a href="${item.href}"${current(matchKind(item.href, currentPath, isActive))} class="${cls}">${item.label}</a>`
}

export function mobileCta(item) {
  return [
    `${I16}<a href="${item.href}" class="${NAV_CLASS.mobileCta}">`,
    `${I18}${item.label}`,
    `${I16}</a>`,
  ].join('\n')
}

/** Not marked, for the same reason as desktopDropdownButton. */
export function mobileAccordionButton(key, label) {
  const cls = NAV_CLASS.mobileButton
  return [
    `${I16}<button type="button" data-mobile-accordion="${key}" class="${cls}">`,
    `${I18}${label}`,
    `${I18}<span data-mobile-accordion-icon class="text-sm">+</span>`,
    `${I16}</button>`,
  ].join('\n')
}

export function mobileServicesItems(currentPath) {
  return SERVICES_MENU.flat()
    .flatMap((section) => section.items)
    .map((i) => `${I16}  <a href="${i.href}"${current(matchKind(i.href, currentPath))} class="${NAV_CLASS.mobileItem}">${i.label}</a>`)
    .join('\n')
}

export function mobileAreasItems(currentPath) {
  return AREAS_MENU.map((a) => `${I16}  <a href="${a.href}"${current(matchKind(a.href, currentPath))} class="${NAV_CLASS.mobileItem}">${a.label}</a>`).join('\n')
}

/**
 * Plural forms. These exist so index.mjs never needs a newline escape inside a
 * template literal — a backslash in that position has silently corrupted three
 * separate edits in this refactor, each time producing something that parsed
 * and did the wrong thing.
 */
export function desktopTopLinks(items, active, currentPath) {
  return items.map((i) => desktopTopLink(i, i === active, currentPath)).join('\n')
}

export function mobileTopLinks(items, active, currentPath) {
  return items.map((i) => mobileTopLink(i, i === active, currentPath)).join('\n')
}
