/**
 * The 11 cost guides, restored at the URLs the retired Next.js site used.
 *
 * Why they're back: Search Console measured cost/estimate queries losing 1,347
 * impressions in the eight weeks after the 2026-07 rebuild, with 225 such
 * queries losing every impression (migration/baseline-2026-09.md). These pages
 * answered them, and they were redirected to calculators — a calculator is a
 * tool, not an answer to "how much does a garage cost in Laurens SC".
 *
 * Every price is COMPUTED from src/js/calculator-config.js through the `p`
 * helper passed to each `lead` and tier. Nothing here is typed by hand. The
 * legacy pages did type their numbers, and they had drifted badly: that garage
 * guide claimed $46,080-$93,600 for a 2-car garage where the calculator
 * computes about $27,300-$32,900 for a 400 sq ft attached basic build. Pages
 * that contradict the site's own tools are worse than no pages.
 *
 * What was NOT carried over from the old versions:
 *   - the prose, which was templated filler ("X is one of the most common
 *     search topics we hear from homeowners")
 *   - the FAQs, which were one shared generic trio repeated across all 24
 *     pages. Each guide below has its own questions.
 *
 * `p` (per entry, bound to serviceKey):
 *   p.perSqft            "$68-145" — the service's full per-sq-ft band
 *   p.tier(rateId, sqft) "$27,320–$32,901" for that tier at that size
 *   p.perSqftTier(rateId) per-sq-ft band for one tier
 */

export const COST_GUIDES = [
  {
    slug: 'garage-construction-cost-laurens-sc',
    service: 'Garage Construction',
    city: 'Laurens, SC',
    serviceKey: 'garages',
    calculator: 'calculator/garages.html',
    servicePage: 'garage-builder/index.html',
    permitCounty: 'Laurens County',
    h1: 'Garage Construction Cost in Laurens, SC',
    metaTitle: 'Garage Construction Cost Laurens SC',
    metaDescription:
      'What a detached, attached or workshop garage costs in Laurens SC, with per-square-foot ranges computed from our own pricing, plus what moves the number.',
    lead: (p) =>
      `A garage in Laurens County runs <strong>${p.perSqft} per square foot</strong> built and finished, so a standard 24×24 (576 sq ft) detached garage lands around ${p.tier('detachedStandard', 576)}. Attached builds start lower per foot because one wall and part of the roof already exist; workshop and carriage-house builds run highest.`,
    tiers: [
      {
        label: 'Attached garage, basic finish',
        rateId: 'attachedBasic',
        sqft: 576,
        note: 'Shares a wall and roofline with the house. Slab, framing, one or two doors, basic lighting and outlets.',
      },
      {
        label: 'Detached garage, standard finish',
        rateId: 'detachedStandard',
        sqft: 576,
        note: 'Free-standing, its own roof and full four walls, siding matched to the house, a service door and windows.',
      },
      {
        label: 'Workshop or carriage house',
        rateId: 'upgradedWorkshop',
        sqft: 900,
        note: 'Larger footprint, 220V service for tools, taller walls, insulation, and finished interior surfaces.',
      },
    ],
    drivers: [
      'Footprint. A 2-car garage is typically 400–576 sq ft; a 3-car or workshop is 720–1,200 sq ft, and the per-foot rate falls slightly as the slab and roof get bigger.',
      'Attached or detached. Attached saves a wall and part of the roof but adds the tie-in: matching the roofline, siding and fascia so it does not read as an add-on.',
      'Site and slab. A flat, accessible lot pours cheaply. Slope, poor drainage, rock or a long concrete pour all add cost before framing starts.',
      'Doors. A basic steel door is a fraction of an insulated carriage-style door, and a second door adds header work as well as hardware.',
      'Electrical. Lights and a few outlets is one thing; a 220V circuit for a welder, compressor or lift is a different scope.',
      'Interior finish. Bare studs, insulated and drywalled, or fully finished and heated are three different budgets in the same shell.',
    ],
    sections: [
      {
        heading: 'What you get at each level',
        body: (p) =>
          `<p>The three bands above are the same structure priced at three finish levels, not three different buildings. The cheapest way to add covered parking is an attached basic build on flat ground; the most expensive is a detached workshop with upgraded doors, insulation and a subpanel.</p><p>If you are weighing a garage against a carport or a garage with living space above, the per-foot figures diverge quickly — a garage apartment carries full living-space costs, closer to the ${p.perSqftOther('homeAdditions')} per square foot a room addition runs.</p>`,
      },
    ],
    faqs: [
      {
        q: 'How much does a 2-car garage cost in Laurens SC?',
        a: (p) =>
          `Budget ${p.tier('detachedStandard', 576)} for a standard 24×24 detached garage, finished. An attached build of the same size starts nearer ${p.tier('attachedBasic', 576)} because it borrows a wall and part of the roof from the house.`,
      },
      {
        q: 'Is it cheaper to build attached or detached?',
        a: () =>
          'Attached is usually cheaper per square foot — you are not framing a fourth wall or a separate roof. Detached wins when the house has no sensible wall to build against, when you want the noise away from bedrooms, or when setbacks make an attached footprint awkward.',
      },
      {
        q: 'Do I need a permit for a garage in Laurens County?',
        a: () =>
          'Yes. A new garage is a permitted structure: it needs a building permit, and electrical work needs its own. Laurens County Building Codes handles the review and inspections, and setbacks from property lines are checked at plan stage — worth confirming before you settle on a location.',
      },
      {
        q: 'How long does a garage take to build?',
        a: () =>
          'Six to ten weeks for a standard detached garage once permits are in hand, assuming no weather delays and the slab cures on schedule. Larger workshop builds with interior finish run longer.',
      },
      {
        q: 'Can a garage be built on a sloped lot?',
        a: () =>
          'Yes, but the foundation changes. A sloped site may need a stepped footing, retaining work or fill to get a level slab, and that shows up as foundation and site-prep cost before any framing.',
      },
    ],
  },

  {
    slug: 'home-addition-cost-greenville-sc',
    service: 'Home Additions',
    city: 'Greenville, SC',
    serviceKey: 'homeAdditions',
    calculator: 'calculator/additions.html',
    servicePage: 'room-additions/index.html',
    permitCounty: 'Greenville County',
    h1: 'Home Addition Cost in Greenville, SC',
    metaTitle: 'Home Addition Cost Greenville SC',
    metaDescription:
      'Home addition costs in Greenville SC by size and finish level, computed from our own pricing, plus the foundation, roofline and HVAC choices that move it.',
    lead: (p) =>
      `Adding finished square footage in Greenville County runs <strong>${p.perSqft} per square foot</strong>, so a 400 sq ft room addition typically lands between ${p.tier('basicFinish', 400)} and ${p.tier('premiumCustom', 400)} depending on finish level. Additions cost more per foot than new construction because you are cutting into a finished, occupied house.`,
    tiers: [
      {
        label: 'Basic finish, 300 sq ft',
        rateId: 'basicFinish',
        sqft: 300,
        note: 'Single room — office, bedroom or den. Foundation, framing, roof tie-in, insulation, drywall, standard trim and finishes.',
      },
      {
        label: 'Standard living space, 400 sq ft',
        rateId: 'standardLivingSpace',
        sqft: 400,
        note: 'Family room or larger bedroom with a fuller finish package, more windows, and HVAC capacity added rather than borrowed.',
      },
      {
        label: 'Premium custom, 600 sq ft',
        rateId: 'premiumCustom',
        sqft: 600,
        note: 'Vaulted ceilings, upgraded windows and doors, custom trim, and a layout that reworks how the existing house flows.',
      },
    ],
    drivers: [
      'Foundation type. A crawlspace, a slab and a full basement are three very different numbers under the same floor plan.',
      'Roofline. A simple shed roof off a straight wall is the cheapest tie-in. Matching a hip or gable into an existing complex roof costs real money and is where bad additions look bad.',
      'HVAC. Sometimes the existing system has spare capacity; often it does not, and the addition needs its own zone, ductwork, or a second unit.',
      'Structural work. Removing a load-bearing wall between old and new means a beam, posts and a footing, plus an engineer to size them.',
      'Electrical capacity. A full panel may need upgrading before it can carry new circuits.',
      'Finish level. Trim detail, built-ins, flooring and window quality can swing the same footprint by a third.',
    ],
    sections: [
      {
        heading: 'Does a second story cost more than building out?',
        body: () =>
          '<p>Usually, yes. Building up avoids new foundation and roof area, which sounds cheaper, but it adds structural reinforcement of everything below, a stair that eats floor area on both levels, and the near-certainty of living elsewhere while the roof is off. Building out costs more in foundation and roof but is generally the simpler, more predictable project.</p>',
      },
      {
        heading: 'Where additions go over budget',
        body: () =>
          '<p>Three places, in our experience: discovering the existing structure is not what the plans assumed once a wall is open; HVAC turning out to need its own system rather than a tie-in; and finish decisions made late, after the budget was set on standard allowances. The first is why an allowance for the unknown belongs in an addition budget from the start.</p>',
      },
    ],
    faqs: [
      {
        q: 'How much does a 400 square foot addition cost in Greenville?',
        a: (p) =>
          `Between ${p.tier('basicFinish', 400)} and ${p.tier('premiumCustom', 400)}, depending on finish level and how complicated the tie-in is. The mid-range figure most homeowners land on for a finished living space of that size is around ${p.tier('standardLivingSpace', 400)}.`,
      },
      {
        q: 'Why do additions cost more per square foot than a new house?',
        a: () =>
          'Because a new house is built in open air on a clean site with no constraints. An addition works around an existing structure, matches finishes that may no longer be sold, protects a house people are living in, and does all of it in a smaller area where fixed costs spread over fewer square feet.',
      },
      {
        q: 'Do I need a permit for a room addition in Greenville County?',
        a: () =>
          'Yes — an addition needs a building permit, and the trades need their own. Greenville County Building Safety reviews the plans and inspects the work in stages. Setbacks, easements and sometimes HOA review govern where the addition can sit.',
      },
      {
        q: 'How long does a room addition take?',
        a: () =>
          'Commonly ten to sixteen weeks of construction for a single-room addition once permits are issued, plus design and permitting time before that. Complex roof tie-ins, structural work or long-lead windows extend it.',
      },
      {
        q: 'Can we stay in the house during an addition?',
        a: () =>
          'Usually yes, which is one of the advantages of building out rather than up. Expect noise, dust control at the tie-in wall, and a few days where the connection between old and new is open and sealed only temporarily.',
      },
    ],
  },

  {
    slug: 'room-addition-cost-greenville-sc',
    service: 'Room Additions',
    city: 'Greenville, SC',
    serviceKey: 'homeAdditions',
    calculator: 'calculator/additions.html',
    servicePage: 'room-additions/index.html',
    permitCounty: 'Greenville County',
    h1: 'Room Addition Cost in Greenville, SC',
    metaTitle: 'Room Addition Cost Greenville SC | Burch Contracting',
    metaDescription:
      'What a bedroom, office or family-room addition costs in Greenville SC, by room type and size, with ranges computed from our own pricing.',
    lead: (p) =>
      `Room additions in Greenville County run <strong>${p.perSqft} per square foot</strong> of finished space. A 12×16 bedroom addition (about 200 sq ft) starts near ${p.tier('basicFinish', 200)}; a 20×20 family room (400 sq ft) with a full finish package runs closer to ${p.tier('standardLivingSpace', 400)}.`,
    tiers: [
      {
        label: 'Bedroom or office, 200 sq ft',
        rateId: 'basicFinish',
        sqft: 200,
        note: 'One room, one or two windows, a door into the existing house, standard finishes and a tie into existing HVAC where capacity allows.',
      },
      {
        label: 'Family room, 400 sq ft',
        rateId: 'standardLivingSpace',
        sqft: 400,
        note: 'Larger span, more glass, dedicated HVAC capacity, and a finish level that matches the main living areas.',
      },
      {
        label: 'Primary suite, 500 sq ft',
        rateId: 'premiumCustom',
        sqft: 500,
        note: 'Bedroom plus bath and closet, which brings plumbing, ventilation and tile into the scope alongside the structure.',
      },
    ],
    drivers: [
      'Room type. A bedroom is structure and finishes. A suite with a bathroom adds plumbing, waterproofing, tile and ventilation — a different project at the same square footage.',
      'Plumbing distance. How far the new bath sits from existing drain lines decides whether the plumbing is routine or invasive.',
      'Foundation and access. Equipment access to the build area, and whether the ground needs work before a footing goes in.',
      'Window and door package. Standard units versus large or custom sizes changes both material and framing cost.',
      'Matching the exterior. Siding, brick and roofing that are no longer manufactured have to be sourced or blended.',
    ],
    sections: [
      {
        heading: 'Which room additions pay off',
        body: () =>
          '<p>A primary suite and a genuinely usable family room tend to hold their value best in the Upstate, because they fix what buyers notice: too few bedrooms with an en-suite, or nowhere for a family to sit together. A bedroom squeezed onto an awkward corner of the house, reached through another room, rarely does.</p>',
      },
    ],
    faqs: [
      {
        q: 'How much does it cost to add a bedroom in Greenville SC?',
        a: (p) =>
          `A 200 sq ft bedroom addition starts around ${p.tier('basicFinish', 200)} finished. Adding an en-suite bathroom moves it toward ${p.tier('premiumCustom', 300)} for the combined space, because plumbing, tile and ventilation come with it.`,
      },
      {
        q: 'Is it cheaper to convert a garage than build an addition?',
        a: () =>
          'Often, yes — the foundation, walls and roof already exist, so the work is insulation, HVAC, flooring, drywall and windows. The trade-off is losing covered parking and storage, which affects resale in some neighborhoods more than others.',
      },
      {
        q: 'What is the minimum practical size for a room addition?',
        a: () =>
          'Around 120–150 sq ft for a usable bedroom or office. Below that, fixed costs — the footing, the roof tie-in, the permit, the HVAC connection — dominate, and the cost per square foot climbs sharply for very little gained space.',
      },
      {
        q: 'Will an addition need HOA approval?',
        a: () =>
          'In many Greenville County subdivisions, yes, and the review governs exterior appearance rather than structure. It is worth starting that process early; approval timelines are outside a contractor’s control and can hold up permitting.',
      },
    ],
  },

  {
    slug: 'cost-to-build-a-deck-simpsonville-sc',
    service: 'Deck Building',
    city: 'Simpsonville, SC',
    serviceKey: 'decks',
    calculator: 'calculator/decks.html',
    servicePage: 'outdoor-living/decks/index.html',
    permitCounty: 'Greenville County',
    h1: 'Cost to Build a Deck in Simpsonville, SC',
    metaTitle: 'Cost to Build a Deck in Simpsonville SC | Pricing Guide',
    metaDescription:
      'What building a deck costs in Simpsonville SC — pressure-treated versus composite, per square foot and by size, computed from our own pricing.',
    lead: (p) =>
      `Decks in Simpsonville run <strong>${p.perSqft} per square foot</strong> built. A 16×20 pressure-treated deck (320 sq ft) lands around ${p.tier('pressureTreated', 320)}; the same deck in composite with an upgraded rail runs about ${p.tier('compositeLowMaintenance', 320)}.`,
    tiers: [
      {
        label: 'Pressure-treated, 320 sq ft',
        rateId: 'pressureTreated',
        sqft: 320,
        note: 'Treated framing and decking, wood rail, one set of stairs. The most deck per dollar, with annual cleaning and periodic sealing.',
      },
      {
        label: 'Composite, 320 sq ft',
        rateId: 'compositeLowMaintenance',
        sqft: 320,
        note: 'Treated frame with composite boards and an aluminum or composite rail. Costs more up front, gives back the sealing weekends.',
      },
      {
        label: 'Premium multi-level, 500 sq ft',
        rateId: 'premiumComposite',
        sqft: 500,
        note: 'More than one level, wider stairs, integrated lighting, and built-ins such as benches or planters.',
      },
    ],
    drivers: [
      'Square footage, which sets material volume and framing labor together.',
      'Decking material. Treated wood is the cheapest board on day one; composite costs more and removes the recurring maintenance.',
      'Height above grade. A deck a step down from the door is simple. A deck one storey up means longer posts, deeper footings and code-driven guard details.',
      'Railing. Linear feet of rail, and its material, is a larger share of a small deck’s budget than most homeowners expect.',
      'Stairs. Every run needs framing, treads, and usually a landing; two runs cost roughly twice one.',
      'Extras that read as small: lighting, privacy screening, benches, a pergola. Each is its own scope.',
    ],
    sections: [
      {
        heading: 'Composite or pressure-treated?',
        body: (p) =>
          `<p>On a 320 sq ft deck the gap is roughly ${p.tier('pressureTreated', 320)} against ${p.tier('compositeLowMaintenance', 320)}. Treated wood wins on first cost. Composite wins if you would rather not clean and seal every year or two, and it holds its appearance longer in Upstate sun. Both use a treated frame — the difference is what you walk on and hold.</p>`,
      },
    ],
    faqs: [
      {
        q: 'How much does a 16x20 deck cost in Simpsonville?',
        a: (p) =>
          `About ${p.tier('pressureTreated', 320)} in pressure-treated wood, or roughly ${p.tier('compositeLowMaintenance', 320)} in composite with an upgraded railing. Height above grade and stair count move both figures.`,
      },
      {
        q: 'Do I need a permit to build a deck in Simpsonville?',
        a: () =>
          'Generally yes, for an attached deck or any deck above a minimal height. Greenville County Building Safety reviews footing depth, framing spans and guard height, and inspects before the decking covers the frame. Many Simpsonville subdivisions also require HOA approval of the design.',
      },
      {
        q: 'How long does a deck take to build?',
        a: () =>
          'Most single-level decks are two to three weeks from footings to final inspection, weather permitting. Multi-level decks with lighting and built-ins take longer.',
      },
      {
        q: 'Can you build a deck over an existing patio?',
        a: () =>
          'Sometimes. It depends on whether footings can be placed through or beside the slab and whether the resulting height still works with the door threshold. It is worth checking before assuming the slab saves money.',
      },
      {
        q: 'What is the cheapest way to add outdoor living space?',
        a: (p) =>
          `A ground-level treated deck, at ${p.perSqftTier('pressureTreated')} per square foot, is the least expensive built structure. Screening it later costs less than building a screened porch from scratch, so a deck now can be a first phase rather than a compromise.`,
      },
    ],
  },

  {
    slug: 'deck-cost-simpsonville-sc',
    service: 'Deck Builder',
    city: 'Simpsonville, SC',
    serviceKey: 'decks',
    calculator: 'calculator/decks.html',
    servicePage: 'outdoor-living/decks/index.html',
    permitCounty: 'Greenville County',
    h1: 'Deck Cost in Simpsonville, SC',
    metaTitle: 'Deck Cost Simpsonville SC | Burch Contracting',
    metaDescription:
      'Deck costs in Simpsonville SC by size and material, computed from our own pricing, with the height, railing and stair factors that change the total.',
    lead: (p) =>
      `Expect <strong>${p.perSqft} per square foot</strong> for a built deck in Simpsonville. That puts a small 10×12 deck near ${p.tier('pressureTreated', 120)} and a 20×24 entertaining deck in composite near ${p.tier('compositeLowMaintenance', 480)}.`,
    tiers: [
      {
        label: 'Small deck, 120 sq ft',
        rateId: 'pressureTreated',
        sqft: 120,
        note: 'A 10×12 landing off a back door — grill space and a small table. Treated framing and decking.',
      },
      {
        label: 'Family deck, 320 sq ft',
        rateId: 'compositeLowMaintenance',
        sqft: 320,
        note: 'A 16×20 in composite: seating and dining together, with low-maintenance boards and rail.',
      },
      {
        label: 'Entertaining deck, 480 sq ft',
        rateId: 'premiumComposite',
        sqft: 480,
        note: 'A 20×24 with premium decking, lighting, wide stairs and room for distinct zones.',
      },
    ],
    drivers: [
      'Size. Per-square-foot rates fall slightly as decks grow, because footings, stairs and permits spread over more area.',
      'Material grade, from treated pine through mid-range composite to capped premium boards.',
      'Elevation and footing depth, which rise together as the deck gets further off the ground.',
      'Railing length, driven by perimeter rather than area — small decks carry proportionally more of it.',
      'Site access. A back yard reachable only through a narrow gate slows material handling.',
    ],
    sections: [],
    faqs: [
      {
        q: 'What does a deck cost per square foot in Simpsonville?',
        a: (p) => `${p.perSqft} per square foot built, with treated wood at the low end and premium composite with lighting and built-ins at the high end.`,
      },
      {
        q: 'Is a small deck cheaper per square foot?',
        a: () =>
          'No — it is usually more. Footings, stairs, railing and the permit are near-fixed costs, so a 120 sq ft deck carries them across far fewer square feet than a 400 sq ft one.',
      },
      {
        q: 'How long does a deck last in South Carolina?',
        a: () =>
          'A properly built treated deck lasts decades structurally, though the boards and rail weather first and may need replacing sooner. Composite decking typically carries a long manufacturer warranty and holds appearance better through Upstate summers.',
      },
      {
        q: 'Does a deck add value to a home?',
        a: () =>
          'Usable outdoor space is one of the more reliable improvements in this market, particularly when it connects sensibly to the kitchen or living area. An awkward deck reached through a bedroom does much less.',
      },
    ],
  },

  {
    // Added 2026-09-25. The September export has the Greenville deck-cost
    // queries on page one with no guide for them, the calculator ranking
    // instead: "deck cost greenville sc" (8.8), "composite deck cost greenville
    // sc" (9.1), "how much does a deck cost greenville" (9.8). Every fact here
    // is from this repo: prices from calculator-config through the price
    // helper, the timeline from services.js, the project from CITY_PROJECTS
    // and projects.html, city and county permitting from geo-aeo.js.
    slug: 'deck-cost-greenville-sc',
    service: 'Deck Building',
    city: 'Greenville, SC',
    serviceKey: 'decks',
    calculator: 'calculator/decks.html',
    servicePage: 'outdoor-living/decks/index.html',
    permitCounty: 'Greenville County',
    h1: 'Deck Cost in Greenville, SC',
    metaTitle: 'Deck Cost Greenville SC: Composite vs Wood Pricing',
    metaDescription:
      'What a deck costs in Greenville SC, composite or pressure-treated, by size and height, computed from the same pricing our deck calculator uses.',
    lead: (p) =>
      `A deck in Greenville runs <strong>${p.perSqft} per square foot</strong> built. A 12×16 pressure-treated deck (192 sq ft) comes in around ${p.tier('pressureTreated', 192)}; the same deck in composite runs about ${p.tier('compositeLowMaintenance', 192)}.`,
    tiers: [
      {
        label: 'Pressure-treated, 12×16',
        rateId: 'pressureTreated',
        sqft: 192,
        note: 'Treated framing, decking and wood rail with one stair run. Room for a table and grill off the back door.',
      },
      {
        label: 'Composite, 14×20',
        rateId: 'compositeLowMaintenance',
        sqft: 280,
        note: 'Treated frame under composite boards and a low-maintenance rail. Seating and dining on one level.',
      },
      {
        label: 'Multi-level premium, 400 sq ft',
        rateId: 'premiumComposite',
        sqft: 400,
        note: 'Two levels joined by stairs, premium decking, lighting and built-ins such as benches or a bar top.',
      },
    ],
    drivers: [
      'Composite or treated boards: the biggest single choice on the material side, since the frame underneath is treated lumber either way.',
      'Height off the ground. A deck at the back-door step is simple; one a storey up needs taller posts, deeper footings and code-driven guards.',
      'Levels. A second level adds stairs, another guard run and more framing for the same floor area.',
      'Railing, priced by the foot of perimeter, so it weighs more on a small deck than a large one.',
      'Built-ins and extras such as lighting, a bar, benches or a fire feature. Each is a scope of its own on top of the per-foot rate.',
    ],
    sections: [
      {
        heading: 'Composite or pressure-treated?',
        body: (p) =>
          `<p>On a 14×20 deck the choice is roughly ${p.tier('pressureTreated', 280)} in treated wood against ${p.tier('compositeLowMaintenance', 280)} in composite. Treated wood costs less on day one and needs cleaning and sealing every year or two. Composite costs more up front and skips that upkeep. The frame is treated lumber in both cases, so the difference is in the boards and the rail, and in how you want to spend your weekends.</p>`,
      },
      {
        heading: 'A Greenville deck we built',
        body: () =>
          '<p>One of our Greenville projects is a multi-level wood deck with an outdoor bar, a fire pit and built-in seating, designed for entertaining. It shows how cost builds: the second level, the bar and the seating are each their own scope, which is why a deck like it prices well above a single-level deck with the same floor area. It is on our <a href="/projects" class="text-blue-700 hover:text-blue-800 underline">projects page</a>.</p>',
      },
    ],
    faqs: [
      {
        q: 'How much does a deck cost in Greenville SC?',
        a: (p) =>
          `${p.perSqft} per square foot built. A 12×16 pressure-treated deck runs about ${p.tier('pressureTreated', 192)}, and a 14×20 composite deck about ${p.tier('compositeLowMaintenance', 280)}. Height, stairs and built-ins move both.`,
      },
      {
        q: 'What does a composite deck cost in Greenville?',
        a: (p) =>
          `${p.perSqftTier('compositeLowMaintenance')} per square foot for composite boards and rail on a treated frame, which puts a 14×20 deck near ${p.tier('compositeLowMaintenance', 280)}. Premium capped boards with lighting and built-ins run ${p.perSqftTier('premiumComposite')} per square foot.`,
      },
      {
        q: 'Do I need a permit to build a deck in Greenville?',
        a: () =>
          'For an attached deck, or one more than a step or two off the ground, generally yes. Which office issues it depends on the address: the City of Greenville inside city limits, and Greenville County Building Safety outside them. We pull the permit and schedule the inspections as part of the job.',
      },
      {
        q: 'How long does it take to build a deck?',
        a: () =>
          'Two to four weeks is typical for us, from footings to final inspection, weather permitting. Multi-level decks with lighting and built-ins take longer.',
      },
    ],
  },

  {
    slug: 'basement-finishing-cost-greenville-sc',
    service: 'Basement Finishing',
    city: 'Greenville, SC',
    serviceKey: 'basementFinishing',
    calculator: 'calculator/basement-finishing.html',
    servicePage: 'basement-finishing/index.html',
    permitCounty: 'Greenville County',
    h1: 'Basement Finishing Cost in Greenville, SC',
    metaTitle: 'Basement Finishing Cost Greenville SC | Burch Contracting',
    metaDescription:
      'Basement finishing costs in Greenville SC per square foot and by scope, computed from our own pricing, including egress, moisture control and bathrooms.',
    lead: (p) =>
      `Finishing a basement in Greenville County runs <strong>${p.perSqft} per square foot</strong>, so an 800 sq ft basement typically falls between ${p.tier('basicFinish', 800)} and ${p.tier('premiumBuildOut', 800)}. It is the cheapest finished square footage you can add, because the foundation, walls and roof are already there.`,
    tiers: [
      {
        label: 'Basic finish, 800 sq ft',
        rateId: 'basicFinish',
        sqft: 800,
        note: 'Framing, insulation, drywall, flooring, lighting and outlets. One open space — a rec room or play area.',
      },
      {
        label: 'Standard living suite, 800 sq ft',
        rateId: 'standardLivingSuite',
        sqft: 800,
        note: 'Divided rooms, better lighting design, upgraded flooring, and usually a bathroom in the scope.',
      },
      {
        label: 'Premium build-out, 1,000 sq ft',
        rateId: 'premiumBuildOut',
        sqft: 1000,
        note: 'Guest suite or media room: full bath, wet bar or kitchenette, built-ins, and finishes matching the main floor.',
      },
    ],
    drivers: [
      'Moisture first. Any water intrusion gets solved before framing — drainage, sealing, sometimes a sump. Finishing over a damp basement is money thrown away.',
      'Egress. A basement bedroom needs a code-compliant egress window or door, which can mean cutting the foundation wall and excavating a well.',
      'Bathroom. Below-grade plumbing may need a pump rather than gravity drainage, which changes the cost of adding a bath.',
      'Ceiling height and obstructions. Ducts, beams and pipes running below joists have to be boxed, rerouted or lived with.',
      'HVAC capacity for the new conditioned space, and whether the existing system can carry it.',
      'Room count. Every partition adds framing, drywall, doors, trim and electrical.',
    ],
    sections: [
      {
        heading: 'Why basements are the cheapest square footage',
        body: (p) =>
          `<p>At ${p.perSqft} per square foot, finishing a basement costs roughly a third to a quarter of what the same finished area costs as an addition, where ${p.perSqftOther('homeAdditions')} per square foot is typical. The shell exists. What you are buying is insulation, surfaces, light, air and — where required — egress.</p>`,
      },
      {
        heading: 'What we check before quoting',
        body: () =>
          '<p>Signs of past water at the slab edge and wall base; whether the existing HVAC has capacity; where the drain line sits relative to a proposed bathroom; ceiling height under the lowest duct; and whether any planned bedroom can get compliant egress without structural surprises.</p>',
      },
    ],
    faqs: [
      {
        q: 'How much does it cost to finish a 1,000 square foot basement in Greenville?',
        a: (p) =>
          `Between ${p.tier('basicFinish', 1000)} and ${p.tier('premiumBuildOut', 1000)} depending on scope. A single open rec room sits at the low end; a guest suite with a full bath and wet bar sits at the high end.`,
      },
      {
        q: 'Do I need a permit to finish a basement?',
        a: () =>
          'Yes. Framing, electrical, plumbing and HVAC in a basement conversion are all permitted work, inspected in stages by Greenville County Building Safety. Egress and smoke-alarm requirements are checked as part of it.',
      },
      {
        q: 'Does a finished basement count toward square footage?',
        a: () =>
          'For appraisal purposes below-grade finished space is usually valued separately from above-grade square footage, and rules vary by appraiser and market. It adds real usable space and real value; it does not simply add to the headline number the way an addition does.',
      },
      {
        q: 'Can a basement bedroom be legal without a window?',
        a: () =>
          'No. A bedroom needs code-compliant egress — a window or door of specified size and sill height that a person can get out of. That is one of the first things to confirm, because retrofitting egress into a foundation wall is a significant part of some budgets.',
      },
      {
        q: 'How long does basement finishing take?',
        a: () =>
          'Typically six to twelve weeks depending on room count, whether a bathroom is included, and whether moisture or egress work comes first.',
      },
    ],
  },

  {
    slug: 'screened-porch-vs-sunroom-sc',
    service: 'Screened Porches & Sunrooms',
    city: 'Upstate South Carolina',
    serviceKey: 'screenedPorches',
    calculator: 'calculator/porch.html',
    servicePage: 'outdoor-living/screened-porches/index.html',
    permitCounty: 'Greenville County',
    h1: 'Screened Porch vs Sunroom in South Carolina',
    metaTitle: 'Screened Porch vs Sunroom in SC',
    metaDescription:
      'Screened porch or sunroom for a South Carolina home: what each costs, how many months you actually use them, and which suits your house.',
    lead: (p) =>
      `A screened porch runs <strong>${p.perSqft} per square foot</strong> in Upstate SC — about ${p.tier('newScreenedPorch', 300)} for a 15×20. A sunroom costs meaningfully more because it is glazed, insulated and usually conditioned: it is a room, where a screened porch is shelter. The right answer depends on whether you want more months of use or more square feet of outdoors.`,
    tiers: [
      {
        label: 'Screen an existing deck or porch',
        rateId: 'enclosureOnly',
        sqft: 250,
        note: 'The cheapest route by far: the floor and often the roof already exist, so the work is posts, screening and a door.',
      },
      {
        label: 'New screened porch, 300 sq ft',
        rateId: 'newScreenedPorch',
        sqft: 300,
        note: 'Built from the ground up — footings, floor, roof tied into the house, screening, ceiling and a fan.',
      },
      {
        label: 'Upgraded outdoor room, 400 sq ft',
        rateId: 'upgradedOutdoorRoom',
        sqft: 400,
        note: 'Finished ceiling, better screen system, upgraded lighting and often a fireplace or outdoor kitchen allowance.',
      },
    ],
    drivers: [
      'Whether a floor and roof already exist. Screening an existing covered deck is the single biggest cost saving available.',
      'Roof design. A shed roof off the back wall is simplest; tying a hip or gable into the existing roof costs more and looks better.',
      'Wall system, which is the real difference between the two options: screen, single glazing, or insulated glass.',
      'Climate control. A fan and shade, versus a mini-split and insulation, is the line between three-season and year-round.',
      'Foundation. Deck-supported, slab-on-grade or a raised floor structure each price differently.',
    ],
    sections: [
      {
        heading: 'How the two compare',
        body: (p) =>
          `<p><strong>Screened porch.</strong> ${p.perSqft} per square foot. Comfortable roughly March through November here — shade, breeze and no insects. It reads as outdoor space, and it does not add conditioned square footage.</p>
           <p><strong>Sunroom.</strong> More per square foot than a porch and closer to addition pricing once it is insulated and conditioned, because that is effectively what it is. Usable all twelve months, keeps pollen and rain out entirely, and can count as living space.</p>
           <p>The practical test: if you want somewhere to sit on summer evenings, a screened porch does it for less. If you want a room you can use in January and heat like the rest of the house, you want a sunroom, and you should budget it like an addition.</p>`,
      },
      {
        heading: 'What most Upstate homeowners choose',
        body: () =>
          '<p>More often a screened porch, for two reasons: the shoulder seasons here are long and pleasant, and converting an existing deck keeps the cost well below a glazed room. Sunrooms make sense when the space needs to be part of the house year-round — a breakfast room, an office, a place with furniture that cannot take humidity.</p>',
      },
    ],
    faqs: [
      {
        q: 'Is a sunroom more expensive than a screened porch?',
        a: (p) =>
          `Yes, generally by a wide margin. A new screened porch of 300 sq ft runs about ${p.tier('newScreenedPorch', 300)}. A sunroom of the same size is insulated, glazed and usually conditioned, which pushes it toward room-addition pricing of ${p.perSqftOther('homeAdditions')} per square foot.`,
      },
      {
        q: 'Can I screen in a deck I already have?',
        a: (p) =>
          `Often yes, and it is the best value in outdoor living — roughly ${p.perSqftTier('enclosureOnly')} per square foot when the floor and roof are already there. The deck framing has to be sound and able to carry a roof if one is being added.`,
      },
      {
        q: 'Does a screened porch add square footage to my house?',
        a: () =>
          'Not conditioned square footage, no. It adds usable space and appeal but is normally valued as porch area rather than living area. A sunroom that is insulated and conditioned can count, which is part of why it costs more.',
      },
      {
        q: 'Do screened porches need permits in South Carolina?',
        a: () =>
          'Yes — a roofed structure attached to the house is permitted work, reviewed for footings, framing and attachment. Greenville County Building Safety handles that locally, and setbacks apply as they would to any addition.',
      },
      {
        q: 'Can a screened porch be converted to a sunroom later?',
        a: () =>
          'Sometimes, if the foundation, framing and roof were built to carry glazing and insulation. If year-round use is a possibility, it is much cheaper to build for it at the start than to retrofit.',
      },
    ],
  },

  {
    slug: 'kitchen-remodel-cost-simpsonville-sc',
    service: 'Kitchen Remodeling',
    city: 'Simpsonville, SC',
    serviceKey: 'kitchenRemodel',
    calculator: 'calculator/kitchen-remodel.html',
    servicePage: 'kitchen-remodeling/index.html',
    permitCounty: 'Greenville County',
    h1: 'Kitchen Remodel Cost in Simpsonville, SC',
    metaTitle: 'Kitchen Remodel Cost Simpsonville SC | Burch Contracting',
    metaDescription:
      'Kitchen remodel costs in Simpsonville SC by scope, computed from our own pricing — refresh, full remodel and layout changes, with what drives each.',
    lead: (p) =>
      `Kitchen remodels in Simpsonville run <strong>${p.perSqft} per square foot</strong> of kitchen, so a typical 200 sq ft kitchen lands between ${p.tier('standardRefresh', 200)} for a refresh and ${p.tier('premiumCustom', 200)} for a custom rebuild. Whether the layout moves is the biggest single fork in that range.`,
    tiers: [
      {
        label: 'Refresh, 200 sq ft',
        rateId: 'standardRefresh',
        sqft: 200,
        note: 'Counters, backsplash, sink, fixtures, paint and hardware. Cabinets stay, layout stays, plumbing stays.',
      },
      {
        label: 'Full remodel, 200 sq ft',
        rateId: 'midRangeRemodel',
        sqft: 200,
        note: 'New cabinetry, counters, flooring, lighting and appliances in essentially the existing footprint.',
      },
      {
        label: 'Custom, 200 sq ft',
        rateId: 'premiumCustom',
        sqft: 200,
        note: 'Layout changes, custom millwork, premium appliances and finishes, and the electrical and plumbing that follow a new plan.',
      },
    ],
    drivers: [
      'Whether the layout moves. Keeping sink, range and refrigerator where they are avoids plumbing, gas and venting work, and it is the difference between two of the bands above.',
      'Cabinets, which are usually the largest line. Refacing, stock, semi-custom and custom are four different budgets.',
      'Countertop material and edge detail, and how many seams and cutouts the layout needs.',
      'Appliances, including whether a new vent path to the outside is required.',
      'Electrical. Older Simpsonville kitchens often need added circuits and GFCI protection to carry modern appliances and lighting.',
      'Flooring, and what is discovered under the old floor once it comes up.',
    ],
    sections: [
      {
        heading: 'Where the money actually goes',
        body: () =>
          '<p>In a full remodel, cabinetry and counters typically dominate, followed by labor, then appliances, then flooring and lighting. Homeowners are often surprised by how much of the budget sits in items they cannot see: electrical upgrades, ventilation, subfloor repair and the trim work that makes new cabinets look built-in rather than installed.</p>',
      },
    ],
    faqs: [
      {
        q: 'How much does a kitchen remodel cost in Simpsonville SC?',
        a: (p) =>
          `A refresh of a 200 sq ft kitchen starts around ${p.tier('standardRefresh', 200)}. A full remodel with new cabinetry runs about ${p.tier('midRangeRemodel', 200)}, and a custom kitchen with layout changes reaches ${p.tier('premiumCustom', 200)}.`,
      },
      {
        q: 'Is it cheaper to reface cabinets than replace them?',
        a: () =>
          'Yes, substantially, when the existing boxes are sound and the layout works. Refacing changes doors, drawer fronts and finish while keeping the carcasses. It is not an option if the boxes are damaged, the layout is wrong, or you want different cabinet sizes.',
      },
      {
        q: 'Do I need a permit to remodel a kitchen?',
        a: () =>
          'A cosmetic refresh often does not. Once you move plumbing, add or alter circuits, or change structure, it does — and Greenville County Building Safety inspects that work. We handle the permitting as part of the project.',
      },
      {
        q: 'How long is a kitchen out of use?',
        a: () =>
          'Plan on four to eight weeks for a full remodel, with the longest stretch between demolition and countertop installation, since counters are templated after cabinets are set. A refresh can be two to three weeks.',
      },
      {
        q: 'What adds the most value in a kitchen remodel?',
        a: () =>
          'Fixing a layout that does not work, and surfaces that look current: cabinets, counters and lighting. Very high-end appliances rarely return their cost in this market unless the rest of the house is at that level.',
      },
    ],
  },

  {
    slug: 'kitchen-remodel-cost-greenville-sc',
    service: 'Kitchen Remodeling',
    city: 'Greenville, SC',
    serviceKey: 'kitchenRemodel',
    calculator: 'calculator/kitchen-remodel.html',
    servicePage: 'kitchen-remodeling/index.html',
    permitCounty: 'Greenville County',
    h1: 'Kitchen Remodel Cost in Greenville, SC',
    metaTitle: 'Kitchen Remodel Cost Greenville SC | Burch Contracting',
    metaDescription:
      'Kitchen remodel costs in Greenville SC, computed from our own pricing, including what older homes near downtown add to the scope.',
    lead: (p) =>
      `Greenville kitchen remodels run <strong>${p.perSqft} per square foot</strong>, putting a 200 sq ft kitchen between ${p.tier('standardRefresh', 200)} and ${p.tier('premiumCustom', 200)}. Older homes closer to downtown often carry extra scope — wiring, plumbing and floor levelling — before any new cabinet is hung.`,
    tiers: [
      {
        label: 'Update, 200 sq ft',
        rateId: 'standardRefresh',
        sqft: 200,
        note: 'Surfaces and fixtures: counters, backsplash, sink, paint, hardware and lighting.',
      },
      {
        label: 'Comprehensive remodel, 220 sq ft',
        rateId: 'midRangeRemodel',
        sqft: 220,
        note: 'Cabinets, counters, flooring, lighting and appliances, with a workflow that gets planned rather than inherited.',
      },
      {
        label: 'Premium kitchen, 250 sq ft',
        rateId: 'premiumCustom',
        sqft: 250,
        note: 'Custom cabinetry, layout redesign, premium appliances and the structural or utility work a new plan requires.',
      },
    ],
    drivers: [
      'House age. Homes built before modern electrical codes often need new circuits, grounding and GFCI protection as part of the job.',
      'Existing floor condition. Older subfloors frequently need levelling before tile or wide-plank flooring goes down.',
      'Layout ambition. Opening a kitchen to a dining or living room may involve a load-bearing wall, a beam and an engineer.',
      'Cabinet grade, from stock through custom millwork, which is usually the largest line item.',
      'Historic-district or HOA review, where exterior changes such as a new window or vent are involved.',
    ],
    sections: [
      {
        heading: 'Older Greenville homes',
        body: () =>
          '<p>The character that makes these homes worth remodelling is also what adds scope. Plaster walls, undersized panels, plumbing in odd places and floors that have moved over decades all get addressed during a kitchen remodel, because the new work has to sit on something sound. Budgeting an allowance for that is more realistic than assuming a clean slate.</p>',
      },
    ],
    faqs: [
      {
        q: 'How much does a kitchen remodel cost in Greenville SC?',
        a: (p) =>
          `From about ${p.tier('standardRefresh', 200)} for a surface-level update of a 200 sq ft kitchen, to roughly ${p.tier('midRangeRemodel', 220)} for a comprehensive remodel, up to ${p.tier('premiumCustom', 250)} for a custom kitchen with layout changes.`,
      },
      {
        q: 'Why do older homes cost more to remodel?',
        a: () =>
          'Because the work is not only the kitchen. Wiring gets brought up to code, plumbing that was moved decades ago gets sorted, and floors and walls that are no longer flat or plumb get corrected so new cabinetry and counters fit properly.',
      },
      {
        q: 'Can a wall between the kitchen and living room be removed?',
        a: () =>
          'Often, but whether it is load-bearing decides the cost. A non-structural wall is straightforward. A load-bearing wall needs a properly sized beam, posts carried down to adequate footing, and an engineer’s input — plus a permit and inspection.',
      },
      {
        q: 'How long does a Greenville kitchen remodel take?',
        a: () =>
          'Four to eight weeks of construction for a full remodel, longer where structural work or long-lead custom cabinetry is involved, plus design and selection time before work starts.',
      },
    ],
  },

  {
    slug: 'bathroom-remodel-cost-simpsonville-sc',
    service: 'Bathroom Remodeling',
    city: 'Simpsonville, SC',
    serviceKey: 'bathRemodel',
    calculator: 'calculator/bath-remodel.html',
    servicePage: 'bathroom-remodeling/index.html',
    permitCounty: 'Greenville County',
    h1: 'Bathroom Remodel Cost in Simpsonville, SC',
    metaTitle: 'Bathroom Remodel Cost Simpsonville SC | Burch Contracting',
    metaDescription:
      'Bathroom remodel costs in Simpsonville SC from powder room to primary suite, computed from our own pricing, with tile and plumbing factors explained.',
    lead: (p) =>
      `Bathroom remodels in Simpsonville run <strong>${p.perSqft} per square foot</strong>, which is high per foot because bathrooms pack plumbing, waterproofing, tile and ventilation into a small area. A 40 sq ft powder room refresh starts near ${p.tier('basicRefresh', 40)}; a 100 sq ft full remodel runs about ${p.tier('midRangeRemodel', 100)}.`,
    tiers: [
      {
        label: 'Powder room refresh, 40 sq ft',
        rateId: 'basicRefresh',
        sqft: 40,
        note: 'Vanity, toilet, fixtures, lighting, paint and flooring, with plumbing staying where it is.',
      },
      {
        label: 'Full remodel, 100 sq ft',
        rateId: 'midRangeRemodel',
        sqft: 100,
        note: 'New tile shower or tub surround, vanity, flooring, ventilation and lighting — a complete replacement in the same footprint.',
      },
      {
        label: 'Primary bath gut, 150 sq ft',
        rateId: 'fullGutRenovation',
        sqft: 150,
        note: 'Taken back to studs: custom tile shower, frameless glass, double vanity, relocated fixtures and upgraded ventilation.',
      },
    ],
    drivers: [
      'Tile scope and waterproofing. A tiled shower with a proper waterproofing system is labor-intensive and is where shortcuts cause failures later.',
      'Whether plumbing moves. Keeping the toilet, tub and vanity in place avoids opening floors and walls to reroute supply and drain lines.',
      'Shower versus tub, and glass. Frameless glass costs considerably more than a framed enclosure or curtain.',
      'Fixture and finish level, which spans a wide range for identical function.',
      'Ventilation, often undersized or missing in older bathrooms and required by code in new work.',
    ],
    sections: [
      {
        heading: 'Why bathrooms cost so much per square foot',
        body: (p) =>
          `<p>At ${p.perSqft} per square foot, bathrooms are the most expensive room in the house by area — more per foot than a kitchen. Every trade works in the same few feet: plumbing, electrical, waterproofing, tile setting, ventilation and glass. There is very little cheap square footage in a bathroom.</p>`,
      },
    ],
    faqs: [
      {
        q: 'How much does a bathroom remodel cost in Simpsonville SC?',
        a: (p) =>
          `A powder room refresh starts around ${p.tier('basicRefresh', 40)}. A full remodel of a 100 sq ft bathroom runs about ${p.tier('midRangeRemodel', 100)}, and a primary bath taken back to studs reaches ${p.tier('fullGutRenovation', 150)}.`,
      },
      {
        q: 'Is converting a tub to a shower expensive?',
        a: () =>
          'It is one of the more common requests and the cost depends on drain location and whether the opening is widened. A straight swap in the same footprint is moderate; moving the drain or rebuilding the opening adds plumbing and framing work.',
      },
      {
        q: 'Do I need a permit for a bathroom remodel?',
        a: () =>
          'If plumbing or electrical is altered, yes — and that covers most full remodels. Replacing a vanity and painting generally does not. Greenville County Building Safety inspects the permitted work.',
      },
      {
        q: 'How long does a bathroom remodel take?',
        a: () =>
          'Two to four weeks for a typical full bathroom, longer for a gut renovation with custom tile and glass, which has to be measured after the tile is set.',
      },
      {
        q: 'What is the most expensive part of a bathroom?',
        a: () =>
          'Usually the shower: waterproofing, tile labor, the valve and the glass together outweigh the vanity, toilet and flooring in most budgets.',
      },
    ],
  },

  {
    slug: 'bathroom-remodel-cost-greenville-sc',
    service: 'Bathroom Remodeling',
    city: 'Greenville, SC',
    serviceKey: 'bathRemodel',
    calculator: 'calculator/bath-remodel.html',
    servicePage: 'bathroom-remodeling/index.html',
    permitCounty: 'Greenville County',
    h1: 'Bathroom Remodel Cost in Greenville, SC',
    metaTitle: 'Bathroom Remodel Cost Greenville SC | Burch Contracting',
    metaDescription:
      'Bathroom remodel costs in Greenville SC by scope, computed from our own pricing, including what older homes add and where budgets usually go.',
    lead: (p) =>
      `Bathroom remodels in Greenville run <strong>${p.perSqft} per square foot</strong>. A guest bath of about 60 sq ft starts near ${p.tier('basicRefresh', 60)} for a refresh, while a primary bath of 150 sq ft taken back to studs runs toward ${p.tier('fullGutRenovation', 150)}.`,
    tiers: [
      {
        label: 'Guest bath refresh, 60 sq ft',
        rateId: 'basicRefresh',
        sqft: 60,
        note: 'Vanity, fixtures, lighting, flooring and paint, with the existing plumbing layout kept.',
      },
      {
        label: 'Full remodel, 100 sq ft',
        rateId: 'midRangeRemodel',
        sqft: 100,
        note: 'Tile shower or tub, new vanity package, ventilation, flooring and lighting.',
      },
      {
        label: 'Luxury primary bath, 150 sq ft',
        rateId: 'fullGutRenovation',
        sqft: 150,
        note: 'Custom tile, frameless glass, freestanding tub or large shower, premium fixtures and rearranged layout.',
      },
    ],
    drivers: [
      'Existing plumbing and its age. Galvanized or poorly routed lines found during demolition get replaced, not worked around.',
      'Tile complexity, from a simple subway surround to large-format, niches, benches and mosaic detail.',
      'Whether the layout changes, which decides if floors and walls have to be opened.',
      'Glass. Frameless panels are measured after tiling and are a significant line on their own.',
      'Ventilation and any code updates the inspection requires in an older home.',
    ],
    sections: [],
    faqs: [
      {
        q: 'How much is a bathroom remodel in Greenville SC?',
        a: (p) =>
          `From about ${p.tier('basicRefresh', 60)} for a guest bath refresh, to roughly ${p.tier('midRangeRemodel', 100)} for a full remodel, up to ${p.tier('fullGutRenovation', 150)} for a luxury primary bath.`,
      },
      {
        q: 'Should I remodel one bathroom or both at once?',
        a: () =>
          'Doing both together saves on mobilisation and often on tile and fixture orders, but it leaves a household without a bathroom. Most homeowners with one full bath phase the work; homes with two or more usually do them together.',
      },
      {
        q: 'What surprises show up in older Greenville bathrooms?',
        a: () =>
          'Water damage behind tile that looked sound, undersized or missing ventilation, plumbing that was rerouted at some point without much thought, and subfloor rot around the toilet flange. These are the reason a contingency belongs in a bathroom budget.',
      },
      {
        q: 'Does a bathroom remodel add value?',
        a: () =>
          'Bathrooms and kitchens remain the two rooms buyers judge hardest. A dated but functional bathroom is a visible deduction; a well-executed one rarely returns its full cost in cash but consistently helps a house sell.',
      },
    ],
  },
]
