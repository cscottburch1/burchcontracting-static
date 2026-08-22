/**
 * Long-form supplemental content for the /bathroom-remodeling pillar page.
 * Kept out of services.js to keep that file scannable — these are two raw
 * HTML blocks consumed by generate-services.mjs via
 * service.richContentBeforeProcess / service.richContentAfterProcess.
 *
 * SOURCING: every dollar figure here is either (a) computed from
 * calculator-config.js via pricing-sync.js in services.js and passed in as
 * a template value, or (b) an external stat verified against a live source
 * on 2026-08-16 (South Carolina Building Codes Council, Greenville County
 * Building Safety, 2026 Remodeling Cost vs. Value data, This Old House,
 * NKBA's 2026 Bath Trends Report, Resideline). Where sources disagreed or a
 * figure couldn't be confirmed, it was softened to a range or left out
 * rather than guessed — see the PR description for the list of adjustments
 * made to the original content brief.
 */

export function bathroomRemodelingBeforeProcess({ luxuryBath }) {
  return `
      <section class="bg-white py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h2 class="text-3xl font-bold text-slate-900 mb-6">Why Bathroom Remodels Cost What They Cost</h2>
            <p class="text-slate-600 leading-relaxed">Labor typically accounts for 45-60% of a bathroom remodel budget — a higher share than almost any other room in the house. A bathroom crams plumbing, electrical, waterproofing, tile, and finish carpentry into a space smaller than most bedrooms' closets, and every one of those trades has to show up and do real work even in a small room. There's no such thing as a small mistake behind tile: a waterproofing shortcut that would go unnoticed on paper turns into a rotted subfloor eighteen months later. That's why a $${Math.round(luxuryBath / 1000)}K bathroom and a $${Math.round(luxuryBath / 1000)}K deck are not comparable projects, even at the same price.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">Is a bathroom remodel worth it at resale?</h3>
            <p class="text-slate-600 leading-relaxed">A minor or mid-range bathroom remodel is one of the better-returning projects a homeowner can make. In the 2026 Remodeling Cost vs. Value data, a midrange bathroom remodel recoups roughly 74-80% of its cost at resale — the highest that figure has been since 2007 — while a small cosmetic refresh under $5,000 (new fixtures, paint, a vanity swap) can return 80-100%. Full luxury bathroom renovations return less proportionally, typically in the 45-60% range, because premium finishes don't add dollar-for-dollar value to most buyer pools. That doesn't make a luxury bath a bad decision — it means a luxury bath is bought for how a family lives in it, not for resale math, while a mid-range remodel is the closer thing to a pure financial play. In the Simpsonville market, where the median home price sits around $400,000 as of mid-2026 in a corridor built out heavily since 2000, an original builder-grade bathroom is one of the more visible things a buyer notices walking through a listing.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">How does Upstate SC compare to national averages?</h3>
            <p class="text-slate-600 leading-relaxed">This Old House's 2026 data puts the national bathroom remodel average around $15,586, with a common range of roughly $6,456-$24,715, and per-square-foot figures spanning about $70-$250 depending on scope (budget work runs closer to $80-$120/sq ft, mid-range $180-$280/sq ft, and luxury $500-$800+/sq ft in most national guides). Greenville and Laurens County labor rates track close to national, and material costs have largely converged with national pricing since 2022 as supply chains normalized. The gap homeowners usually notice is between a "national average" they saw in a headline and a real local quote — national averages are pulled down by cosmetic refreshes and DIY-adjacent work, so an honest full-scope quote from a licensed contractor often lands above the number a quick search turns up.</p>
          </div>
        </div>
      </section>

      <section class="bg-slate-50 py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-2">Bathroom Remodel Permits &amp; Code Requirements — Greenville &amp; Laurens County</h2>
          <p class="text-slate-600 mb-8 leading-relaxed">Yes — most bathroom remodels in Greenville County require a permit. Greenville County requires a permit any time a new building is constructed, structural changes are made within a building, or additions are made to an existing structure, and more specifically flags bathroom remodels over $5,000 or work touching the foundation, framing, plumbing, electrical, or HVAC. A purely cosmetic refresh — paint, a like-for-like vanity swap, a new mirror, a toilet replaced in the same spot — typically doesn't need one. Anything that opens a wall, moves a fixture, or adds a circuit does. Burch Contracting pulls all required permits under SC license #CLG118679 as part of the contract; homeowners don't file anything themselves. The City of Simpsonville and the City of Fountain Inn administer permits within their municipal limits, unincorporated areas fall under Greenville County, and Laurens County covers the Gray Court and Laurens service areas — call ahead rather than guess which jurisdiction applies to a given address.</p>
          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table class="w-full border-collapse text-left">
              <caption class="caption-top text-sm text-slate-500 text-left px-4 py-3 bg-slate-100">Residential bathroom code requirements under the 2021 South Carolina Residential Code, 2021 SC Plumbing Code, and 2020 NEC — effective statewide January 1, 2023</caption>
              <thead class="bg-slate-100">
                <tr>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Requirement</th>
                  <th scope="col" class="px-4 py-3 text-sm font-semibold text-slate-900">Standard</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left align-top">Minimum shower size</th>
                  <td class="px-4 py-3 text-slate-600 text-sm leading-relaxed">900 sq in interior cross-sectional area, minimum 30" in any dimension (IRC R307.2)</td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left align-top">Toilet clearance</th>
                  <td class="px-4 py-3 text-slate-600 text-sm leading-relaxed">15" minimum from centerline to any wall, partition, or fixture (30" total width); 21" clear in front (IRC R307.1)</td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left align-top">Shower/tub valve</th>
                  <td class="px-4 py-3 text-slate-600 text-sm leading-relaxed">Pressure-balancing or thermostatic mixing valve required, field-set to a maximum of 120°F (IPC 424.3)</td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left align-top">Safety glazing</th>
                  <td class="px-4 py-3 text-slate-600 text-sm leading-relaxed">Required for glass within 60" horizontally of a tub or shower's edge, or less than 60" above the floor</td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left align-top">Bathroom receptacles</th>
                  <td class="px-4 py-3 text-slate-600 text-sm leading-relaxed">GFCI protection required on all bathroom receptacles (2020 NEC 210.8(A)(1))</td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left align-top">Bathroom circuit</th>
                  <td class="px-4 py-3 text-slate-600 text-sm leading-relaxed">At least one dedicated 20-amp, 120V circuit supplying the bathroom's receptacle outlets (2020 NEC 210.11(C)(3))</td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left align-top">Receptacle placement</th>
                  <td class="px-4 py-3 text-slate-600 text-sm leading-relaxed">At least one receptacle required within 36" of the outside edge of each lavatory basin</td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left align-top">Exhaust ventilation</th>
                  <td class="px-4 py-3 text-slate-600 text-sm leading-relaxed">50 CFM intermittent or 20 CFM continuous, ducted to the exterior — never into the attic (IRC M1507)</td>
                </tr>
                <tr class="border-t border-slate-200">
                  <th scope="row" class="px-4 py-3 font-bold text-slate-900 text-left align-top">Ceiling height</th>
                  <td class="px-4 py-3 text-slate-600 text-sm leading-relaxed">7'6" generally; showers and tub/shower areas may run as low as 6'8" (80") over the fixture</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-slate-400 text-xs mt-4">Code sections and adopted editions confirmed against the South Carolina Building Codes Council and Greenville County Building Safety as of the last-reviewed date below. Local amendments can vary by jurisdiction — confirm project-specific requirements with the county or city before finalizing a design. Questions on a specific address: Greenville County Building Safety, 864.467.7060.</p>
        </div>
      </section>

      <section class="bg-white py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-8">What Drives a Bathroom Remodel Price Up or Down</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-7">
              <h3 class="font-bold text-slate-900 text-lg mb-4">What pushes cost up</h3>
              <ul class="space-y-2 text-sm text-slate-700">
                <li class="flex items-start gap-2"><span class="text-blue-700 mt-0.5" aria-hidden="true">&#8593;</span><span>Relocating plumbing fixtures instead of keeping the existing layout</span></li>
                <li class="flex items-start gap-2"><span class="text-blue-700 mt-0.5" aria-hidden="true">&#8593;</span><span>Curbless (zero-entry) showers and linear drains</span></li>
                <li class="flex items-start gap-2"><span class="text-blue-700 mt-0.5" aria-hidden="true">&#8593;</span><span>Large-format, natural stone, or intricate-pattern tile</span></li>
                <li class="flex items-start gap-2"><span class="text-blue-700 mt-0.5" aria-hidden="true">&#8593;</span><span>Frameless glass shower enclosures</span></li>
                <li class="flex items-start gap-2"><span class="text-blue-700 mt-0.5" aria-hidden="true">&#8593;</span><span>Double vanities, heated floors, and structural changes</span></li>
                <li class="flex items-start gap-2"><span class="text-blue-700 mt-0.5" aria-hidden="true">&#8593;</span><span>Older homes with cast-iron drains, knob-and-tube wiring, or second-floor baths</span></li>
              </ul>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-7">
              <h3 class="font-bold text-slate-900 text-lg mb-4">What keeps cost down</h3>
              <ul class="space-y-2 text-sm text-slate-700">
                <li class="flex items-start gap-2"><span class="text-blue-700 mt-0.5" aria-hidden="true">&#8595;</span><span>Keeping plumbing fixtures in their existing locations</span></li>
                <li class="flex items-start gap-2"><span class="text-blue-700 mt-0.5" aria-hidden="true">&#8595;</span><span>Prefab shower base with tiled walls instead of a full custom pan</span></li>
                <li class="flex items-start gap-2"><span class="text-blue-700 mt-0.5" aria-hidden="true">&#8595;</span><span>Stock vanity instead of custom cabinetry</span></li>
                <li class="flex items-start gap-2"><span class="text-blue-700 mt-0.5" aria-hidden="true">&#8595;</span><span>Ceramic tile instead of porcelain or natural stone</span></li>
                <li class="flex items-start gap-2"><span class="text-blue-700 mt-0.5" aria-hidden="true">&#8595;</span><span>Single vanity and a standard alcove tub or shower</span></li>
                <li class="flex items-start gap-2"><span class="text-blue-700 mt-0.5" aria-hidden="true">&#8595;</span><span>Bundling with another project already underway in the same house</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>`
}

export function bathroomRemodelingAfterProcess() {
  return `
      <section class="bg-slate-50 py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-10">Materials &amp; Design Choices That Matter</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-white border border-slate-200 rounded-xl p-7">
              <h3 class="font-bold text-slate-900 text-lg mb-2">Tile</h3>
              <p class="text-slate-600 text-sm leading-relaxed">Porcelain's low water absorption is why it dominates wet areas over ceramic, and natural stone brings a premium look at a premium price and sealing schedule. Large-format tile means fewer grout lines — 89% of design professionals surveyed for NKBA's 2026 Bath Trends Report want smaller or no grout lines, and 80% expect large-format tile to lead the bathroom market over the next three years — but large format demands a flatter substrate and more prep labor, not less.</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-xl p-7">
              <h3 class="font-bold text-slate-900 text-lg mb-2">Waterproofing</h3>
              <p class="text-slate-600 text-sm leading-relaxed">This is the single most important decision nobody sees once the tile is on. A sheet or liquid waterproofing membrane (Schluter-KERDI or equivalent) behind tile and under a shower pan is what separates a remodel that lasts decades from one that rots the subfloor in three years. "Greenboard and hope" is not a waterproofing system, no matter how good the tile above it looks on day one.</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-xl p-7">
              <h3 class="font-bold text-slate-900 text-lg mb-2">Showers</h3>
              <p class="text-slate-600 text-sm leading-relaxed">Curbless (zero-entry) showers, linear drains, wet rooms, niches, and benches are the direction the whole category is moving — 55% of design professionals now say a larger shower matters more than having a bathtub at all. A curbless shower (a shower with no raised threshold, floor sloped to a drain instead) reads as both more accessible and more modern, which is why it shows up on both the ADA and the luxury end of this page's project list.</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-xl p-7">
              <h3 class="font-bold text-slate-900 text-lg mb-2">Ventilation</h3>
              <p class="text-slate-600 text-sm leading-relaxed">Correct CFM sizing and ducting straight to the exterior — never into the attic — is the least glamorous decision in a bathroom remodel and the one most likely to cause a callback if it's wrong. Undersized or improperly vented exhaust is the single most common cause of premature failure in an otherwise well-built bathroom: trapped humidity finds the nearest wood it can rot.</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-xl p-7">
              <h3 class="font-bold text-slate-900 text-lg mb-2">Vanities &amp; counters</h3>
              <p class="text-slate-600 text-sm leading-relaxed">Stock, semi-custom, and full-custom vanities span a wide price range, and quartz, granite, and cultured marble each have a different maintenance profile. Wood-faced vanities have overtaken painted finishes in 2026 preference (62% vs. 53% in NKBA's survey) as biophilic, natural-material design keeps gaining ground in the bath.</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-xl p-7">
              <h3 class="font-bold text-slate-900 text-lg mb-2">Fixtures &amp; finishes</h3>
              <p class="text-slate-600 text-sm leading-relaxed">Matte (54%), brushed (51%), and satin (46%) finishes now outpace polished chrome (39%) in the same NKBA survey. Mixing metals within a bathroom is fine; mixing undertones — warm brass against a cool-toned gray tile, for instance — is the mistake that makes a finished bathroom feel slightly off without an obvious reason why.</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-xl p-7">
              <h3 class="font-bold text-slate-900 text-lg mb-2">Lighting</h3>
              <p class="text-slate-600 text-sm leading-relaxed">91% of design professionals rank lighting quality as a top consideration, 92% say task lighting belongs in every primary bath, 88% prioritize natural light, and 80% are specifying nighttime-specific lighting for overnight bathroom trips. Layer ambient, task, and night lighting — and get the mirror lighting right, because nothing else in the room photographs well if that's wrong.</p>
            </div>
            <div class="bg-white border border-slate-200 rounded-xl p-7">
              <h3 class="font-bold text-slate-900 text-lg mb-2">Aging in place</h3>
              <p class="text-slate-600 text-sm leading-relaxed">Blocking the walls for future grab bars during a remodel costs almost nothing; adding it after the tile is up costs real money and a torn-out wall. 32% of design professionals now consider aging-in-place design mainstream and another 48% see it as an emerging standard, not a niche request. For a bathroom built specifically around accessibility from the start, see our <a href="/ada-bath-to-shower/" class="text-blue-700 hover:text-blue-800 underline">ADA bath-to-shower conversions</a> — that page owns the accessibility-first version of this project.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-white py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-4">Bathroom Remodeling in Simpsonville &amp; Fountain Inn, SC</h2>
          <p class="text-slate-600 leading-relaxed mb-8">Simpsonville and Fountain Inn anchor the Golden Strip corridor southeast of Greenville, where subdivision development has run heavy for the better part of two decades. That means a large concentration of homes built roughly between 2000 and 2015 — houses now old enough that builder-grade bathrooms, cultured-marble countertops, and fiberglass tub surrounds are due for replacement, and where the primary bathroom is often the last original room left in the house. We also remodel bathrooms in Five Forks, Mauldin, Greenville, Woodruff, Laurens, and Gray Court.</p>
          <div class="flex flex-wrap gap-3">
            <a href="/service-areas/simpsonville.html" class="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700 transition-colors">Simpsonville</a>
            <a href="/service-areas/fountain-inn.html" class="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700 transition-colors">Fountain Inn</a>
            <a href="/service-areas/five-forks.html" class="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700 transition-colors">Five Forks</a>
            <a href="/service-areas/mauldin.html" class="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700 transition-colors">Mauldin</a>
            <a href="/service-areas/greenville.html" class="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700 transition-colors">Greenville</a>
            <a href="/service-areas/woodruff.html" class="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700 transition-colors">Woodruff</a>
            <a href="/service-areas/laurens.html" class="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700 transition-colors">Laurens</a>
            <a href="/service-areas/gray-court.html" class="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700 transition-colors">Gray Court</a>
          </div>
        </div>
      </section>`
}
