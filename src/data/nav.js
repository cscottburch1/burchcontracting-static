/**
 * The site navigation, as data.
 *
 * Phase 3.3a-i. The header used to be a 147-line literal in src/chrome/, which
 * meant the current page could not be marked without either hand-editing every
 * page or regex-substituting class strings at render time. The second option
 * was rejected: a class string is exactly the kind of thing a design tweak
 * changes, and a substitution that silently stops matching produces a page that
 * looks fine, passes every gate, and has lost its active state. That failure
 * mode has already cost this project twice.
 *
 * With the items here and the class strings as constants, check-build can
 * assert the marking directly instead of hoping it happened.
 *
 * Phase 6 reorders these by the `tier` field it introduces; the ordering lives
 * here so that becomes a data change rather than a markup change.
 */

/**
 * Nav link classes. Exported as constants, not inlined, because check-build
 * compares against them: every nav anchor's class must equal either the active
 * or the inactive constant for its context. Change one here and the gate
 * follows; change one in the markup only and the gate fails, which is the
 * point.
 *
 * The active values are taken verbatim from what the hand-authored pages
 * already shipped, so those pages render byte-identically once Phase 3.3a-ii
 * moves them into this pipeline.
 */
export const NAV_CLASS = {
  desktopTop: 'text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors',
  desktopTopActive: 'text-blue-700 font-semibold text-sm transition-colors',
  desktopButton: 'flex items-center gap-1 font-medium text-sm text-slate-600 hover:text-blue-700 transition-colors py-2',
  desktopButtonActive: 'flex items-center gap-1 font-semibold text-sm text-blue-700 transition-colors py-2',
  desktopItem: 'block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors',
  desktopCta: 'bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors duration-200',

  mobileTop: 'text-slate-700 hover:text-blue-700 hover:bg-slate-50 font-medium px-3 py-2 rounded-lg text-sm transition-colors',
  mobileTopActive: 'text-blue-700 font-semibold px-3 py-2 rounded-lg bg-blue-50 text-sm',
  mobileButton: 'flex items-center justify-between text-left font-semibold text-slate-900 py-2 w-full',
  mobileButtonActive: 'flex items-center justify-between text-left font-semibold text-blue-700 py-2 w-full',
  mobileItem: 'text-slate-700 text-sm py-1 hover:text-blue-700',
  mobileCta: 'mt-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg font-semibold text-sm text-center transition-colors',
}

/** Services dropdown, as its two rendered columns. */
export const SERVICES_MENU = [
  [
    { heading: 'Outdoor Living', items: [
      { href: '/outdoor-living/decks', label: 'Custom Decks' },
      { href: '/outdoor-living/screened-porches', label: 'Screened Porches' },
      { href: '/outdoor-living/covered-patios', label: 'Covered Patios' },
    ] },
    { heading: 'Construction', items: [
      { href: '/garage-builder', label: 'Garages' },
      { href: '/room-additions', label: 'Room Additions' },
      { href: '/adu-builder', label: 'ADU Builder' },
      { href: '/basement-finishing', label: 'Basement Finishing' },
    ] },
  ],
  [
    // A raw '&' rather than '&amp;' — this is what ships today, and matching it
    // exactly is what lets this commit prove header(null) is byte-identical to
    // the literal it replaced. It is a (tolerated) HTML validity wart; fixing it
    // is a one-character content change that belongs in its own commit, not
    // smuggled into a refactor whose whole claim is that nothing changed.
    { heading: 'Remodeling & More', items: [
      { href: '/remodeling', label: 'Home Remodeling' },
      { href: '/bathroom-remodeling', label: 'Bathroom Remodeling' },
      { href: '/kitchen-remodeling', label: 'Kitchen Remodeling' },
      { href: '/insurance-restoration', label: 'Insurance Restoration' },
    ] },
    { heading: 'Commercial', items: [
      { href: '/commercial-upfits', label: 'Commercial Upfits' },
      { href: '/commercial-roofing', label: 'Commercial Roofing' },
    ] },
    { heading: 'Accessibility', items: [
      { href: '/ada-compliance', label: 'ADA Compliance' },
      { href: '/ada-bath-to-shower', label: 'ADA Bath to Shower' },
      { href: '/handyman', label: 'Handyman Services' },
    ] },
  ],
]

/** Service Areas dropdown. */
export const AREAS_MENU = [
  { href: '/service-areas/simpsonville', label: 'Simpsonville' },
  { href: '/service-areas/fountain-inn', label: 'Fountain Inn' },
  { href: '/service-areas/mauldin', label: 'Mauldin' },
  { href: '/service-areas/greenville', label: 'Greenville' },
  { href: '/service-areas/five-forks', label: 'Five Forks' },
  { href: '/service-areas/woodruff', label: 'Woodruff' },
  { href: '/service-areas/laurens', label: 'Laurens' },
  { href: '/service-areas/gray-court', label: 'Gray Court' },
]

const SERVICE_HREFS = SERVICES_MENU.flat().flatMap((g) => g.items.map((i) => i.href))

/**
 * Top-level items, in render order.
 *
 * `group` lists the paths and path-prefixes an item covers, so a page that is
 * not itself in the nav still lights the right parent: a service page lights
 * Services, /service-areas/* lights Service Areas, and the cost guides, blog
 * and calculators light Cost Guides. A prefix ends with '/'.
 *
 * `cta` marks the call-to-action button. It shares /contact with the Contact
 * link, and marking both would put two aria-current elements in one nav, so it
 * is never marked. That is why the flag exists.
 */
export const NAV = [
  { href: '/', label: 'Home' },
  { label: 'Services', dropdown: 'services', group: ['/services', ...SERVICE_HREFS] },
  { label: 'Service Areas', dropdown: 'areas', group: ['/service-areas/'] },
  { href: '/cost', label: 'Cost Guides', group: ['/cost/', '/blog', '/blog/', '/calculator/'] },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/contact', label: 'Get Your Free Consultation', cta: true },
]

/**
 * The single top-level item a path activates, or null.
 *
 * Exactly one, by construction: the first item whose href equals the path or
 * whose group covers it. Pages outside the nav — the legal pages, 404, /faqs —
 * activate nothing, which is correct rather than a gap.
 */
export function activeNavItem(path) {
  if (!path) return null
  for (const item of NAV) {
    if (item.cta) continue
    if (item.href === path) return item
    if (item.group?.some((g) => (g.endsWith('/') ? path.startsWith(g) : g === path))) return item
  }
  return null
}
