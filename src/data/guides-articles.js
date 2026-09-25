/**
 * The 14 articles, restored at the URLs the retired Next.js site used.
 *
 * All 14 returned 404 after the 2026-07 rebuild — they were deliberately left
 * behind because they had "0 clicks". Clicks were the wrong filter: these
 * answer the questions AI assistants and search engines quote without ever
 * sending a click ("how much does a screened porch cost in South Carolina",
 * "composite vs pressure-treated"). Between them and the cost guides, 1,876
 * impressions a year were dropped (migration/baseline-2026-09.md).
 *
 * Same rules as guides-cost.js: every price is computed from
 * src/js/calculator-config.js through the `p` helper, never typed. FAQs are
 * written per topic — the legacy pages shared one generic trio across all of
 * them, which is exactly why they were not citable.
 *
 * `kind: 'blog'`. Entries with no serviceKey carry no price table; their
 * substance is in `sections`.
 */

export const ARTICLES = [
  {
    slug: 'how-much-does-a-screened-porch-cost-in-south-carolina',
    service: 'Screened Porches',
    city: 'South Carolina',
    serviceKey: 'screenedPorches',
    calculator: 'calculator/porch.html',
    servicePage: 'outdoor-living/screened-porches/index.html',
    permitCounty: 'Greenville County',
    h1: 'How Much Does a Screened Porch Cost in South Carolina?',
    metaTitle: 'Screened Porch Cost in South Carolina | Burch Contracting',
    metaDescription:
      'Screened porch costs in South Carolina per square foot and by size, computed from our own pricing, including the cheaper route of screening a deck.',
    lead: (p) =>
      `Screened porches in South Carolina run <strong>${p.perSqft} per square foot</strong>. A new 15×20 porch built from footings up lands around ${p.tier('newScreenedPorch', 300)}; screening an existing covered deck of the same size costs far less, closer to ${p.tier('enclosureOnly', 300)}, because the floor and roof already exist.`,
    tiers: [
      {
        label: 'Screen an existing deck or covered porch',
        rateId: 'enclosureOnly',
        sqft: 300,
        note: 'Posts, screen framing, screening and a door. The least expensive way to get insect-free outdoor space.',
      },
      {
        label: 'New screened porch, 300 sq ft',
        rateId: 'newScreenedPorch',
        sqft: 300,
        note: 'Footings, floor structure, roof tied into the house, screening, finished ceiling and a fan.',
      },
      {
        label: 'Upgraded outdoor room, 400 sq ft',
        rateId: 'upgradedOutdoorRoom',
        sqft: 400,
        note: 'Premium screen system, tongue-and-groove ceiling, upgraded lighting, and often a fireplace or kitchen allowance.',
      },
    ],
    drivers: [
      'Whether a floor and roof already exist — the single largest variable in the whole budget.',
      'Roof type. A shed roof off the back wall is cheapest; a hip or gable tied into the existing roof costs more and looks like it belongs.',
      'Size and span, which decide beam sizes and how many posts land where.',
      'Screen system. Standard fiberglass screening versus a heavy-duty or motorised system.',
      'Ceiling finish, lighting and fans, which is where a plain porch becomes a room people use.',
      'Flooring, if the porch is not sitting on an existing deck surface.',
    ],
    sections: [
      {
        heading: 'How many months you actually use it here',
        body: () =>
          '<p>In the Upstate a screened porch is comfortable from roughly March into November — the shoulder seasons are long, and screening solves the two things that drive people indoors in summer, which are insects and direct sun. That usable span is why porches are a better value here than in colder markets, where a glazed sunroom earns its extra cost back in months of use.</p>',
      },
      {
        heading: 'Cheapest path to a screened porch',
        body: (p) =>
          `<p>If you already have a deck with a roof over it, screening it in is the cheapest project on our board at roughly ${p.perSqftTier('enclosureOnly')} per square foot. If the deck has no roof, adding one is the main cost and the screening is almost incidental. Building the whole structure new is the most expensive and also the most flexible, since the floor height, roof pitch and proportions get designed rather than inherited.</p>`,
      },
    ],
    faqs: [
      {
        q: 'What does a screened porch cost in South Carolina?',
        a: (p) =>
          `${p.perSqft} per square foot, so about ${p.tier('newScreenedPorch', 300)} for a new 15×20 porch. Screening an existing covered deck is much cheaper, nearer ${p.tier('enclosureOnly', 300)} for the same area.`,
      },
      {
        q: 'Is it cheaper to screen an existing deck?',
        a: () =>
          'Substantially, yes — provided the deck framing is sound and can carry a roof if one is needed. The floor is the expensive part of a porch, and it is already paid for.',
      },
      {
        q: 'Do screened porches need a permit in South Carolina?',
        a: () =>
          'Yes. A roofed structure attached to the house is permitted work, reviewed for footings, framing and how it attaches, then inspected. Setback rules apply as they would to any addition.',
      },
      {
        q: 'Can a screened porch be used in winter?',
        a: () =>
          'On mild days, yes, but it is not conditioned space. For genuine year-round use you want a glazed, insulated sunroom, which costs meaningfully more because it is effectively a room addition.',
      },
      {
        q: 'How long does a screened porch take to build?',
        a: () =>
          'Three to six weeks for a new porch once permits are issued. Screening an existing covered deck is often a week or two.',
      },
    ],
  },

  {
    slug: 'room-addition-cost-in-south-carolina',
    service: 'Room Additions',
    city: 'South Carolina',
    serviceKey: 'homeAdditions',
    calculator: 'calculator/additions.html',
    servicePage: 'room-additions/index.html',
    permitCounty: 'Greenville County',
    h1: 'Room Addition Cost in South Carolina',
    metaTitle: 'Room Addition Cost in South Carolina | Burch Contracting',
    metaDescription:
      'What room additions cost in South Carolina by size and type, computed from our own pricing, and why additions cost more per foot than new construction.',
    lead: (p) =>
      `Room additions in South Carolina run <strong>${p.perSqft} per square foot</strong> of finished space. That makes a 200 sq ft bedroom addition roughly ${p.tier('basicFinish', 200)} and a 400 sq ft family room about ${p.tier('standardLivingSpace', 400)}, finished and tied into the existing house.`,
    tiers: [
      {
        label: 'Single room, 200 sq ft',
        rateId: 'basicFinish',
        sqft: 200,
        note: 'Bedroom, office or den — foundation, framing, roof tie-in, insulation, drywall and standard finishes.',
      },
      {
        label: 'Living space, 400 sq ft',
        rateId: 'standardLivingSpace',
        sqft: 400,
        note: 'Family room or large bedroom with fuller finishes, more glass, and HVAC capacity added for the new area.',
      },
      {
        label: 'Suite or multi-room, 600 sq ft',
        rateId: 'premiumCustom',
        sqft: 600,
        note: 'Primary suite or two-room addition, bringing plumbing, structural work and a higher finish level into scope.',
      },
    ],
    drivers: [
      'Foundation: crawlspace, slab or basement, each pricing differently under the same floor plan.',
      'Roof tie-in complexity, which is both a cost item and the thing that decides whether the addition looks original.',
      'HVAC — whether the existing system genuinely has spare capacity or the addition needs its own.',
      'Structural work where old and new connect, including a properly sized beam if a bearing wall opens up.',
      'Finish level, which can move the same footprint by a third.',
      'Site access for equipment and materials.',
    ],
    sections: [
      {
        heading: 'Why additions cost more per foot than new construction',
        body: () =>
          '<p>A builder putting up a new house works on an open site with no existing structure to protect, match or work around. An addition has to tie into a finished building, match materials that may be discontinued, keep a family living there safely throughout, and spread fixed costs — permits, mobilisation, the roof tie-in — across a much smaller area. That is the whole explanation for the per-foot gap.</p>',
      },
      {
        heading: 'Build out or build up?',
        body: () =>
          '<p>Building out adds foundation and roof area but is usually the simpler, more predictable project. Building up avoids both but requires reinforcing the structure below, finding room for a staircase on two floors, and generally moving out while the roof is open. On a constrained lot, up may be the only option; where there is yard to use, out is normally the better value.</p>',
      },
    ],
    faqs: [
      {
        q: 'How much does a room addition cost in South Carolina?',
        a: (p) =>
          `${p.perSqft} per square foot finished — about ${p.tier('basicFinish', 200)} for a 200 sq ft room and ${p.tier('standardLivingSpace', 400)} for a 400 sq ft living space.`,
      },
      {
        q: 'Is an addition cheaper than moving?',
        a: () =>
          'Frequently, once you count agent fees, closing costs, moving expenses and the price gap to a larger house in the same area. The calculation changes if the house has other problems an addition will not fix.',
      },
      {
        q: 'How long does an addition take in South Carolina?',
        a: () =>
          'Ten to sixteen weeks of construction for a single-room addition after permits, plus design and permitting beforehand. Larger or structurally complex additions run longer.',
      },
      {
        q: 'Do additions need permits and inspections?',
        a: () =>
          'Always. Building, electrical, plumbing and mechanical work are all permitted and inspected in stages, and the plans are reviewed against setbacks before anything starts.',
      },
    ],
  },

  {
    slug: 'average-cost-of-basement-finishing-in-south-carolina',
    service: 'Basement Finishing',
    city: 'South Carolina',
    serviceKey: 'basementFinishing',
    calculator: 'calculator/basement-finishing.html',
    servicePage: 'basement-finishing/index.html',
    permitCounty: 'Greenville County',
    h1: 'Average Cost of Basement Finishing in South Carolina',
    metaTitle: 'Basement Finishing Cost in South Carolina',
    metaDescription:
      'Average basement finishing costs in South Carolina per square foot and by scope, computed from our own pricing, plus moisture and egress requirements.',
    lead: (p) =>
      `Finishing a basement in South Carolina averages <strong>${p.perSqft} per square foot</strong>, so a 1,000 sq ft basement typically runs ${p.tier('basicFinish', 1000)} to ${p.tier('premiumBuildOut', 1000)}. It remains the cheapest way to add finished space, because the structure is already standing.`,
    tiers: [
      {
        label: 'Basic finished space, 1,000 sq ft',
        rateId: 'basicFinish',
        sqft: 1000,
        note: 'Open rec room: framing, insulation, drywall, flooring, lighting and outlets.',
      },
      {
        label: 'Living suite, 1,000 sq ft',
        rateId: 'standardLivingSuite',
        sqft: 1000,
        note: 'Separate rooms, better lighting, upgraded flooring, and typically a bathroom.',
      },
      {
        label: 'Premium build-out, 1,200 sq ft',
        rateId: 'premiumBuildOut',
        sqft: 1200,
        note: 'Guest suite or media room with full bath, wet bar, built-ins and main-floor finish quality.',
      },
    ],
    drivers: [
      'Moisture control, which comes before anything else. Drainage, sealing and sometimes a sump pump.',
      'Egress for any bedroom — a compliant window or door, which can mean cutting the foundation and digging a well.',
      'Bathroom drainage, and whether it can run by gravity or needs a pump.',
      'Ceiling height and what hangs below the joists: ducts, beams and plumbing to box in or reroute.',
      'Number of rooms, since every partition adds framing, drywall, doors, trim and circuits.',
      'HVAC capacity for newly conditioned space.',
    ],
    sections: [
      {
        heading: 'Deal with water first',
        body: () =>
          '<p>Finishing over a basement that takes water is the most expensive mistake in this category, because the repair later means removing the finishes you just paid for. Signs worth taking seriously: staining at the base of walls, efflorescence on block, a musty smell that returns, or a sump that runs often. Solve drainage and sealing first, then finish.</p>',
      },
      {
        heading: 'What a basement bedroom legally needs',
        body: () =>
          '<p>Egress, ceiling height and smoke alarms. A room marketed as a bedroom without compliant egress is not a bedroom, and that matters at resale as well as for safety. Retrofitting an egress window into a foundation wall is a real line item — excavation, cutting, a window well and drainage — so it belongs in the budget from the start rather than as a surprise.</p>',
      },
    ],
    faqs: [
      {
        q: 'What is the average cost to finish a basement in South Carolina?',
        a: (p) =>
          `${p.perSqft} per square foot, which puts a 1,000 sq ft basement between ${p.tier('basicFinish', 1000)} and ${p.tier('premiumBuildOut', 1000)} depending on room count, bathroom and finish level.`,
      },
      {
        q: 'Is finishing a basement cheaper than an addition?',
        a: (p) =>
          `Considerably. Basement finishing runs ${p.perSqft} per square foot against ${p.perSqftOther('homeAdditions')} for an addition, because the foundation, walls and roof already exist.`,
      },
      {
        q: 'Do I need a permit to finish a basement in SC?',
        a: () =>
          'Yes — framing, electrical, plumbing and mechanical work all require permits and staged inspections, and egress and alarm requirements are verified as part of that review.',
      },
      {
        q: 'Will a finished basement be cold?',
        a: () =>
          'Not if it is insulated and has HVAC capacity sized for the space. Below-grade rooms are naturally more stable in temperature than upper floors; the usual complaints come from finishing without addressing insulation or air supply.',
      },
    ],
  },

  {
    slug: 'deck-building-cost-simpsonville-sc',
    service: 'Deck Builder',
    city: 'Simpsonville, SC',
    serviceKey: 'decks',
    calculator: 'calculator/decks.html',
    servicePage: 'outdoor-living/decks/index.html',
    permitCounty: 'Greenville County',
    h1: 'Planning a Deck in Simpsonville, SC',
    metaTitle: 'Planning a Deck in Simpsonville SC: Permits, HOA & Materials',
    metaDescription:
      'Planning a deck in Simpsonville SC: permits and HOA approval, pressure-treated versus composite, what moves the budget, and building in winter.',
    lead: (p) =>
      `Deck building in Simpsonville runs <strong>${p.perSqft} per square foot</strong>. A 12×16 treated deck (192 sq ft) starts around ${p.tier('pressureTreated', 192)}; a 16×20 composite deck (320 sq ft) runs about ${p.tier('compositeLowMaintenance', 320)}.`,
    tiers: [
      {
        label: 'Treated wood, 192 sq ft',
        rateId: 'pressureTreated',
        sqft: 192,
        note: 'A 12×16 deck in pressure-treated pine with a wood rail and one stair run.',
      },
      {
        label: 'Composite, 320 sq ft',
        rateId: 'compositeLowMaintenance',
        sqft: 320,
        note: 'A 16×20 with composite boards and low-maintenance railing on a treated frame.',
      },
      {
        label: 'Premium, 480 sq ft',
        rateId: 'premiumComposite',
        sqft: 480,
        note: 'A 20×24 with premium decking, integrated lighting, wide stairs and built-in seating.',
      },
    ],
    drivers: [
      'Deck area and shape — rectangles are cheaper per foot than angles and curves.',
      'Board material, from treated pine to capped premium composite.',
      'Height off the ground, which drives post length, footing depth and guard requirements.',
      'Railing linear feet and material.',
      'Stairs, landings and how many levels the design has.',
      'Lighting, privacy screening and built-ins, each priced separately.',
    ],
    sections: [
      {
        heading: 'Permits and HOA approval in Simpsonville',
        body: () =>
          '<p>Two separate approvals, and they run on different clocks. The building permit through Greenville County Building Safety covers footings, framing spans and guard height, with an inspection before decking goes on. Many Simpsonville subdivisions separately require HOA architectural approval of materials and appearance. Starting the HOA submission early matters, because that timeline is not something a contractor can accelerate.</p>',
      },
    ],
    faqs: [
      {
        q: 'How much does deck building cost in Simpsonville SC?',
        a: (p) =>
          `${p.perSqft} per square foot. A 12×16 treated deck starts near ${p.tier('pressureTreated', 192)}; a 16×20 composite deck is about ${p.tier('compositeLowMaintenance', 320)}.`,
      },
      {
        q: 'Do I need HOA approval for a deck in Simpsonville?',
        a: () =>
          'In many subdivisions, yes, and it is separate from the county permit. The HOA reviews appearance and materials; the county reviews structure and safety. Both are worth starting before finalising a design.',
      },
      {
        q: 'What is the best decking material for South Carolina?',
        a: () =>
          'Both work here. Treated pine is cheapest and needs cleaning and sealing to stay presentable in Upstate sun and humidity. Composite costs more up front, avoids that maintenance, and holds colour better over years of direct sun.',
      },
      {
        q: 'Can a deck be built in winter?',
        a: () =>
          'Yes — winter is often a good time to build here. Ground conditions and rain matter more than temperature, and scheduling is usually easier than in spring when everyone books at once.',
      },
    ],
  },

  {
    slug: 'cost-of-bathroom-remodeling-simpsonville-sc',
    service: 'Bathroom Remodeling',
    city: 'Simpsonville, SC',
    serviceKey: 'bathRemodel',
    calculator: 'calculator/bath-remodel.html',
    servicePage: 'bathroom-remodeling/index.html',
    permitCounty: 'Greenville County',
    h1: 'Planning a Bathroom Remodel in Simpsonville, SC',
    metaTitle: 'Planning a Bathroom Remodel in Simpsonville SC',
    metaDescription:
      'Planning a bathroom remodel in Simpsonville SC: what moves the budget, hidden costs behind old tile, working in stages, and how long you lose the room.',
    lead: (p) =>
      `Bathroom remodeling in Simpsonville runs <strong>${p.perSqft} per square foot</strong> — the highest per-foot rate in the house, because plumbing, waterproofing, tile and ventilation all crowd into a small room. A 60 sq ft hall bath starts near ${p.tier('basicRefresh', 60)}; a full remodel of the same room is about ${p.tier('midRangeRemodel', 60)}.`,
    tiers: [
      {
        label: 'Refresh, 60 sq ft',
        rateId: 'basicRefresh',
        sqft: 60,
        note: 'Vanity, toilet, fixtures, lighting, flooring and paint with plumbing left in place.',
      },
      {
        label: 'Full remodel, 60 sq ft',
        rateId: 'midRangeRemodel',
        sqft: 60,
        note: 'New tile shower or tub surround, vanity, flooring, ventilation and lighting.',
      },
      {
        label: 'Gut renovation, 100 sq ft',
        rateId: 'fullGutRenovation',
        sqft: 100,
        note: 'Back to studs, new layout, custom tile and glass, upgraded fixtures throughout.',
      },
    ],
    drivers: [
      'Tile area and detail, which is mostly labor.',
      'Waterproofing system behind the tile — invisible, and the difference between a shower that lasts and one that fails.',
      'Whether fixtures move, which decides if floors and walls open up.',
      'Glass: framed enclosure versus frameless panels.',
      'Ventilation, frequently undersized in older homes.',
      'What demolition reveals: rot at the flange, damage behind the surround, or plumbing that needs replacing.',
    ],
    sections: [
      {
        heading: 'The hidden costs behind old tile',
        body: () =>
          '<p>The most common unbudgeted item in a bathroom is water damage found during demolition — a subfloor soft around the toilet, or studs damaged behind a shower that leaked slowly for years. It is not always avoidable and it is not always expensive, but a bathroom budget without a contingency is optimistic. We flag what we can see before starting and price the repair when the wall is open rather than guessing high.</p>',
      },
    ],
    faqs: [
      {
        q: 'How much does bathroom remodeling cost in Simpsonville SC?',
        a: (p) =>
          `A refresh of a 60 sq ft bathroom starts around ${p.tier('basicRefresh', 60)}, a full remodel runs about ${p.tier('midRangeRemodel', 60)}, and a gut renovation of a larger bathroom reaches ${p.tier('fullGutRenovation', 100)}.`,
      },
      {
        q: 'Why are bathrooms so expensive for their size?',
        a: (p) =>
          `Because every trade works in the same few square feet. At ${p.perSqft} per square foot a bathroom costs more per foot than a kitchen: plumbing, electrical, waterproofing, tile, ventilation and glass all in a room the size of a closet.`,
      },
      {
        q: 'Can I remodel a bathroom in stages?',
        a: () =>
          'Partly. Fixtures, lighting and paint can be phased. Anything involving tile and waterproofing should be done in one go, because opening a shower twice costs more than doing it once.',
      },
      {
        q: 'How long will my bathroom be unusable?',
        a: () =>
          'Two to four weeks for a typical full remodel. The wait is often tile cure time and the glass, which is measured only after the tile is set.',
      },
    ],
  },

  {
    slug: 'kitchen-remodel-cost-fountain-inn-sc',
    service: 'Kitchen Remodeling',
    city: 'Fountain Inn, SC',
    serviceKey: 'kitchenRemodel',
    calculator: 'calculator/kitchen-remodel.html',
    servicePage: 'kitchen-remodeling/index.html',
    permitCounty: 'Greenville County',
    h1: 'Kitchen Remodel Cost in Fountain Inn, SC',
    metaTitle: 'Kitchen Remodel Cost Fountain Inn SC | Burch Contracting',
    metaDescription:
      'Kitchen remodel costs in Fountain Inn SC by scope, computed from our own pricing, and where the budget actually goes. Written by a licensed contractor.',
    lead: (p) =>
      `Kitchen remodels in Fountain Inn run <strong>${p.perSqft} per square foot</strong>. A 180 sq ft kitchen refresh starts near ${p.tier('standardRefresh', 180)}; a full remodel with new cabinetry runs about ${p.tier('midRangeRemodel', 180)}, and a custom kitchen with layout changes reaches ${p.tier('premiumCustom', 180)}.`,
    tiers: [
      {
        label: 'Refresh, 180 sq ft',
        rateId: 'standardRefresh',
        sqft: 180,
        note: 'Counters, backsplash, sink, fixtures, paint and hardware — cabinets and layout stay.',
      },
      {
        label: 'Full remodel, 180 sq ft',
        rateId: 'midRangeRemodel',
        sqft: 180,
        note: 'New cabinets, counters, flooring, lighting and appliances in the existing footprint.',
      },
      {
        label: 'Custom, 180 sq ft',
        rateId: 'premiumCustom',
        sqft: 180,
        note: 'Layout redesign, custom millwork, premium appliances and the utilities a new plan needs.',
      },
    ],
    drivers: [
      'Whether the layout moves — the single biggest fork in a kitchen budget.',
      'Cabinet grade: refacing, stock, semi-custom or custom.',
      'Countertop material, seams and cutouts.',
      'Appliance package, including venting to the outside.',
      'Electrical capacity and added circuits for modern appliances.',
      'Subfloor condition, discovered when the old flooring comes up.',
    ],
    sections: [
      {
        heading: 'Where the budget goes',
        body: () =>
          '<p>Cabinetry and counters usually take the largest share, then labor, then appliances, then flooring and lighting. The items homeowners underestimate are the invisible ones: electrical upgrades, venting, subfloor repair, and the trim work that makes a new kitchen look built rather than assembled.</p>',
      },
    ],
    faqs: [
      {
        q: 'How much does a kitchen remodel cost in Fountain Inn SC?',
        a: (p) =>
          `From about ${p.tier('standardRefresh', 180)} for a refresh of a 180 sq ft kitchen to roughly ${p.tier('premiumCustom', 180)} for a custom remodel with layout changes.`,
      },
      {
        q: 'What is the cheapest way to update a kitchen?',
        a: () =>
          'Keep the layout and the cabinet boxes. New counters, a backsplash, hardware, paint and lighting transform how a kitchen looks without touching plumbing, gas or structure — which is where costs escalate.',
      },
      {
        q: 'How long does a kitchen remodel take?',
        a: () =>
          'Four to eight weeks of construction for a full remodel, two to three for a refresh, plus selection and ordering time beforehand. Custom cabinetry has the longest lead.',
      },
      {
        q: 'Do you handle permits for kitchen work?',
        a: () =>
          'Yes. Where the work alters plumbing, electrical or structure it needs a permit, and we pull it and schedule the inspections as part of the project.',
      },
    ],
  },

  {
    slug: 'bath-to-shower-conversion-cost-south-carolina',
    service: 'Bath to Shower Conversion',
    city: 'South Carolina',
    serviceKey: 'bathRemodel',
    calculator: 'calculator/ada-bath-shower.html',
    servicePage: 'ada-bath-to-shower/index.html',
    permitCounty: 'Greenville County',
    h1: 'Bath to Shower Conversion Cost in South Carolina',
    metaTitle: 'Tub to Shower Conversion Cost South Carolina',
    metaDescription:
      'What converting a tub to a walk-in shower costs in South Carolina, what changes structurally, and the accessibility details worth getting right.',
    lead: (p) =>
      `Most tub-to-shower conversions in South Carolina fall between ${p.tier('basicRefresh', 40)} and ${p.tier('midRangeRemodel', 60)}, depending on whether the drain moves and how much tile the new shower carries. Bathroom work runs <strong>${p.perSqft} per square foot</strong> generally, and a conversion concentrates that cost into the wet area.`,
    tiers: [
      {
        label: 'Straight swap, same footprint',
        rateId: 'basicRefresh',
        sqft: 40,
        note: 'Tub out, shower pan and surround in, same drain location, framed enclosure.',
      },
      {
        label: 'Tiled walk-in shower',
        rateId: 'midRangeRemodel',
        sqft: 60,
        note: 'Custom tile, proper waterproofing, niche and bench, upgraded valve and glass.',
      },
      {
        label: 'Accessible roll-in shower',
        rateId: 'fullGutRenovation',
        sqft: 60,
        note: 'Curbless entry with a sloped floor, wider opening, grab bars and a hand shower on a slide bar.',
      },
    ],
    drivers: [
      'Whether the drain moves. A tub drain and a shower drain are rarely in the same place, and moving it means opening the floor.',
      'Curbless or curbed entry. A roll-in shower needs the floor structure lowered or built up to create slope, which is framing work.',
      'Tile versus a solid-surface pan and walls. Solid surface is faster and cheaper; tile is more customisable.',
      'Glass: a framed door, a frameless panel, or no door at all on a walk-in design.',
      'Grab bars and blocking, which have to be fixed to framing — worth adding while walls are open, even if not needed yet.',
      'Widening the opening, if the existing alcove is narrower than the new shower.',
    ],
    sections: [
      {
        heading: 'Accessibility details worth doing now',
        body: () =>
          '<p>If the reason for the conversion is aging in place, a few details matter more than the tile: a curbless or low-threshold entry, blocking in the walls for grab bars at the entry and the seat, a hand shower on a slide bar, a bench or folding seat, and slip-resistant floor tile. Blocking in particular costs almost nothing while the wall is open and is expensive to retrofit later.</p>',
      },
      {
        heading: 'Does removing the only tub hurt resale?',
        body: () =>
          '<p>It can, in a family-market house with a single bathroom — some buyers want a tub for small children. Where there is a second bathroom with a tub, or the household is planning to stay, a walk-in shower is usually the better daily choice. We would rather raise that before demolition than after.</p>',
      },
    ],
    faqs: [
      {
        q: 'How much does a tub to shower conversion cost in South Carolina?',
        a: (p) =>
          `Generally ${p.tier('basicRefresh', 40)} to ${p.tier('midRangeRemodel', 60)}. A straight swap keeping the drain in place is at the low end; a custom tiled walk-in with new glass is at the high end; a fully accessible roll-in shower runs higher still.`,
      },
      {
        q: 'Do I need a permit to convert a tub to a shower?',
        a: () =>
          'Usually yes, because the plumbing is altered. It is permitted and inspected work, and we handle that as part of the job.',
      },
      {
        q: 'How long does the conversion take?',
        a: () =>
          'One to two weeks for a straightforward swap. A tiled walk-in takes longer, because waterproofing, tile setting and cure time each need their own days before glass can be measured.',
      },
      {
        q: 'Can any bathroom take a curbless shower?',
        a: () =>
          'Not every one. A curbless entry needs the floor structure to allow slope to the drain, which is easier over a crawlspace than over a slab. We check the framing and drain position before promising a flush entry.',
      },
      {
        q: 'Is a walk-in shower safer than a tub?',
        a: () =>
          'For most people with mobility concerns, yes — stepping over a tub wall is where falls happen. The safety comes from the entry height, grab bars, a seat and slip-resistant flooring together, not from the shower alone.',
      },
    ],
  },

  {
    slug: 'composite-vs-pressure-treated-deck-which-is-better',
    service: 'Deck Builder',
    city: 'Upstate South Carolina',
    serviceKey: 'decks',
    calculator: 'calculator/decks.html',
    servicePage: 'outdoor-living/decks/index.html',
    permitCounty: null,
    h1: 'Composite vs Pressure-Treated Deck: Which Is Better?',
    metaTitle: 'Composite vs Pressure-Treated Deck in SC | Burch Contracting',
    metaDescription:
      'Composite or pressure-treated decking for a South Carolina home: real cost difference, maintenance, lifespan, and how each handles Upstate sun.',
    lead: (p) =>
      `On a 320 sq ft deck the difference is roughly ${p.tier('pressureTreated', 320)} in pressure-treated wood against ${p.tier('compositeLowMaintenance', 320)} in composite. Treated wood wins on first cost; composite wins on the decade that follows. Both are built on a treated frame — the choice is only about the surface you walk on and hold.`,
    tiers: [
      {
        label: 'Pressure-treated, 320 sq ft',
        rateId: 'pressureTreated',
        sqft: 320,
        note: 'Lowest cost to build. Expect cleaning yearly and sealing every few years to keep it from greying and checking.',
      },
      {
        label: 'Composite, 320 sq ft',
        rateId: 'compositeLowMaintenance',
        sqft: 320,
        note: 'Higher cost to build, no sealing. Wash it and it stays the colour you chose.',
      },
    ],
    drivers: [
      'First cost versus maintenance cost. Sealing a deck is either weekends of your time or a recurring contractor bill.',
      'Sun exposure. A south-facing deck in full Upstate sun is harder on wood finishes and on cheap composites alike.',
      'How long you plan to stay. Composite pays back over years, not months.',
      'Appearance preference — real wood grain versus consistent colour with no knots or splinters.',
      'Barefoot use. Dark composite gets hot in direct summer sun; lighter boards and shade mitigate it.',
    ],
    sections: [
      {
        heading: 'How each holds up here',
        body: () =>
          `<p><strong>Pressure-treated pine.</strong> Structurally excellent and inexpensive. Left unsealed in Upstate humidity and sun it greys, checks and can splinter; maintained, it looks good for many years. Boards are replaceable individually, which is a genuine advantage.</p>
           <p><strong>Composite.</strong> No sealing, no splinters, consistent colour, and modern capped boards resist fading far better than early generations did. It costs more per square foot, gets warmer underfoot in direct sun, and a damaged board is harder to match years later.</p>`,
      },
      {
        heading: 'Which we recommend, and when',
        body: () =>
          '<p>If the budget is the binding constraint, build the treated deck and build it properly — a well-framed treated deck beats a smaller composite one. If you dislike maintenance, are staying put, and the deck gets heavy use, composite is worth the premium. A common middle path is composite decking with a wood-framed rail, which puts the money where hands and feet actually land.</p>',
      },
    ],
    faqs: [
      {
        q: 'Is composite decking worth the extra cost?',
        a: (p) =>
          `It depends how long you are staying. The gap on a 320 sq ft deck is about ${p.tier('pressureTreated', 320)} versus ${p.tier('compositeLowMaintenance', 320)}. Over ten or more years, with sealing avoided, composite generally justifies itself. Over three years before a move, it usually does not.`,
      },
      {
        q: 'How long does each last in South Carolina?',
        a: () =>
          'A treated frame lasts decades. Treated decking boards, maintained, give many years before the surface needs attention; neglected, they grey and check within a few seasons. Composite boards typically carry long manufacturer warranties and keep their appearance considerably longer in direct sun.',
      },
      {
        q: 'Does composite decking get too hot to walk on?',
        a: () =>
          'Darker boards in full afternoon sun do get hot — noticeably hotter than wood. Choosing a lighter colour, or having shade over part of the deck, largely solves it.',
      },
      {
        q: 'Can I put composite boards on my existing deck frame?',
        a: () =>
          'Often, if the frame is sound and the joist spacing suits the board you choose. Some composites require closer joist spacing than older wood decks were built with, so the frame gets inspected first.',
      },
    ],
  },

  {
    slug: 'best-bathroom-tile-options-for-remodels',
    service: 'Bathroom Remodeling',
    city: 'Upstate South Carolina',
    serviceKey: 'bathRemodel',
    calculator: 'calculator/bath-remodel.html',
    servicePage: 'bathroom-remodeling/index.html',
    permitCounty: null,
    h1: 'Best Bathroom Tile Options for Remodels',
    metaTitle: 'Best Bathroom Tile Options for Remodels | Burch Contracting',
    metaDescription:
      'Porcelain, ceramic, natural stone and large-format tile compared for bathroom remodels — durability, slip resistance, maintenance and installed cost.',
    lead: () =>
      'For most bathrooms, porcelain is the right answer: it is dense, water-resistant, available in almost any look including convincing stone and wood, and it costs less installed than natural stone. Ceramic is fine on walls and cheaper. Natural stone is beautiful and high-maintenance. The tile that matters most is the floor, where slip resistance outranks appearance.',
    tiers: [],
    drivers: [
      'Where it goes. Floors need slip resistance and hardness; walls can prioritise looks.',
      'Tile size. Large-format tiles mean fewer grout lines but demand a flatter substrate, which can add floor preparation.',
      'Porosity. Porcelain absorbs very little water; many natural stones absorb enough to need periodic sealing.',
      'Grout choice and colour, which affects both maintenance and how forgiving the finished look is.',
      'Installation labor, which is driven by pattern and cut count more than by the tile price itself.',
    ],
    sections: [
      {
        heading: 'The options, honestly compared',
        body: () =>
          `<p><strong>Porcelain.</strong> The default for good reason — dense, hard, low absorption, and made in formats that mimic marble, concrete and timber well. Best all-round value for floors and wet walls.</p>
           <p><strong>Ceramic.</strong> Softer and more absorbent than porcelain, and cheaper. Perfectly good for walls and light-traffic floors; not the first choice for a heavily used shower floor.</p>
           <p><strong>Natural stone</strong> (marble, travertine, slate). Genuinely beautiful and no two pieces alike. It needs sealing, dislikes acidic cleaners, and marble in particular etches. Choose it because you want stone, not because you want low effort.</p>
           <p><strong>Large-format.</strong> Fewer grout lines, a calmer look, easier to clean. Requires a flat substrate and careful setting, so installation costs more and floor prep may be needed.</p>
           <p><strong>Mosaic and small formats.</strong> More grout, which means more traction — the reason small hexagon tile remains a sound shower-floor choice — but also more cleaning.</p>`,
      },
      {
        heading: 'What we specify most often',
        body: () =>
          '<p>Porcelain plank or large-format on the bathroom floor, porcelain or ceramic on the shower walls, and a small-format porcelain mosaic on the shower floor for grip. It is not the most exciting specification, and it is the one that still looks right and drains properly a decade later.</p>',
      },
    ],
    faqs: [
      {
        q: 'What is the best tile for a bathroom floor?',
        a: () =>
          'Porcelain, in a finish with enough texture to be slip resistant when wet. It handles water, wear and cleaning better than ceramic or most natural stone, and it comes in nearly any appearance.',
      },
      {
        q: 'Is porcelain better than ceramic?',
        a: () =>
          'For floors and wet areas, yes — it is denser and absorbs less water. For walls in a low-traffic bathroom, ceramic is a reasonable way to save money without a practical downside.',
      },
      {
        q: 'Is marble a bad idea in a bathroom?',
        a: () =>
          'Not bad, but demanding. Marble needs sealing, etches from acidic products, and shows water spots. Plenty of homeowners accept that for the look; those who want to clean without thinking about it are happier with porcelain that resembles marble.',
      },
      {
        q: 'Do large tiles work in a small bathroom?',
        a: () =>
          'Often better than people expect — fewer grout lines make a small room read larger and calmer. The constraint is the substrate, which has to be flat enough for big tiles to sit without lippage.',
      },
      {
        q: 'What tile is safest for a walk-in shower floor?',
        a: () =>
          'Small-format tile, such as a 2-inch hexagon, in a matte or textured finish. The extra grout lines provide traction, and small tiles conform to the slope toward the drain more easily than large ones.',
      },
    ],
  },

  {
    slug: 'how-long-does-a-kitchen-remodel-take',
    service: 'Kitchen Remodeling',
    city: 'Simpsonville & Fountain Inn, SC',
    serviceKey: 'kitchenRemodel',
    calculator: 'calculator/kitchen-remodel.html',
    servicePage: 'kitchen-remodeling/index.html',
    permitCounty: 'Greenville County',
    h1: 'How Long Does a Kitchen Remodel Take?',
    metaTitle: 'How Long Does a Kitchen Remodel Take? | Burch Contracting',
    metaDescription:
      'A realistic kitchen remodel timeline, phase by phase, including why countertops add two weeks and what actually causes delays.',
    lead: () =>
      'Plan on four to eight weeks of construction for a full kitchen remodel, and two to three weeks for a refresh — plus four to eight weeks before that for design, selections and ordering. The single biggest schedule item most homeowners do not expect is countertops, which can only be templated after the cabinets are installed and then take one to two weeks to fabricate.',
    tiers: [],
    drivers: [
      'Cabinet lead time, which runs from days for stock to many weeks for custom.',
      'Countertop fabrication, templated after cabinets are set — a hard sequence that cannot be compressed.',
      'Whether the layout moves, which adds plumbing, electrical and inspection steps.',
      'Permit and inspection scheduling, which is outside anyone’s direct control.',
      'Appliance availability, since one back-ordered item can hold final connection.',
      'Decisions. Selections made late are the most common cause of avoidable delay.',
    ],
    sections: [
      {
        heading: 'Phase by phase',
        body: () =>
          `<p><strong>Before demolition (4–8 weeks).</strong> Design, selections, quotes, ordering and permitting. Nothing visible happens, and this is where the schedule is actually won or lost.</p>
           <p><strong>Demolition (2–4 days).</strong> Old cabinets, counters, flooring and fixtures out; any hidden conditions discovered now.</p>
           <p><strong>Rough-in (3–7 days).</strong> Plumbing, electrical and any framing or venting changes, then inspection where permitted.</p>
           <p><strong>Surfaces (3–5 days).</strong> Drywall repair, paint on walls and ceiling before cabinets go in.</p>
           <p><strong>Cabinets (3–5 days).</strong> Set, levelled and scribed to the walls.</p>
           <p><strong>Countertops (1–2 weeks).</strong> Templated once cabinets are set, then fabricated, then installed. This is the wait.</p>
           <p><strong>Finish (1–2 weeks).</strong> Backsplash, plumbing and appliance connection, flooring if not already done, trim, hardware, touch-up and final inspection.</p>`,
      },
      {
        heading: 'How to keep it on schedule',
        body: () =>
          '<p>Make every selection before demolition day — cabinets, counters, tile, fixtures, appliances, paint. Order long-lead items first. Accept that a discovery behind a wall may cost days, and keep a contingency in both money and time. A kitchen that starts with decisions finished usually lands inside its estimate.</p>',
      },
    ],
    faqs: [
      {
        q: 'How long does a kitchen remodel take from start to finish?',
        a: () =>
          'Four to eight weeks of construction for a full remodel, on top of four to eight weeks of design, selection and ordering beforehand. A cosmetic refresh is two to three weeks of work.',
      },
      {
        q: 'Why do countertops take so long?',
        a: () =>
          'Because they are made to fit your installed cabinets. The fabricator templates after the cabinets are set, then cuts and finishes the material, then returns to install. One to two weeks is normal, and it cannot be started earlier.',
      },
      {
        q: 'Can I use my kitchen during the remodel?',
        a: () =>
          'Not the kitchen itself for most of it. Plan a temporary setup — refrigerator, microwave and a sink elsewhere. We can often keep the refrigerator connected and accessible through the work.',
      },
      {
        q: 'What causes most kitchen remodel delays?',
        a: () =>
          'Late decisions, long-lead cabinetry or appliances, and discoveries behind walls in older homes. Permit and inspection scheduling adds days at predictable points.',
      },
    ],
  },

  {
    slug: 'do-you-need-permits-for-remodeling-in-simpsonville-sc',
    service: 'Remodeling',
    city: 'Simpsonville, SC',
    serviceKey: null,
    calculator: 'calculator/estimate.html',
    servicePage: 'remodeling/index.html',
    permitCounty: 'Greenville County',
    h1: 'Do You Need Permits for Remodeling in Simpsonville, SC?',
    metaTitle: 'Remodeling Permits in Simpsonville SC | Burch Contracting',
    metaDescription:
      'Which remodeling projects need a permit in Simpsonville SC, which do not, and what unpermitted work costs you at resale.',
    lead: () =>
      'As a rule: if you change structure, plumbing, electrical or mechanical systems, or add roofed square footage, you need a permit. Paint, flooring, cabinet refacing and swapping a fixture in the same location generally do not. In Simpsonville that review runs through Greenville County Building Safety, and HOA approval is a separate matter from the permit.',
    tiers: [],
    drivers: [],
    sections: [
      {
        heading: 'Work that needs a permit',
        body: () =>
          `<p>Additions and any new roofed structure, including screened porches and garages. Decks, beyond minimal height. Removing or altering a load-bearing wall. New or relocated plumbing. New circuits, panel work or rewiring. HVAC replacement or new ductwork. Window or door openings that change the framing. Converting a garage or basement into living space, which also brings egress and alarm requirements.</p>`,
      },
      {
        heading: 'Work that usually does not',
        body: () =>
          '<p>Painting and wallpaper. Flooring over an existing subfloor. Cabinet refacing or replacement without moving plumbing or electrical. Replacing a faucet, toilet or light fixture in the same location. Countertops. Trim and interior doors in existing openings. If a project sits on the line, the county will tell you, and asking costs nothing.</p>',
      },
      {
        heading: 'Why unpermitted work costs more later',
        body: () =>
          '<p>It surfaces at resale. A buyer’s appraiser or inspector finds a finished basement or an addition that county records do not show, and the sale stalls while it gets resolved — sometimes by opening finished walls for inspection, sometimes by a price reduction. Unpermitted work can also complicate an insurance claim. The permit is a small cost against that risk, and on our projects we pull it as part of the job.</p>',
      },
    ],
    faqs: [
      {
        q: 'Do I need a permit to remodel a bathroom in Simpsonville?',
        a: () =>
          'If plumbing or electrical is altered, yes — which covers most full bathroom remodels. Replacing a vanity, painting and new flooring alone generally do not require one.',
      },
      {
        q: 'Do I need a permit for a deck?',
        a: () =>
          'Generally yes for an attached deck or any deck above minimal height. Footing depth, framing spans and guard height are reviewed, and the frame is inspected before decking covers it.',
      },
      {
        q: 'Who pulls the permit, me or the contractor?',
        a: () =>
          'We do, on projects we build. A licensed contractor pulling the permit also means the inspections are scheduled and met as part of the work rather than left to you.',
      },
      {
        q: 'Is HOA approval the same as a permit?',
        a: () =>
          'No, and you may need both. The county permit is about safety and code. HOA review is about appearance and materials, runs on its own timeline, and cannot be substituted for a permit.',
      },
      {
        q: 'What happens if work was done without a permit?',
        a: () =>
          'It can usually be resolved, sometimes by applying retroactively and having the work inspected, which may mean opening finished surfaces. It is worth handling before listing a house rather than during a sale.',
      },
    ],
  },

  {
    slug: 'how-to-plan-a-kitchen-remodel-step-by-step',
    service: 'Kitchen Remodeling',
    city: 'Simpsonville & Fountain Inn, SC',
    serviceKey: 'kitchenRemodel',
    calculator: 'calculator/kitchen-remodel.html',
    servicePage: 'kitchen-remodeling/index.html',
    permitCounty: 'Greenville County',
    h1: 'How to Plan a Kitchen Remodel, Step by Step',
    metaTitle: 'How to Plan a Kitchen Remodel Step by Step',
    metaDescription:
      'A practical order of operations for planning a kitchen remodel — budget, layout, selections, contractor and schedule — before demolition day.',
    lead: (p) =>
      `Plan in this order: set a budget with a contingency, decide whether the layout moves, choose cabinets first because they have the longest lead, then counters, appliances, flooring and lighting. Kitchens here run ${p.perSqft} per square foot, so a 200 sq ft kitchen between ${p.tier('standardRefresh', 200)} and ${p.tier('premiumCustom', 200)} is the range to plan inside.`,
    tiers: [],
    drivers: [],
    sections: [
      {
        heading: '1. Set the budget, including a contingency',
        body: (p) =>
          `<p>Decide the number before you fall in love with a cabinet door. A 200 sq ft kitchen runs ${p.tier('standardRefresh', 200)} for a refresh to ${p.tier('premiumCustom', 200)} custom. Hold back ten percent for what demolition reveals — in an older home that is not pessimism, it is arithmetic.</p>`,
      },
      {
        heading: '2. Decide if the layout moves',
        body: () =>
          '<p>This is the fork that sets everything else. Keeping the sink, range and refrigerator where they are avoids plumbing, gas and venting work. Moving them buys a better kitchen and costs meaningfully more. Decide it early, because every later choice depends on it.</p>',
      },
      {
        heading: '3. Choose cabinets first',
        body: () =>
          '<p>Cabinets have the longest lead time, drive the layout, and take the largest share of the budget. Stock arrives quickly; semi-custom and custom can take weeks. Choosing them first means the rest of the schedule can be planned backwards from a real date.</p>',
      },
      {
        heading: '4. Then counters, appliances, flooring, lighting',
        body: () =>
          '<p>Counters are templated after cabinets are installed, so the choice can be made early but the work happens late. Appliances need to be specified before cabinets are built, because openings are sized to them. Flooring and lighting are the most flexible items, and the easiest places to adjust if the budget tightens.</p>',
      },
      {
        heading: '5. Choose the contractor, then confirm scope in writing',
        body: () =>
          '<p>Check the license, insurance and recent local work. Then get a written scope with allowances stated plainly — what is included, what is an allowance, and what is excluded. Most disputes trace back to an allowance nobody discussed rather than to workmanship.</p>',
      },
      {
        heading: '6. Plan how you will live through it',
        body: () =>
          '<p>Four to eight weeks without a kitchen needs a plan: a temporary refrigerator and microwave, somewhere to wash up, and a realistic view of meals. Homeowners who set this up in advance find the project far less disruptive than those who improvise in week two.</p>',
      },
    ],
    faqs: [
      {
        q: 'What is the first step in planning a kitchen remodel?',
        a: () =>
          'Setting the budget, with a contingency, and then deciding whether the layout changes. Those two answers determine every other decision and whether the project needs permits.',
      },
      {
        q: 'Should I buy appliances before cabinets?',
        a: () =>
          'Specify them before cabinets are built, because cabinet openings are sized to the appliances. You do not need them delivered early — just chosen, with the model dimensions confirmed.',
      },
      {
        q: 'How much contingency should a kitchen budget have?',
        a: () =>
          'Around ten percent, more in a house built before modern electrical and plumbing codes. It covers what is found behind walls and under floors, which is genuinely unknowable until demolition.',
      },
      {
        q: 'Do I need a designer as well as a contractor?',
        a: () =>
          'Not always. If the layout stays and you are confident in selections, a contractor with a good cabinet supplier is enough. If walls are moving or the space has never worked, design input earns its fee.',
      },
    ],
  },

  {
    slug: 'best-home-improvements-for-property-value-in-south-carolina',
    service: 'Home Remodeling',
    city: 'South Carolina',
    serviceKey: null,
    calculator: 'calculator/estimate.html',
    servicePage: 'remodeling/index.html',
    permitCounty: null,
    h1: 'Best Home Improvements for Property Value in South Carolina',
    metaTitle: 'Best Home Improvements for Property Value in SC',
    metaDescription:
      'Which home improvements hold their value best in South Carolina, which rarely pay back, and why usable outdoor space does well in this market.',
    lead: () =>
      'The improvements that hold value best here are the ones that fix something buyers notice: a dated kitchen or bathroom, too few bedrooms with an en-suite, no usable outdoor space, or an unfinished basement sitting empty. The ones that rarely pay back are highly personal or over-specified for the neighborhood — a luxury kitchen in a modest street, or a pool in a market that does not expect one.',
    tiers: [],
    drivers: [],
    sections: [
      {
        heading: 'What tends to hold its value',
        body: () =>
          `<p><strong>Kitchens and bathrooms.</strong> The two rooms buyers judge hardest. They rarely return their full cost in cash, but a dated one is a visible deduction and a current one helps a house sell.</p>
           <p><strong>Usable outdoor living space.</strong> Decks, screened porches and covered patios do well in the Upstate because the season is long. A screened porch in particular reads as extra living space for a fraction of an addition’s cost.</p>
           <p><strong>Finished basements.</strong> The cheapest finished square footage available, and it converts dead storage into real rooms.</p>
           <p><strong>A primary suite.</strong> In houses short on bedrooms with an en-suite bath, this fixes a real limitation rather than adding a nice extra.</p>
           <p><strong>Garages and covered parking.</strong> Practical, wanted, and often missing on older Upstate homes.</p>`,
      },
      {
        heading: 'What usually does not pay back',
        body: () =>
          '<p>Anything that over-improves relative to the street — the most expensive kitchen on a block sets a ceiling, not a floor. Highly personal finishes that a buyer will want to undo. Converting a garage to living space in a neighborhood where every comparable house has covered parking. And any addition that can only be reached through another bedroom, which reads as awkward no matter how well it is built.</p>',
      },
      {
        heading: 'The honest caveat',
        body: () =>
          '<p>Cost recovery figures get quoted with more confidence than they deserve. They vary by neighborhood, by year, and by how the work was executed. The reliable statement is narrower: fixing a deficiency buyers can see is a better bet than adding a feature they were not looking for, and quality of execution matters more than category.</p>',
      },
    ],
    faqs: [
      {
        q: 'What home improvement adds the most value in South Carolina?',
        a: () =>
          'Kitchen and bathroom updates when the existing ones are dated, and usable outdoor living space given the long season here. Both address what buyers immediately notice.',
      },
      {
        q: 'Does a screened porch add value?',
        a: () =>
          'It adds appeal reliably, and it does it for far less than an addition because it is not conditioned space. In this climate a porch is used most of the year, which is why it lands well with buyers.',
      },
      {
        q: 'Is finishing a basement a good investment?',
        a: () =>
          'Usually, on cost-per-square-foot grounds alone — it is the cheapest finished space you can create. Below-grade area is valued differently from above-grade square footage, so treat it as usable space gained rather than a headline number increase.',
      },
      {
        q: 'Should I remodel before selling?',
        a: () =>
          'Fix what is visibly dated or broken; do not start a major remodel to someone else’s taste. Paint, lighting, flooring and a tidy kitchen and bathroom generally serve a sale better than an ambitious project completed under time pressure.',
      },
    ],
  },

  {
    slug: 'basement-finishing-ideas-sc',
    service: 'Basement Finishing',
    city: 'South Carolina',
    serviceKey: 'basementFinishing',
    calculator: 'calculator/basement-finishing.html',
    servicePage: 'basement-finishing/index.html',
    permitCounty: 'Greenville County',
    h1: 'Basement Finishing Ideas for South Carolina Homeowners',
    metaTitle: 'Basement Finishing Ideas for SC Homes | Burch Contracting',
    metaDescription:
      'Practical basement finishing ideas for South Carolina homes — rec rooms, guest suites, offices and in-law space — with what each one costs to build.',
    lead: (p) =>
      `Basement finishing runs <strong>${p.perSqft} per square foot</strong> here, so an 800 sq ft basement between ${p.tier('basicFinish', 800)} and ${p.tier('premiumBuildOut', 800)} covers most of the ideas below. Which one suits your basement depends less on taste than on three things: ceiling height, natural light, and whether a bedroom can get compliant egress.`,
    tiers: [
      {
        label: 'Rec room or play space, 800 sq ft',
        rateId: 'basicFinish',
        sqft: 800,
        note: 'One open space, durable flooring, good lighting. The most space for the least money.',
      },
      {
        label: 'Guest or in-law suite, 800 sq ft',
        rateId: 'standardLivingSuite',
        sqft: 800,
        note: 'Bedroom with compliant egress, full bath, sitting area, and a kitchenette in some layouts.',
      },
      {
        label: 'Media room or full build-out, 1,000 sq ft',
        rateId: 'premiumBuildOut',
        sqft: 1000,
        note: 'Sound-controlled media space, wet bar, built-ins and main-floor finish quality throughout.',
      },
    ],
    drivers: [
      'Ceiling height, which decides whether a media room or gym is comfortable or claustrophobic.',
      'Natural light and window placement, which largely determines whether the space feels like a basement.',
      'Egress, required for any bedroom and a significant cost if it has to be cut into the foundation.',
      'Bathroom drainage, gravity or pumped.',
      'Moisture history, which must be resolved before any finishing.',
      'Stair location, which dictates how the floor plan can be divided.',
    ],
    sections: [
      {
        heading: 'Ideas that work well below grade',
        body: () =>
          `<p><strong>Rec room.</strong> The simplest and cheapest. One open space handles television, games and children, and needs no plumbing.</p>
           <p><strong>Home office.</strong> Basements are quiet and cool, which suits concentration. Wire it properly and put the desk near whatever natural light exists.</p>
           <p><strong>Guest or in-law suite.</strong> The highest-value option, and the one with the most requirements: egress, a full bath, and ideally a separate entrance.</p>
           <p><strong>Media room.</strong> Below grade is the best place in the house for this — no windows to darken, and the structure above absorbs sound.</p>
           <p><strong>Home gym.</strong> Needs a level slab, impact flooring and honest ventilation. Cheap to finish because it needs little else.</p>
           <p><strong>Workshop or hobby space.</strong> Worth planning circuits and dust control for at framing stage rather than retrofitting.</p>`,
      },
      {
        heading: 'Making a basement not feel like one',
        body: () =>
          '<p>Three things do most of the work: layered lighting rather than a few ceiling fixtures, keeping the ceiling as high as the ducts allow instead of dropping it flat across the whole floor, and using what natural light exists deliberately — putting the seating or the desk near the windows rather than against the far wall. Paint colour helps least of the four, though it gets discussed most.</p>',
      },
    ],
    faqs: [
      {
        q: 'What is the most popular basement finishing idea?',
        a: (p) =>
          `An open rec room, because it is the cheapest way to make the space usable — around ${p.tier('basicFinish', 800)} for 800 sq ft — and it needs no plumbing or egress work.`,
      },
      {
        q: 'Can I put a bedroom in my basement?',
        a: () =>
          'Only with code-compliant egress — a window or door of the required size and sill height. Without it the room cannot be called a bedroom, which matters for safety and at resale.',
      },
      {
        q: 'What ceiling height do I need for a finished basement?',
        a: () =>
          'Check the local requirement before planning, and measure to the lowest obstruction rather than the joists. Ducts and beams usually set the real height, and boxing them selectively preserves more headroom than dropping the whole ceiling.',
      },
      {
        q: 'Is a basement bathroom hard to add?',
        a: () =>
          'It depends on the drain. If the existing line sits below the slab at the right place, it is routine. If not, the fixtures need a pump system, which adds cost and a piece of equipment to maintain.',
      },
    ],
  },
]
