/**
 * Q&A pairs that were promoted out of a page's own FAQ accordion into its
 * visible answers section.
 *
 * These exist as data because the operation that produced them cannot be
 * repeated. promoteFromAccordion() DELETES the source <details> from the page
 * as it promotes it, so a second run finds nothing — the generator guards that
 * with an "already present, nothing to recompute" branch, which means the
 * answers block on these two pages has been frozen since the first run and
 * could never pick up an edit.
 *
 * That was survivable while the generator patched committed HTML in place. It
 * stops being survivable the moment those pages render from a template: the
 * sources are already gone from src/templates/, so a regeneration would find
 * nothing, produce no answers, and silently drop a section from the home page.
 *
 * Extracted once from the rendered blocks in src/templates/, so the text here
 * is exactly what shipped. Answers carry inline HTML (links) and are inserted
 * verbatim, which is why the generator treats them as already escaped.
 */
import { SERVICES } from './services.js'
import { proseOf, proseSpan } from './pricing-sync.js'

const bath = SERVICES.find((s) => s.id === 'bathroom-remodeling')
const bathRow = (name) => {
  const found = bath.commonProjects.find((p) => p.name === name)
  if (!found) throw new Error(`promoted-faqs.js: bathroom-remodeling has no common project '${name}'`)
  return proseOf(found.cost)
}

export const PROMOTED_FAQS = {
  "index.html": [
    {
      "question": "Is Burch Contracting a licensed general contractor?",
      "answer": "Yes. Burch Contracting holds SC General Contractor License #CLG118679 and NC General Contractor License (Limited) #107292. Scott Burch has been a licensed residential builder since 1995 and a licensed general contractor since 2014. The company is fully insured and BBB A+ rated."
    },
    {
      "question": "What areas does Burch Contracting serve?",
      "answer": "Simpsonville, Fountain Inn, Mauldin, Greenville, Five Forks, Woodruff, Laurens, Gray Court, and surrounding Upstate SC communities. <a href=\"/#service-areas\" class=\"text-blue-700 font-semibold hover:text-blue-800\">View all service areas</a>."
    },
    {
      // Phase 6.6: the home page's cost answer leads with the lead offer, and
      // every figure is the bathroom page's own headline and table rows.
      "question": "How much does a bathroom remodel cost in Upstate SC?",
      "answer": `Bathroom remodels typically run ${proseSpan(bath)} depending on size and scope — about ${bathRow('Hall/Guest Bath — Basic Refresh')} for a 5×8 hall bath refresh, up to ${bathRow('Full-Gut Primary Bath')} for a full-gut primary bath. <a href="/calculator/bath-remodel" class="text-blue-700 font-semibold hover:text-blue-800">Use the bathroom remodel calculator</a> for a planning estimate.`
    }
  ],
  "services.html": [
    {
      "question": "How do I get a free consultation and ballpark estimate?",
      "answer": "Call (864) 724-4600 or use the contact form to describe your project. Scott Burch will discuss your goals and provide a free ballpark price range. A detailed written estimate, concept drawings, or floor plans are available for a fee, fully credited back if you hire us."
    },
    {
      "question": "Is Burch Contracting licensed and insured?",
      "answer": "Yes. Burch Contracting holds SC General Contractor License #CLG118679 and NC General Contractor License (Limited) #107292, is fully insured, and is BBB A+ rated."
    }
  ]
}
