/**
 * Long-form supplemental content for the /kitchen-remodeling/ pillar page.
 * Kept out of services.js to keep that file scannable — two raw HTML blocks
 * consumed by generate-services.mjs via service.richContentBeforeProcess /
 * service.richContentAfterProcess. Same pattern as
 * bathroom-remodeling-content.js.
 *
 * SOURCING: substance ported from the pre-migration Next.js site
 * (burch-contracting-vps-current: src/app/kitchen-remodeling/page.tsx),
 * which ranked for these topics before the 2026-07 migration. Every dollar
 * figure is either computed from calculator-config.js via pricing-sync.js
 * and passed in as a template value, or expressed as a soft qualitative
 * claim. The old copy's external stats (ROI percentages, HELOC rates) were
 * deliberately NOT carried over — verify against a live source and add them
 * back with citations if wanted, per the discipline documented in
 * bathroom-remodeling-content.js.
 *
 * FILE LOCATION: src/data/kitchen-remodeling-content.js
 */

export function kitchenRemodelingBeforeProcess({ midKitchen, refaceLow }) {
  return `
      <section class="bg-white py-16 lg:py-20 border-t border-slate-100">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h2 class="text-3xl font-bold text-slate-900 mb-6">Why Kitchen Remodels Cost What They Cost</h2>
            <p class="text-slate-600 leading-relaxed">A kitchen is the most trade-dense room in the house. Cabinetry, countertops, tile, flooring, plumbing, electrical, ventilation, and often structural work all converge in one space, and each trade has to sequence around the others. Cabinets alone typically consume the single largest share of a full remodel budget, which is why the cabinet decision — reface, stock, semi-custom, or custom — moves the total price more than any other choice you'll make. Countertop material is the second-biggest lever: the jump from laminate to quartz or granite changes both the counter line item and what the cabinets beneath them need to support.</p>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-slate-900 mb-4">Cabinet Replacement vs. Refacing</h3>
            <p class="text-slate-600 leading-relaxed">Refacing — new doors, drawer fronts, and veneer over your existing cabinet boxes — starts near $${Math.round(refaceLow / 1000)}K as part of a standard refresh and makes sense when two things are true: the boxes are structurally solid, and the layout already works for how you cook. If either fails, refacing is money spent polishing a floor plan you'll still dislike. Full replacement costs more but is the only path that fixes storage, workflow, and layout problems — and it's what the mid-range tier on this page prices. We'll tell you honestly which situation your kitchen is in during the first visit; roughly, refacing suits kitchens built well and laid out sensibly, and replacement suits everything else.</p>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-slate-900 mb-4">What a 4-7 Week Timeline Actually Looks Like</h3>
            <p class="text-slate-600 leading-relaxed">Most full kitchen remodels run four to seven weeks from demolition to punch list. The typical sequence: 3-7 days of demolition and disposal, one to two weeks of rough-in work (electrical circuits, plumbing reroutes, any structural changes), several days of drywall and paint, then cabinet installation, countertop templating and fabrication (counters are measured after cabinets are set, which builds in a fabrication wait), tile backsplash, flooring, and finally appliance and fixture installation. The fabrication wait in the middle is the part homeowners don't expect — it's also why a remodel with counters chosen and slabs reserved early runs weeks shorter than one where selections happen mid-project.</p>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-slate-900 mb-4">Can You Live at Home During a Kitchen Remodel?</h3>
            <p class="text-slate-600 leading-relaxed">Most of our clients do, and it's manageable with planning. We help homeowners set up a temporary kitchen — refrigerator, microwave, coffee maker, and a wash-up station in a laundry room or garage — before demolition starts, and we seal the work zone with dust barriers and keep water shutoffs as short as the work allows. The honest version: weeks two through four, when the room is stripped and the trades are cycling through, are the tiring stretch. A $${Math.round(midKitchen / 1000)}K remodel is disruptive for a season and then it's your kitchen for twenty years; families with very young children sometimes schedule a week away during rough-in, and that's usually the only stretch worth leaving for.</p>
          </div>
        </div>
      </section>`
}

export function kitchenRemodelingAfterProcess() {
  return `
      <section class="bg-slate-50 py-16 lg:py-20">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h2 class="text-3xl font-bold text-slate-900 mb-6">Where Kitchen Remodel Money Comes Back</h2>
            <p class="text-slate-600 leading-relaxed">In the Greenville County market, the upgrades that hold value are the unglamorous ones buyers now expect: stone countertops (quartz and granite both read as "done right"), a tiled backsplash, updated lighting on a real plan rather than a single ceiling fixture, and cabinetry with functioning drawers and doors. Highly personal choices — bold cabinet colors, specialty appliances, exotic materials — are worth doing if you'll enjoy them, but they're spending, not investing. If resale within a few years is part of your math, tell us; it changes which tier we'd recommend and where we'd put the budget.</p>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-slate-900 mb-4">Permits and Inspections in Greenville, Laurens & Spartanburg Counties</h3>
            <p class="text-slate-600 leading-relaxed">A cosmetic refresh — cabinets, counters, paint, flooring in the same footprint — generally doesn't require a permit. The moment a remodel moves plumbing, adds or alters electrical circuits, changes gas lines, or opens a wall, it does. As the licensed general contractor of record (SC #CLG118679), we pull the required permits and schedule inspections directly with the county, and we design rough-in work to pass the first inspection rather than the second. Unpermitted kitchen work surfaces at resale in this market; it's not a corner worth cutting.</p>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-slate-900 mb-4">Paying for a Kitchen Remodel</h3>
            <p class="text-slate-600 leading-relaxed">We don't offer in-house financing, and we're deliberately not a lender-referral operation. Homeowners we work with most commonly fund kitchens through home equity products, cash-out refinancing, or staged savings — and a phased remodel (counters and backsplash now, cabinets next year) is a legitimate plan we can scope honestly. Talk to your own bank or credit union about current rates; what we'll contribute is a fixed, itemized price so the number you're financing is real.</p>
          </div>
        </div>
      </section>`
}
