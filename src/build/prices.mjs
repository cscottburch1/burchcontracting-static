/**
 * Inline price tokens for hand-authored templates (Phase 6.6).
 *
 * A template cannot compute, so its prices were typed — and they drifted:
 * /services still showed the screened-porch "$15,000-$65,000" and garage
 * "$39,000-$145,000" headlines a phase after the service pages stopped saying
 * them, and the home page's porch and addition answers were older still. Now a
 * template writes the token and the build writes the price the service page
 * itself shows:
 *
 *   {{price.<service-id>}}  the service's headline, as on its page
 *                            ("$13,500–$51,500 Range")
 *   {{range.<service-id>}}  the same without its trailing label, for use
 *                            mid-sentence ("$13,500–$51,500")
 *
 * Unlike the {{group.key}} block placeholders, these sit inside a line, so
 * they are replaced in place. Applied to a page's stored JSON-LD as well as
 * its body, since a homepage FAQ answer lives in both and check 5 requires
 * the two to agree. An unknown service id fails the build; a token left
 * unfilled is caught by assertNoPlaceholders().
 */
import { SERVICES } from '../data/services.js'

const TOKEN = /\{\{(price|range)\.([a-z0-9-]+)\}\}/g

export function fillPrices(text, relFile) {
  return text.replace(TOKEN, (_, form, id) => {
    const service = SERVICES.find((s) => s.id === id)
    if (!service) throw new Error(`${relFile}: {{${form}.${id}}} names no service`)
    const headline = service.stats.costRange
    return form === 'price' ? headline : headline.replace(/ (Range|Typical|Per Sq Ft)$/, '')
  })
}
