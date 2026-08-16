/**
 * Service Page FAQs — Burch Contracting
 * ------------------------------------------------------------------
 * Keyed by service `id` (matches SERVICES[].id in src/data/services.js).
 *
 * HOW TO INTEGRATE (for Claude Code):
 *   Option A (recommended): import this map in generate-services.mjs and
 *   look up faqs by id at render time:
 *       import { SERVICE_FAQS } from '../src/data/service-faqs.js'
 *       const faqs = SERVICE_FAQS[service.id] || []
 *   Option B: merge each array onto its service object as `faqs: [...]`.
 *
 * The generator must do TWO things with these:
 *   1. Render them as a VISIBLE <section> on the page (an accordion or
 *      simple <h2>/<h3> Q&A list). Google/AEO require the FAQ text to be
 *      visible on-page — schema-only FAQs are non-compliant and won't be
 *      quoted.
 *   2. Emit a matching FAQPage JSON-LD block whose Question/acceptedAnswer
 *      text is identical to the visible copy.
 *
 * PRICING DISCIPLINE (see PRICING.md):
 *   calculator-config.js is the single source of truth for pricing.
 *   For decks, additions, and kitchen/bath/whole-home remodels the dollar
 *   figures are computed — so those answers deliberately contain NO hard
 *   numbers and instead point to the calculator or reference the existing
 *   service field. If you want a live number in those answers, interpolate
 *   `service.pricePerSqFt` or `service.stats.costRange` rather than typing one.
 *   For porches, patios, garages, ADU, basement, and ADA-bath, the ranges
 *   below match the static strings already in services.js.
 *
 * VERIFY BEFORE PUBLISH (intentionally NOT invented — add Scott's real terms):
 *   - Financing / payment-plan options (no financing claim is made below)
 *   - Workmanship warranty length (only manufacturer warranties are cited)
 *   - Any specific insurance-billing arrangements beyond documentation
 *   - Confirm the "we handle permits/inspections" phrasing matches how Scott
 *     actually runs each county (Greenville / Laurens / Spartanburg).
 * ------------------------------------------------------------------
 */

export const SERVICE_FAQS = {
  decks: [
    {
      question: 'How much does it cost to build a deck in Upstate SC?',
      answer: 'Deck cost depends on size, materials, and elevation. Pressure-treated pine is the most economical option, composite decking (Trex, TimberTech, Azek) costs more up front but is low-maintenance, and multi-level premium decks with built-in features are the highest tier. Use our deck cost calculator for an instant per-square-foot estimate based on your project.'
    },
    {
      question: 'How long does it take to build a custom deck?',
      answer: 'Most custom decks take 2 to 4 weeks from permit to finish. Simple ground-level pressure-treated decks fall at the shorter end, while elevated, multi-level, or composite decks with railings, lighting, and pergolas take longer. Weather and county permitting timelines can affect the schedule.'
    },
    {
      question: 'Should I choose pressure-treated or composite decking?',
      answer: 'Pressure-treated southern yellow pine is the most affordable choice but needs annual cleaning and sealing. Composite decking from Trex, TimberTech, or Azek costs more initially but is virtually maintenance-free, resists fading and rot, and carries 25-year manufacturer warranties. For most homeowners planning to stay long-term, composite pays off over time.'
    },
    {
      question: 'Do I need a permit to build a deck?',
      answer: 'Yes. Decks in Upstate SC generally require a building permit and inspections, especially anything elevated or attached to the house. As a licensed general contractor (SC #CLG118679), Burch Contracting handles the permitting and inspections through your county — Greenville, Laurens, or Spartanburg — so you do not have to.'
    },
    {
      question: 'Can you build multi-level decks with lighting, seating, or a pergola?',
      answer: 'Yes. Our premium tier covers two-tier and multi-level designs with built-in seating, planters, integrated lighting, pergolas, and screened sections. Every deck is designed to match your home and engineered for Upstate SC weather.'
    }
  ],

  'screened-porches': [
    {
      question: 'How much does a screened porch cost in Upstate SC?',
      answer: 'Screened porches typically run $15,000 to $65,000: a basic enclosure on an existing deck at the low end, a mid-range three-season room with EZE-Breeze windows in the middle, and a premium climate-controlled porch with insulation and HVAC at the top.'
    },
    {
      question: 'What is the difference between a screened porch and a three-season room?',
      answer: 'A basic screened porch uses fiberglass screening for bug-free open-air use. A three-season room upgrades to an EZE-Breeze vinyl window system for adjustable ventilation. A premium climate-controlled porch adds insulated walls, roof, and an HVAC extension for true year-round comfort.'
    },
    {
      question: 'How long does it take to build a screened porch?',
      answer: 'A screened porch typically takes 3 to 6 weeks depending on whether we are building on a new foundation or converting an existing deck, and on the finish level. Premium climate-controlled builds with HVAC and interior finishing take longer than a basic screened enclosure.'
    },
    {
      question: 'Can you convert my existing deck into a screened porch?',
      answer: 'Yes. Converting an existing deck or concrete pad into a screened porch is one of the most common projects we do. We assess the existing structure to confirm it can support the roof and screening system, then handle framing, screening, electrical, and finishing.'
    },
    {
      question: 'Can a screened porch be used year-round in South Carolina?',
      answer: 'A basic or three-season porch is comfortable for most of the Upstate SC year but not the coldest or hottest stretches. For true year-round use, the premium climate-controlled tier adds insulation and an HVAC extension so the space functions like conditioned living area in every season.'
    }
  ],

  'covered-patios': [
    {
      question: 'How much does a covered patio cost?',
      answer: 'Covered patios typically range from $15,000 to $45,000, or $75-$150 per square foot: a basic roof over an existing slab at the low end, a mid-range outdoor room with columns and lighting in the middle, and a premium space with a kitchen or fireplace at the top.'
    },
    {
      question: 'What is the difference between a covered patio and a screened porch?',
      answer: 'A covered patio is a roofed structure with open sides that shields you from sun and rain while keeping an open-air feel. A screened porch encloses that space with screening or windows to keep insects out. Many homeowners choose a covered patio for a more open, indoor-outdoor connection.'
    },
    {
      question: 'Can you add an outdoor kitchen or fireplace to a covered patio?',
      answer: 'Yes. Our premium outdoor living tier includes outdoor kitchen areas, fireplaces or fire pits, custom lighting, ceiling fans, and premium materials, all integrated with your home and landscaping.'
    },
    {
      question: 'How long does it take to build a covered patio?',
      answer: 'Most covered patios take 2 to 5 weeks depending on size, whether a new slab is needed, and the finish level. Basic roof structures go up quickly; premium outdoor living spaces with kitchens and finished ceilings take longer.'
    },
    {
      question: 'Will the covered patio roof match my house?',
      answer: 'Yes. From the mid-range tier up, we match the roof line, materials, and architecture of your home so the covered patio looks like an original part of the house rather than an add-on.'
    }
  ],

  garages: [
    {
      question: 'How much does it cost to build a garage in Upstate SC?',
      answer: 'Garage construction typically runs $39,000 to $145,000 depending on size and type. A standard 2-car detached garage is most affordable, a 3-car or workshop garage with upgraded electrical is mid-range, and a two-story garage with a finished apartment above is the top of the range.'
    },
    {
      question: 'How long does it take to build a detached garage?',
      answer: 'A detached garage typically takes 6 to 10 weeks from site prep to finish, covering foundation, framing, roofing, siding, electrical, and doors. Larger workshop builds or garages with apartments above take longer because of the additional structure and finishing.'
    },
    {
      question: 'Can you build a garage with an apartment above it?',
      answer: 'Yes. A garage with a finished apartment above is a popular option that can generate roughly $850 to $1,200 per month in rental income, or serve as an in-law or guest suite. It involves two-story construction with a full living space, kitchenette, bath, and separate HVAC.'
    },
    {
      question: 'Do you build attached or detached garages?',
      answer: 'Both. We build detached garages, attached garages, and workshop garages, with siding and rooflines matched to your existing home. We help you weigh lot layout, setbacks, and how you plan to use the space when choosing between attached and detached.'
    },
    {
      question: 'Does building a garage require a permit, and do you handle it?',
      answer: 'Yes, garage construction requires permits and inspections. As a licensed SC general contractor (#CLG118679), Burch Contracting manages the full process — site prep, foundation, framing, roofing, electrical, finishing, and all permitting and inspections through your county.'
    }
  ],

  additions: [
    {
      question: 'How much does a home addition cost in Upstate SC?',
      answer: 'Room additions are priced per square foot by finish level, from basic single-story additions up through premium two-story and master-suite builds. Because cost depends heavily on size, complexity, and finishes, use our additions calculator for a per-square-foot estimate tailored to your project.'
    },
    {
      question: 'How long does a room addition take to build?',
      answer: 'Most room additions take 8 to 16 weeks. A single-story bedroom addition is at the shorter end, while a master suite with a full bath or a two-story addition requiring structural engineering takes longer. We give you a project-specific schedule before work begins.'
    },
    {
      question: 'Can you match a new addition to my existing home?',
      answer: 'Yes. Matching the roofline, siding, trim, and interior finishes so the addition blends seamlessly with your existing home is a core part of how we work. With 35+ years building in the Upstate, we source materials to match older homes as closely as possible.'
    },
    {
      question: 'What types of additions do you build?',
      answer: 'We build bedroom additions, master suites with bathrooms and walk-in closets, sunrooms, in-law suites, and two-story additions. Many of our addition clients are creating space for multi-generational living or building out a forever home rather than moving.'
    },
    {
      question: 'Do additions require permits and structural engineering?',
      answer: 'Yes. Additions require permits and inspections, and two-story or structurally complex additions also require engineering. Burch Contracting handles design, permitting, foundation, framing, HVAC integration, and all inspections from start to finish.'
    }
  ],

  'adu-builder': [
    {
      question: 'How much does it cost to build an ADU?',
      answer: 'ADUs typically cost $65,000 to $220,000, or roughly $110 to $185 per square foot. A garage apartment is the most economical option, a detached 1-bedroom cottage sits in the middle, and a full 2-bedroom ADU is the top of the range.'
    },
    {
      question: 'What is an ADU?',
      answer: 'An ADU, or Accessory Dwelling Unit, is a secondary living unit on the same lot as a main home. It can be a garage apartment, a detached backyard cottage, or an in-law suite, with its own kitchen, bathroom, and entrance. ADUs are used for rental income, aging parents, or flexible family space.'
    },
    {
      question: 'Can an ADU generate rental income?',
      answer: 'Yes. Depending on size and configuration, an ADU can generate roughly $850 to $1,500 per month in rental income in the Upstate SC market. A garage apartment sits at the lower end and a full 2-bedroom unit at the higher end.'
    },
    {
      question: 'How long does it take to build an ADU?',
      answer: 'ADU construction typically takes 10 to 16 weeks, covering zoning review, design, construction, and utility connections. Detached full-featured cottages take longer than a garage apartment built above an existing structure.'
    },
    {
      question: 'Are ADUs allowed on my property?',
      answer: 'It depends on your local zoning, lot size, and setback rules, which vary across Greenville, Laurens, and Spartanburg counties. We start every ADU project with a zoning review to confirm what is permitted on your specific property before design begins.'
    }
  ],

  remodeling: [
    {
      question: 'How much does a kitchen or bathroom remodel cost?',
      answer: 'Remodeling cost depends entirely on scope, from a modest bathroom refresh up through a full luxury master bath, and from a budget kitchen refresh up through a high-end custom kitchen. Use our kitchen remodel and bath remodel calculators for an estimate matched to your project size and finish level.'
    },
    {
      question: 'How long does a remodel take?',
      answer: 'Timelines vary by project: a bathroom remodel typically takes 2 to 4 weeks, a kitchen remodel 4 to 8 weeks, and a whole-house remodel 12 to 20 weeks. Structural changes, custom cabinetry, and long-lead materials can extend these ranges.'
    },
    {
      question: 'Do you handle whole-house remodels?',
      answer: 'Yes. We handle comprehensive whole-house renovations involving multiple rooms, structural changes, and systems upgrades, as well as individual kitchen and bathroom remodels. Every project is managed personally by Scott Burch from demolition through final finishing.'
    },
    {
      question: 'Do you provide design, or do I need to hire a designer first?',
      answer: 'We work design-build, handling design, demolition, structural work, electrical, plumbing, and finishing under one roof. You do not need to line up a separate designer and contractor — we manage all phases so decisions stay coordinated and on budget.'
    },
    {
      question: 'Will my kitchen or bathroom be usable during the remodel?',
      answer: 'For most kitchen and bathroom remodels there is a period where the space is out of use while fixtures, plumbing, and finishes are replaced. We sequence the work to keep that window as short as practical and walk you through what to expect before demolition starts.'
    }
  ],

  'bathroom-remodeling': [
    {
      question: 'How much does a bathroom remodel cost in Simpsonville, SC?',
      answer: 'A bathroom remodel in Simpsonville and Fountain Inn typically runs $6,375 to $30,708 for a full bath, depending on size and scope — a basic 5×8 hall bath refresh starts around $6,375–$7,677, while a mid-range 80 sq ft primary bath runs $25,498–$30,708. Powder rooms start near $3,984, and a full-gut primary bath with custom tile and premium fixtures runs $60,103 and up. Use our bath remodel calculator for an estimate matched to your bathroom’s size and finish level.'
    },
    {
      question: 'How much does a small bathroom remodel cost?',
      answer: 'A small bathroom — a powder room or a compact 5×8 hall bath — typically costs $3,984 to $7,677 for a basic refresh: new fixtures, vanity, flooring, and paint with the existing layout and plumbing left in place. Moving fixtures or upgrading to a full tile shower in that same small footprint pushes the mid-range tier to roughly $12,749–$15,354.'
    },
    {
      question: 'How much does a master or primary bathroom remodel cost?',
      answer: 'A primary bathroom remodel typically runs $25,498 to $98,018 depending on size and scope. An 80 sq ft primary bath with a tile shower and updated vanity at the mid-range tier runs about $25,498–$30,708; a full-gut 96 sq ft primary bath with a custom tile shower and double vanity runs $60,103–$72,382; and a large 130+ sq ft spa bath with a freestanding soaking tub, heated floors, and frameless glass runs $81,390–$98,018.'
    },
    {
      question: 'How much does a powder room remodel cost?',
      answer: 'A powder room (half bath, roughly 25 sq ft) typically costs $3,984 to $4,798 for a basic refresh — new vanity, toilet, floor tile, lighting, and paint, with no tub or shower involved. Since a powder room has no wet area to waterproof, it’s consistently the least expensive full bathroom project we quote.'
    },
    {
      question: 'How long does a bathroom remodel take?',
      answer: 'Most full bathroom remodels take 2 to 4 weeks of construction. A powder room can finish in as little as 5-8 working days, while a large primary bath with custom glass and long-lead tile can run 5 to 7 weeks. Design, selections, and permitting typically run 1-3 weeks before demolition even starts, in parallel with ordering long-lead materials.'
    },
    {
      question: 'Do I need a permit to remodel a bathroom in Greenville County?',
      answer: 'Yes, in most cases. Greenville County requires a permit any time a new building is constructed, structural changes are made, or additions are made to an existing structure, and specifically flags bathroom remodels over $5,000 or work touching the foundation, framing, plumbing, electrical, or HVAC. A purely cosmetic refresh — paint, a like-for-like vanity swap, a toilet replaced in the same spot — typically doesn’t need one. We pull all required permits under SC license #CLG118679 as part of the contract.'
    },
    {
      question: 'Do I need a permit in Simpsonville or Fountain Inn city limits?',
      answer: 'It depends on the address. The City of Simpsonville and the City of Fountain Inn each administer their own permits within municipal limits, while unincorporated areas around both cities fall under Greenville County, and Laurens County covers our Gray Court and Laurens service areas. Rather than guess which jurisdiction applies, we confirm it for your specific address before filing — you don’t need to figure this out yourself.'
    },
    {
      question: 'Can I use my bathroom during the remodel?',
      answer: 'Not for most of the project if it’s your only bathroom — a full remodel puts the room out of commission from demolition through final fixtures, typically 2 to 4 weeks. If you have a second bathroom in the house, we sequence the work so you have uninterrupted access to it. For single-bathroom homes, we talk through the timeline and any temporary arrangements before demolition starts, not after.'
    },
    {
      question: 'What is included in a bathroom remodel quote?',
      answer: 'A written, itemized quote covers demolition and haul-off, plumbing and electrical rough-in, waterproofing and shower pan work, tile, vanity and countertop, tub or shower and fixtures, toilet, lighting and mirrors, paint and trim, and permits — one number for the full scope rather than a bid that leaves trades to be priced separately later. We review it with you line by line before any work begins.'
    },
    {
      question: 'Is a bathroom remodel worth it for resale value?',
      answer: 'Usually, yes, for a minor or mid-range remodel. Midrange bathroom remodels recouped roughly 74-80% of their cost at resale in the 2026 Remodeling Cost vs. Value data — the highest that figure has been since 2007 — while small cosmetic refreshes under $5,000 can return 80-100%. Full luxury renovations return proportionally less, typically 45-60%, because premium finishes don’t add dollar-for-dollar value; a luxury bath is more often bought for daily living than for resale math.'
    },
    {
      question: 'Should I move the plumbing or keep the existing layout?',
      answer: 'Keeping the existing plumbing locations is the single biggest lever for controlling cost — relocating a toilet, shower, or vanity drain means opening the floor or walls, which is the difference between a basic refresh and a mid-range or full-gut budget. Moving plumbing makes sense when the current layout genuinely doesn’t work (a cramped shower, an awkwardly placed vanity), but it’s rarely worth it purely for aesthetics.'
    },
    {
      question: 'How much does a tub-to-shower conversion cost?',
      answer: 'An accessible, ADA-style roll-in tub-to-shower conversion — demo, new pan, waterproofing, tile or fiberglass surround, grab bars, and a low-threshold entry — typically runs $10,500 to $19,800 with us. A standard (non-accessible) conversion that keeps a curb and skips ADA-specific items like a roll-in base and extra grab bars usually costs less than that range, since it drops the accessibility-specific line items. See our ADA bath-to-shower conversions for the accessible version and its calculator.'
    },
    {
      question: 'Should I keep a bathtub in the house?',
      answer: 'If the house has at least one other bathtub, converting a secondary bath to a walk-in shower is increasingly common and won’t hurt resale — 55% of design professionals surveyed for NKBA’s 2026 Bath Trends Report say a larger shower now matters more to buyers than having a bathtub. If this would be the only tub in the house, we generally recommend keeping at least one somewhere, since some buyers with young children specifically look for it.'
    },
    {
      question: 'What is a curbless (zero-entry) shower and what does it cost?',
      answer: 'A curbless shower has no raised threshold — the floor slopes gently to a drain instead, so you step or roll straight in at the same level as the rest of the bathroom floor. It reads as both modern and more accessible, which is why it shows up on both budget-conscious and luxury remodels. As an upgrade to an existing shower plan, it typically adds around $2,800 to the project.'
    },
    {
      question: 'What is the most common hidden cost in a bathroom remodel?',
      answer: 'Water damage found once demolition opens the walls or floor — rotted subfloor around an old tub, a slow leak that was never visible from outside the wall, or corroded galvanized supply lines. This is also why we order long-lead materials like custom vanities and specialty tile before demolition starts: it’s the mid-project stall, not the surprise itself, that actually derails a schedule.'
    },
    {
      question: 'How do you protect the rest of my house during construction?',
      answer: 'We protect adjacent flooring and hallways before demolition starts, seal off the work area to control dust, and haul debris out through a route we walk with you in advance rather than through the rest of the house. Every project is managed personally by Scott Burch, so the same person you talked to during the quote is checking on protection and cleanup throughout.'
    },
    {
      question: 'Do you provide design, or do I need a designer first?',
      answer: 'We work design-build, handling layout, fixture and tile selections, demolition, structural work, electrical, plumbing, and finishing under one roof. You don’t need to line up a separate designer and contractor — we manage all phases so decisions stay coordinated and on budget instead of getting relayed between two companies.'
    },
    {
      question: 'Who buys the fixtures and tile — you or me?',
      answer: 'Either way works. Most clients let us source fixtures and tile as part of the itemized quote, which keeps warranty and delivery scheduling under one contract. If you’d rather select and purchase specific pieces yourself — a particular vanity or a tile you’ve already fallen in love with — we build the quote around owner-supplied materials and coordinate delivery timing with the schedule.'
    },
    {
      question: 'What waterproofing system do you use and why does it matter?',
      answer: 'We use a sheet or liquid waterproofing membrane system (Schluter-KERDI or equivalent) behind tile and under every shower pan, not just a cement backer board on its own. This is the single most important decision nobody sees once the tile goes up — it’s the difference between a shower that lasts decades and one that quietly rots the subfloor within a few years.'
    },
    {
      question: 'What size exhaust fan does my bathroom need?',
      answer: 'Code requires at least 50 CFM for a fan that runs intermittently (tied to the light switch) or 20 CFM for one that runs continuously at low speed, ducted straight to the exterior — never into the attic. Larger bathrooms, steam showers, or rooms with poor natural airflow often benefit from sizing above the code minimum; undersized or improperly vented ventilation is the most common cause of premature failure in an otherwise well-built bathroom.'
    },
    {
      question: 'How do I know a bathroom contractor is properly licensed in South Carolina?',
      answer: 'Ask for their SC Residential Builders Commission license number and verify it directly on the South Carolina LLR website — it takes about a minute. Burch Contracting holds SC General Contractor License #CLG118679 and NC General Contractor License (Limited) #107292, and we’re glad to have you verify either one before signing anything.'
    },
    {
      question: 'Do you offer financing or payment schedules?',
      answer: 'We discuss payment schedule options during your free consultation, tailored to your project size and scope. Contact us for the specifics that apply to your remodel.'
    },
    {
      question: 'What warranty do you provide on bathroom remodels?',
      answer: 'Workmanship is covered under the terms outlined in your written contract, and manufacturer warranties on fixtures, tile, and materials pass through to you directly. Ask us for the specific warranty terms that apply to your project during your consultation — we’ll put them in writing before work begins.'
    },
    {
      question: 'How do I get started and what does the first visit cost?',
      answer: 'Call (864) 724-4600 or request a consultation online — the initial visit and ballpark estimate are free. We walk the space, talk through scope and budget, and follow up with a written, itemized quote so you know the real number before committing to anything.'
    }
  ],

  'commercial-upfits': [
    {
      question: 'How much does a commercial build-out cost?',
      answer: 'Commercial upfits typically run $30 to $100+ per square foot. A basic office or retail build-out is at the lower end, a mid-range professional or medical space in the middle, and a restaurant or food-service build-out with commercial kitchen systems at the top.'
    },
    {
      question: 'What is a commercial upfit or tenant improvement?',
      answer: 'A commercial upfit, also called a tenant improvement, is the build-out of a leased commercial space to fit a specific business — interior walls, flooring, lighting, HVAC, restrooms, and specialized systems. It turns a shell or a previous tenant\'s layout into a space ready for your operation.'
    },
    {
      question: 'How long does a commercial build-out take?',
      answer: 'Commercial upfits typically take 4 to 16 weeks depending on complexity. A simple office or retail space is quickest, while medical offices and restaurants with specialized systems and health-department requirements take longer.'
    },
    {
      question: 'Do you handle restaurant and medical office build-outs?',
      answer: 'Yes. We build out restaurants with commercial kitchen equipment, hood systems, and grease traps, and medical or professional offices with exam rooms, ADA compliance, and specialized HVAC and plumbing, coordinating health-department and code requirements throughout.'
    },
    {
      question: 'Do you manage permits and inspections for commercial projects?',
      answer: 'Yes. We handle the full process from space planning and permitting through construction, inspections, and final finishes, delivering the project on schedule and to code.'
    }
  ],

  'commercial-roofing': [
    {
      question: 'What commercial roofing systems do you install?',
      answer: 'We install TPO, EPDM, and PVC single-ply membranes, modified bitumen, standing seam and R-panel metal roofing, and silicone or acrylic restoration coatings. The right system depends on the building\'s deck type, slope, drainage, and how long the roof needs to perform before its next major repair.'
    },
    {
      question: 'Should I recover my existing roof or do a full tear-off?',
      answer: 'A recover installs a new membrane over the existing roof and costs less, but building code allows only two roof systems on a building before a tear-off is required — if your roof already has one recover on it, or the existing substrate is wet or deteriorated, a full tear-off is the only code-compliant option. We inspect the existing roof and roof history before recommending either.'
    },
    {
      question: 'Do you handle roof leaks and emergency repairs?',
      answer: 'Yes. We respond to active leaks and storm-related emergencies with temporary weatherproofing to stop water intrusion, followed by a permanent repair. Because we also handle the interior side of the building, ceiling, drywall, insulation, and flooring damaged by the leak gets repaired under the same contract instead of requiring a second contractor.'
    },
    {
      question: 'Do you offer roof maintenance or inspection agreements?',
      answer: 'Yes, and we treat this as core to how we work with property managers and building owners, not an add-on. Scheduled inspections catch membrane wear, flashing failures, and drainage issues before they become leaks, and a maintenance agreement extends the service life of the roof and supports warranty compliance where applicable.'
    },
    {
      question: 'Do you handle storm and hail damage insurance claims for commercial roofs?',
      answer: 'Yes. We document storm and hail damage, work directly with your insurance adjuster, and complete the approved repair or replacement. This is the same insurance-restoration process we run for residential claims, applied to commercial roofing — see our insurance restoration services for how the claims process works.'
    }
  ],

  'basement-finishing': [
    {
      question: 'How much does it cost to finish a basement?',
      answer: 'Basement finishing typically runs $30 to $75 per square foot depending on finish level. A basic living-space conversion is at the lower end, a mid-range finish with a bedroom and full bath in the middle, and a high-end finish with a wet bar, home theater wiring, and custom built-ins at the top.'
    },
    {
      question: 'How long does basement finishing take?',
      answer: 'Finishing a basement typically takes 6 to 10 weeks, covering egress windows, moisture control, framing, insulation, electrical, plumbing, and interior finishing. Adding bathrooms or extensive custom work extends the timeline.'
    },
    {
      question: 'Do I need egress windows to finish my basement?',
      answer: 'Yes. Building code requires egress windows for any basement bedroom or finished living space, both for safe exit and for natural light. Installing code-compliant egress windows is a standard part of our basement finishing scope.'
    },
    {
      question: 'What about basement moisture and waterproofing?',
      answer: 'We address moisture before finishing. If waterproofing or a sump pump is needed, moisture remediation typically adds $2,500 to $6,000. Skipping this step is the most common cause of finished-basement failures, so we assess and correct it up front.'
    },
    {
      question: 'Can you add a bathroom or bedroom in a finished basement?',
      answer: 'Yes. Our mid-range and high-end tiers include full bathrooms — often with an ejector pump for below-grade plumbing — plus bedrooms with code-compliant egress and closets. High-end finishes can also include wet bars, home theaters, and soundproofing.'
    }
  ],

  'insurance-restoration': [
    {
      question: 'Do you work with insurance companies on storm and water damage claims?',
      answer: 'Yes. We communicate clearly with your insurance company throughout the claim, and a detailed written estimate with full documentation is available for a fee, credited back if you hire us. Scott Burch personally oversees each restoration project so the repairs are handled correctly and to standard.'
    },
    {
      question: 'What types of damage do you restore?',
      answer: 'We handle storm damage, water damage, wind and hail damage, and general insurance-claim repairs across Upstate SC, from a free consultation through full-quality repairs.'
    },
    {
      question: 'How does the insurance restoration process work?',
      answer: 'It runs in three steps: a free consultation to discuss the damage and get a ballpark range, a detailed on-site assessment with professional documentation and a written estimate (available for a fee, credited back if you hire us), and then quality repairs completed once the work is approved.'
    },
    {
      question: 'Will you provide documentation for my insurance claim?',
      answer: 'Yes. A detailed written estimate with full documentation to support your insurance claim is available for a fee, which is fully credited toward your project if you hire us.'
    },
    {
      question: 'How much does insurance restoration cost?',
      answer: 'Restoration is quoted custom based on the scope of damage, and in many cases the work is covered by your insurance claim. We provide a free consultation and ballpark range; a detailed written estimate is available for a fee, credited back if you hire us.'
    }
  ],

  'ada-compliance': [
    {
      question: 'What ADA and accessibility modifications do you do?',
      answer: 'We design and build ramps, curbless roll-in showers, grab bars, ADA-height fixtures, widened doorways and hallways, accessible flooring transitions, and ADA-compliant restrooms for both homes and businesses across Upstate SC.'
    },
    {
      question: 'Do you handle commercial ADA compliance?',
      answer: 'Yes. For businesses we build accessible entrance ramps and handrails, ADA-compliant restroom retrofits, door width and hardware upgrades, and parking and path-of-travel accessibility, and we handle code compliance review and permitting.'
    },
    {
      question: 'Do you do aging-in-place modifications for homes?',
      answer: 'Yes. Residential accessibility work includes curbless and roll-in showers, grab bars, widened doorways, wheelchair and threshold ramps, and accessible flooring — modifications that support independence and safety for aging in place.'
    },
    {
      question: 'Will the work meet current ADA standards?',
      answer: 'Yes. We evaluate the space against current ADA standards, identify what needs to change, and complete the modifications to code. With 35+ years of local experience handling permits and inspections, compliance is built into how we work.'
    },
    {
      question: 'How much do accessibility modifications cost?',
      answer: 'Accessibility work is quoted custom based on scope, since a single grab-bar and threshold project differs greatly from a full commercial restroom retrofit. We provide a free consultation and ballpark range; a detailed written estimate is available for a fee, credited back if you hire us.'
    }
  ],

  'ada-bath-to-shower': [
    {
      question: 'How much does an ADA bath-to-shower conversion cost?',
      answer: 'A tub-to-shower conversion typically costs $10,500 to $19,800. The range depends on the shower base and surround you choose (fiberglass versus tile-ready), plumbing relocation, and the grab bars, valve, and accessible door or curtain selected.'
    },
    {
      question: 'How long does a tub-to-shower conversion take?',
      answer: 'Most ADA bath-to-shower conversions take 1 to 2 weeks, from demolition of the existing tub through the finished, accessible shower. Tile surrounds and plumbing relocation add time compared with a fiberglass base and existing plumbing.'
    },
    {
      question: 'What is included in an ADA shower conversion?',
      answer: 'The conversion covers demo and removal of the existing tub, plumbing rough-in and relocation, waterproofing and backing (Schluter or equivalent), an ADA roll-in shower base, a tile or fiberglass surround, installed grab bars, a shower valve and trim, and an accessible door or curtain.'
    },
    {
      question: 'Is a curbless roll-in shower safe for aging in place?',
      answer: 'Yes. A zero-entry, low-threshold roll-in shower removes the tub wall that causes many bathroom falls, and adds ADA grab bars and non-slip surfaces. It is one of the most effective single modifications for fall prevention and independent living.'
    },
    {
      question: 'Can you provide documentation for insurance or a medical need?',
      answer: 'Yes. Insurance-friendly documentation is available on request, which can help when a conversion is tied to a medical need or accessibility requirement.'
    }
  ],

  'handyman': [
    {
      question: 'What kind of handyman work do you do?',
      answer: 'Small plumbing fixture swaps (faucets, toilets, disposals, water heaters), electrical fixture and outlet installation, interior doors and windows, carpentry like baseboards and shelving, drywall repair, and interior painting. If a job is outside that scope, we\'ll tell you up front.'
    },
    {
      question: 'How much does handyman work cost?',
      answer: 'Most single-task jobs run $125 to $730 — outlet swaps, light fixtures, and small drywall patches at the low end. Installations like doors, windows, or a full room repaint typically run $400 to $2,050. Larger jobs like a water heater replacement run $1,100 to $4,400.'
    },
    {
      question: 'Is there a minimum job size?',
      answer: 'Handyman work is offered as a lower-tier service alongside our larger construction projects — contact us with your task list and we\'ll let you know if it\'s a good fit or better scoped as part of a larger remodel.'
    },
    {
      question: 'Do you handle multiple small tasks in one visit?',
      answer: 'Yes. Many customers bundle several small tasks — a few outlet swaps, a door install, some drywall patching — into a single visit, which is usually more cost-effective than separate trips.'
    }
  ]
};

/** Convenience accessor mirroring the helpers in services.js */
export function getFaqsByServiceId(id) {
  return SERVICE_FAQS[id] || [];
}
