var e=`2026-05-02`,t={defaultOverheadAndProfit:.225,locationFactors:{grayCourtArea:{name:`Gray Court & Surrounding Area`,factor:.98,cities:[`Gray Court`,`Enoree`,`Woodruff`]},fountainInnArea:{name:`Fountain Inn & Surrounding Area`,factor:1.02,cities:[`Fountain Inn`,`Simpsonville (South)`,`Mauldin (South)`]},simpsonvilleArea:{name:`Simpsonville & Greenville County`,factor:1.07,cities:[`Simpsonville`,`Mauldin`,`Greenville`,`Five Forks`,`Taylors`]}},outputRanges:{budgetLow:.93,mostCommon:1,customHigh:1.12},sizeRanges:{decks:{min:100,max:800},screenedPorches:{min:100,max:600},garages:{min:400,max:1200},homeAdditions:{min:200,max:1e3}},services:{decks:{name:`Decks`,baseRates:{pressureTreated:{label:`Pressure-Treated Wood Deck`,directCost:34,description:`Standard PT lumber, code-compliant framing, basic railing`},compositeLowMaintenance:{label:`Composite Low-Maintenance Deck`,directCost:52,description:`Composite decking, aluminum railing, hidden fasteners`},premiumComposite:{label:`Premium Composite + Custom Features`,directCost:67,description:`Premium composite, custom railing, built-in features, lighting`}},materialFactors:{standard:1,upgraded:1.15,premium:1.35},complexityFactors:{simple:1,moderate:1.12,complex:1.28},siteConditionFactors:{flat:1,slope:1.08,challenging:1.18},adders:[{id:`bench`,label:`Built-in Bench Seating`,cost:85,unit:`linear foot`},{id:`pergola`,label:`Pergola or Shade Structure`,cost:2500,unit:`per structure`},{id:`lighting`,label:`Deck Lighting Package`,cost:1200,unit:`per deck`},{id:`privacy`,label:`Privacy Screen or Lattice`,cost:45,unit:`linear foot`}]},screenedPorches:{name:`Screened Porches`,baseRates:{enclosureOnly:{label:`Screen Enclosure Only (existing deck/porch)`,directCost:18,description:`Frame and screen existing covered space`},newScreenedPorch:{label:`New Screened Porch (roof, floor, screening)`,directCost:62,description:`Complete structure, roof, screening, basic finishes`},upgradedOutdoorRoom:{label:`Upgraded Outdoor Room (premium finishes)`,directCost:82,description:`Premium materials, ceiling fans, lighting, finished trim`}},materialFactors:{standard:1,upgraded:1.12,premium:1.25},complexityFactors:{simple:1,moderate:1.1,complex:1.22},siteConditionFactors:{existingStructure:1,newConstruction:1.15,structuralChallenges:1.28},adders:[{id:`fan`,label:`Ceiling Fan with Light`,cost:450,unit:`per fan`},{id:`recessed`,label:`Recessed Can Lighting`,cost:180,unit:`per fixture`},{id:`retractable`,label:`Retractable Screen System`,cost:650,unit:`per opening`},{id:`ceiling`,label:`Finished Tongue & Groove Ceiling`,cost:8,unit:`per SF`}]},garages:{name:`Garages`,baseRates:{attachedBasic:{label:`Attached Garage (basic finish)`,directCost:60,description:`Standard 2-car attached, basic finishes, slab foundation`},detachedStandard:{label:`Detached Garage (standard finish)`,directCost:89,description:`Detached 2-car, standard finishes, electrical, garage door`},upgradedWorkshop:{label:`Upgraded Workshop/Carriage House`,directCost:119,description:`Premium finishes, finished walls, upgraded electrical, upgraded door`}},materialFactors:{standard:1,upgraded:1.1,premium:1.22},complexityFactors:{simple:1,moderate:1.12,complex:1.25},siteConditionFactors:{flat:1,slope:1.12,challenging:1.25},adders:[{id:`doors`,label:`Insulated Garage Doors (×2)`,cost:2160,unit:`per pair`},{id:`bonus`,label:`Second Floor Storage/Bonus`,cost:54,unit:`per SF`},{id:`panel`,label:`Upgraded Electrical Panel`,cost:1440,unit:`per garage`},{id:`walls`,label:`Finished Interior Walls`,cost:7.2,unit:`per SF`}]},homeAdditions:{name:`Home Additions`,baseRates:{basicFinish:{label:`Basic Finish Addition`,directCost:172,description:`Standard finishes, functional layout, code-compliant`},standardLivingSpace:{label:`Standard Living Space Addition`,directCost:218,description:`Quality finishes, HVAC, updated fixtures, good flow`},premiumCustom:{label:`Premium Custom Addition`,directCost:278,description:`High-end finishes, custom features, premium materials`},luxuryMasterSuite:{label:`Luxury Master Suite (300+ SF)`,directCost:310,description:`Luxury master bedroom, spa bath, custom closet, premium everything`}},materialFactors:{builder:1,standard:1.08,upgraded:1.18,premium:1.32},complexityFactors:{simple:1,moderate:1.12,complex:1.25},siteConditionFactors:{straightforward:1,moderate:1.1,difficult:1.22},adders:[{id:`bathFull`,label:`Bathroom (Full)`,cost:15e3,unit:`per bathroom`},{id:`bathHalf`,label:`Bathroom (Half)`,cost:8e3,unit:`per bathroom`},{id:`kitchen`,label:`Custom Kitchen Extension`,cost:25e3,unit:`per extension`},{id:`secondStory`,label:`Second Story Addition Premium`,cost:35,unit:`per SF`}]}}},n={decks:{serviceKey:`decks`,title:`Deck Cost Calculator`,metaTitle:`Deck Cost Calculator Simpsonville & Fountain Inn SC | Burch Contracting`,description:`Estimate custom deck costs in Upstate SC by size, material, and location. Transparent 22.5% overhead & profit. SC Licensed #CLG118679.`,intro:`Decks in Upstate SC typically cost $30–$50 per square foot installed — a 12×16 deck (192 sqft) runs $6,000–$9,600 in pressure-treated lumber or $10,000–$14,000 in composite. Size, height, railing, and stairs are the biggest cost drivers.`,marketArea:`Simpsonville, Fountain Inn, Gray Court & Greenville County`},garages:{serviceKey:`garages`,title:`Garage Cost Calculator`,metaTitle:`Garage Cost Calculator Simpsonville & Fountain Inn SC | Burch Contracting`,description:`Plan detached and attached garage construction costs in Upstate SC. Transparent pricing with 22.5% overhead & profit.`,intro:`A standard two-car detached garage in Upstate SC costs $28,000–$48,000 fully finished — slab, framing, roof, doors, and basic electrical. Workshop upgrades, insulation, and HVAC add $4,000–$12,000.`,marketArea:`Simpsonville, Fountain Inn, Gray Court & Greenville County`},porch:{serviceKey:`screenedPorches`,title:`Screened Porch Cost Calculator`,metaTitle:`Screened Porch Cost Calculator Simpsonville SC | Burch Contracting`,description:`Estimate screened porch and outdoor room costs in Upstate SC. New construction or deck conversions.`,intro:`Screened porches in Upstate SC typically run $20,000–$55,000 depending on size, roof structure, and finishes. Converting an existing deck can save 25–30% versus new construction.`,marketArea:`Simpsonville, Fountain Inn, Greenville County, and Laurens County`},additions:{serviceKey:`homeAdditions`,title:`Home Addition Cost Calculator`,metaTitle:`Room Addition Cost Calculator Upstate SC | Burch Contracting`,description:`Estimate room addition and home expansion costs in Upstate SC. $150–$300/sq ft typical range.`,intro:`Room additions in Upstate SC typically cost $150–$300 per square foot depending on finishes, HVAC, plumbing, and structural complexity. Use this calculator for a realistic planning range.`,marketArea:`Simpsonville, Fountain Inn, Gray Court & Greenville County`}},r={standard:`Contractor-grade, solid value`,upgraded:`Quality mid-range materials`,premium:`Architectural or luxury grade`,builder:`Basic contractor-grade`,simple:`Standard layout, no special features`,moderate:`Custom angles or added elements`,complex:`Multi-level, curves, or built-ins`,flat:`Level site, easy equipment access`,slope:`Sloped yard or moderate grading`,challenging:`Steep slope or restricted access`,existingStructure:`Adding to an existing structure`,newConstruction:`Full new ground-up construction`,structuralChallenges:`Complex roof or foundation tie-in`,straightforward:`Level site, standard access`,difficult:`Major structural work required`};function i(e){return r[e]??e}function a(e){return new Intl.NumberFormat(`en-US`,{style:`currency`,currency:`USD`,maximumFractionDigits:0}).format(e)}function o(e){return`${(e*100).toFixed(1)}%`}function s(e){let n=t.sizeRanges[e];return n?50*Math.round((n.min+n.max)/2/50):250}function c({squareFootage:e,baseDirectCost:t,locationFactor:n,materialFactor:r,complexityFactor:i,siteConditionFactor:a,addersTotal:o,overheadAndProfit:s,outputRanges:c}){let l=e*t,u=l*n*r*i*a,d=u+o,f=d*(1+s);return{directCost:l,adjustedDirectCost:u,subtotalBeforeOP:d,finalPrice:f,budgetLow:f*c.budgetLow,mostCommon:f*c.mostCommon,customHigh:f*c.customHigh,overheadAndProfitAmount:f-d}}var l=document.getElementById(`calculator-app`);if(l){let e=n[l.dataset.page];e&&u(l,e)}function u(e,n){let r=t.services[n.serviceKey],i=t.sizeRanges[n.serviceKey],a=Object.entries(r.baseRates)[0][0],o=s(n.serviceKey),c={rateId:a,sqft:o,sqftInput:String(o),location:`fountainInnArea`,material:Object.values(r.materialFactors)[0],materialKey:Object.keys(r.materialFactors)[0],complexity:Object.values(r.complexityFactors)[0],complexityKey:Object.keys(r.complexityFactors)[0],site:Object.values(r.siteConditionFactors)[0],siteKey:Object.keys(r.siteConditionFactors)[0],adders:Object.fromEntries((r.adders??[]).map(e=>[e.id,0])),showDetails:!1};e.innerHTML=`
    <div class="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div class="space-y-6 print:hidden" id="calc-inputs"></div>
      <div id="calc-results"></div>
    </div>
    <div class="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between bg-blue-700 px-4 py-3 shadow-lg lg:hidden print:hidden" id="calc-mobile-bar"></div>
  `;let l=e.querySelector(`#calc-inputs`),u=e.querySelector(`#calc-results`),f=e.querySelector(`#calc-mobile-bar`),p=()=>{m(l,r,i,c,n);let e=d(r,c);h(u,r,c,e,n),g(f,e)};e.addEventListener(`click`,e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let{action:n,value:i,field:a}=t.dataset;n===`select-rate`&&(c.rateId=i),n===`select-location`&&(c.location=i),n===`select-material`&&(c.materialKey=i,c.material=r.materialFactors[i]),n===`select-complexity`&&(c.complexityKey=i,c.complexity=r.complexityFactors[i]),n===`select-site`&&(c.siteKey=i,c.site=r.siteConditionFactors[i]),n===`toggle-details`&&(c.showDetails=!c.showDetails),n===`print`&&window.print(),p()}),e.addEventListener(`input`,e=>{let t=e.target;if(t.id===`sqft-input`){c.sqftInput=t.value;let e=Number(t.value);e>=1&&(c.sqft=e),_()}t.dataset.adder&&(c.adders[t.dataset.adder]=Math.max(0,Number(t.value)||0),_())}),e.addEventListener(`blur`,e=>{if(e.target.id===`sqft-input`){let t=Number(c.sqftInput);(!c.sqftInput||t<1)&&(c.sqftInput=String(c.sqft),e.target.value=c.sqftInput),_()}},!0);function _(){let e=d(r,c);h(u,r,c,e,n),g(f,e)}p()}function d(e,n){let r=e.baseRates[n.rateId],i=t.locationFactors[n.location],a=(e.adders??[]).reduce((e,t)=>{let r=n.adders[t.id]??0;return e+t.cost*r},0);return c({squareFootage:n.sqft,baseDirectCost:r.directCost,locationFactor:i.factor,materialFactor:n.material,complexityFactor:n.complexity,siteConditionFactor:n.site,addersTotal:a,overheadAndProfit:t.defaultOverheadAndProfit,outputRanges:t.outputRanges})}function f(e,t){return`
    <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 lg:p-7">
      <h2 class="text-xl font-bold text-slate-900 mb-5">${e}</h2>
      ${t}
    </div>
  `}function p(e,t,n,r){return`
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      ${e.map(([e,r])=>`
          <button type="button" data-action="${n}" data-value="${e}"
            class="rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${t===e?`border-blue-600 bg-blue-50 text-blue-800`:`border-slate-200 text-slate-700 hover:border-blue-300`}">
            <div class="font-medium capitalize">${e}</div>
            <div class="text-xs text-slate-500 mt-0.5">${i(e)}</div>
            <div class="font-mono text-xs font-bold mt-1">${r.toFixed(2)}×</div>
          </button>
        `).join(``)}
    </div>
  `}function m(n,r,i,s,c){let l=Object.entries(r.baseRates);n.innerHTML=`
    <div class="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
      <strong>Pricing data updated:</strong> ${new Date(e).toLocaleDateString(`en-US`,{month:`long`,year:`numeric`})} — reflects current Upstate SC market rates, material costs, and labor pricing.
    </div>
    <div class="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 leading-relaxed">
      <h2 class="font-bold text-base mb-2">Budget Planning Tool</h2>
      This calculator uses local market pricing with transparent ${o(t.defaultOverheadAndProfit)} overhead and profit. Final pricing depends on site conditions, materials, permits, and scope verification.
    </div>
    ${f(`Choose Your Project Type`,`<div class="space-y-3">
        ${l.map(([e,t])=>`
            <button type="button" data-action="select-rate" data-value="${e}"
              class="w-full rounded-xl border-2 p-4 text-left transition-all ${s.rateId===e?`border-blue-600 bg-blue-50`:`border-slate-200 bg-white hover:border-blue-300`}">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="font-semibold text-slate-900">${t.label}</h3>
                  <p class="mt-1 text-sm text-slate-600">${t.description}</p>
                </div>
                <div class="text-right shrink-0">
                  <div class="text-xs uppercase tracking-wide text-slate-500">Base rate</div>
                  <div class="text-lg font-bold text-slate-900">${a(t.directCost)}</div>
                  <div class="text-xs text-slate-500">per SF</div>
                </div>
              </div>
            </button>
          `).join(``)}
      </div>`)}
    ${f(`Size & Location`,`
        <label for="sqft-input" class="block text-sm font-semibold text-slate-700 mb-1">Project Size (square feet)</label>
        <p class="text-xs text-slate-500 mb-2">Typical range: ${i.min.toLocaleString()}–${i.max.toLocaleString()} SF</p>
        <input type="number" id="sqft-input" min="1" step="1" value="${s.sqftInput}"
          class="mb-5 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600" />
        <label class="block text-sm font-semibold text-slate-700 mb-2">Project Location</label>
        <div class="space-y-2">
          ${Object.entries(t.locationFactors).map(([e,t])=>`
              <button type="button" data-action="select-location" data-value="${e}"
                class="w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${s.location===e?`border-blue-600 bg-blue-50 text-blue-800`:`border-slate-200 text-slate-700 hover:border-blue-300`}">
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <span class="font-semibold">${t.name}</span>
                    <span class="ml-2 text-xs text-slate-500">(${t.cities.join(`, `)})</span>
                  </div>
                  <span class="font-mono text-xs font-bold">${t.factor.toFixed(2)}×</span>
                </div>
              </button>
            `).join(``)}
        </div>
      `)}
    ${f(`Project Factors`,`
        <div class="mb-5">
          <label class="block text-sm font-semibold text-slate-700 mb-2">Material Level</label>
          ${p(Object.entries(r.materialFactors),s.materialKey,`select-material`)}
        </div>
        <div class="mb-5">
          <label class="block text-sm font-semibold text-slate-700 mb-2">Project Complexity</label>
          ${p(Object.entries(r.complexityFactors),s.complexityKey,`select-complexity`)}
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Site Conditions</label>
          ${p(Object.entries(r.siteConditionFactors),s.siteKey,`select-site`)}
        </div>
      `)}
    ${r.adders?.length?f(`Optional Add-Ons`,`<div class="space-y-4">
              ${r.adders.map(e=>`
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p class="font-medium text-slate-900 text-sm">${e.label}</p>
                    <p class="text-xs text-slate-500">${a(e.cost)} ${e.unit}</p>
                  </div>
                  <input type="number" min="0" step="1" data-adder="${e.id}" value="${s.adders[e.id]}"
                    class="w-full sm:w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
              `).join(``)}
            </div>`):``}
  `}function h(e,n,r,i,s){let c=n.baseRates[r.rateId],l=t.locationFactors[r.location],u=(n.adders??[]).reduce((e,t)=>e+t.cost*(r.adders[t.id]??0),0),d=l.factor*r.material*r.complexity*r.site;e.innerHTML=`
    <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 lg:p-8 lg:sticky lg:top-24">
      <h2 class="text-xl font-bold text-slate-900 mb-5">Your Estimate</h2>
      <div class="text-sm text-slate-600 mb-6 space-y-1">
        <p><span class="font-semibold text-slate-800">Selected Project:</span> ${c.label}</p>
        <p>${r.sqft.toLocaleString()} SF · ${l.name}</p>
      </div>
      <div class="space-y-3 mb-6">
        <div class="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
          <div class="text-xs uppercase tracking-wide text-slate-500">Budget-Conscious</div>
          <div class="text-2xl font-bold text-slate-900">${a(i.budgetLow)}</div>
          <div class="text-xs text-slate-500">Conservative estimate (×0.93)</div>
        </div>
        <div class="rounded-xl border-2 border-blue-600 bg-blue-50 p-4">
          <div class="text-xs uppercase tracking-wide text-blue-700">Most Common</div>
          <div class="text-3xl font-bold text-blue-900">${a(i.mostCommon)}</div>
          <div class="text-xs text-blue-600">Typical project outcome</div>
        </div>
        <div class="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
          <div class="text-xs uppercase tracking-wide text-slate-500">Custom/High-End</div>
          <div class="text-2xl font-bold text-slate-900">${a(i.customHigh)}</div>
          <div class="text-xs text-slate-500">Premium selections (×1.12)</div>
        </div>
      </div>
      <div class="space-y-2 border-t border-slate-200 pt-4 text-sm mb-6">
        <div class="flex justify-between text-slate-700"><span>Direct Cost (${r.sqft} SF × ${a(c.directCost)}/SF)</span><strong>${a(i.directCost)}</strong></div>
        <div class="flex justify-between text-slate-700"><span>Combined multiplier (${d.toFixed(2)}×)</span><span class="text-xs font-mono">applied</span></div>
        <div class="flex justify-between text-slate-700 border-t border-slate-100 pt-2"><span>Adjusted Direct Cost</span><strong>${a(i.adjustedDirectCost)}</strong></div>
        ${u>0?`<div class="flex justify-between text-slate-700"><span>Add-Ons</span><strong>+${a(u)}</strong></div>`:``}
        <div class="flex justify-between text-slate-700"><span>Subtotal</span><strong>${a(i.subtotalBeforeOP)}</strong></div>
        <div class="flex justify-between text-slate-700"><span>Overhead & Profit (${o(t.defaultOverheadAndProfit)})</span><strong>+${a(i.overheadAndProfitAmount)}</strong></div>
        <div class="flex justify-between border-t border-slate-300 pt-3 text-base font-bold text-slate-900"><span>Final Investment</span><span>${a(i.finalPrice)}</span></div>
      </div>
      <p class="mb-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">Planning estimate only. Actual pricing depends on site inspection, material selections, structural requirements, and scope verification.</p>
      <button type="button" data-action="toggle-details" class="mb-4 w-full rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-left font-semibold text-blue-700 hover:bg-blue-100 transition-colors text-sm">
        ${r.showDetails?`Hide`:`Show`} Detailed Math & Assumptions
      </button>
      ${r.showDetails?`<div class="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm space-y-2">
              <p class="font-bold text-slate-900">Line-by-Line Calculation</p>
              <p>1. Base: ${a(c.directCost)}/SF × ${r.sqft} SF = ${a(i.directCost)}</p>
              <p>2. Location (${l.name}): ${l.factor.toFixed(2)}×</p>
              <p>3. Materials (${r.materialKey}): ${r.material.toFixed(2)}×</p>
              <p>4. Complexity (${r.complexityKey}): ${r.complexity.toFixed(2)}×</p>
              <p>5. Site (${r.siteKey}): ${r.site.toFixed(2)}×</p>
              <p class="font-semibold pt-2 border-t border-slate-200">Adjusted: ${a(i.adjustedDirectCost)}</p>
              ${u>0?`<p>Add-ons: +${a(u)}</p>`:``}
              <p>Subtotal: ${a(i.subtotalBeforeOP)}</p>
              <p>O&P (${o(t.defaultOverheadAndProfit)}): +${a(i.overheadAndProfitAmount)}</p>
              <p class="font-bold text-blue-800">Final: ${a(i.finalPrice)}</p>
            </div>`:``}
      <div class="space-y-3 print:hidden">
        <a href="/contact.html" class="flex items-center justify-center gap-2 w-full bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors">Get Your Free On-Site Estimate</a>
        <a href="tel:+18647244600" class="flex items-center justify-center gap-2 w-full border-2 border-slate-300 hover:bg-slate-50 text-slate-800 px-6 py-3 rounded-lg font-semibold text-sm transition-colors">(864) 724-4600</a>
        <button type="button" data-action="print" class="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-sm">Save / Print This Estimate</button>
      </div>
    </div>
  `}function g(e,t){e.innerHTML=`
    <div>
      <div class="text-xs text-blue-200">Most Common Estimate</div>
      <div class="text-xl font-bold text-white">${a(t.mostCommon)}</div>
    </div>
    <a href="/contact.html" class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors">Get Free Quote</a>
  `}