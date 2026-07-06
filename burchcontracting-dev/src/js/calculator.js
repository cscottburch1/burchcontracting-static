import {
  PRICING_CONFIG,
  PRICING_UPDATED,
  CALCULATOR_PAGES,
  getFactorLabel,
  formatCurrency,
  formatPercent,
  defaultSquareFootage,
  calculateEstimate,
} from './calculator-config.js'

const app = document.getElementById('calculator-app')
if (app) {
  const pageKey = app.dataset.page
  if (pageKey === 'estimate') {
    initCalculator(app, null, { unified: true })
  } else {
    const page = CALCULATOR_PAGES[pageKey]
    if (page) initCalculator(app, page)
  }
}

function buildServiceState(serviceKey) {
  const service = PRICING_CONFIG.services[serviceKey]
  const defaultRateId = Object.keys(service.baseRates)[0]
  const defaultSqft = defaultSquareFootage(serviceKey)

  return {
    serviceKey,
    rateId: defaultRateId,
    sqft: defaultSqft,
    sqftInput: String(defaultSqft),
    location: 'fountainInnArea',
    material: Object.values(service.materialFactors)[0],
    materialKey: Object.keys(service.materialFactors)[0],
    complexity: Object.values(service.complexityFactors)[0],
    complexityKey: Object.keys(service.complexityFactors)[0],
    site: Object.values(service.siteConditionFactors)[0],
    siteKey: Object.keys(service.siteConditionFactors)[0],
    adders: Object.fromEntries((service.adders ?? []).map((a) => [a.id, 0])),
    showDetails: false,
  }
}

function initCalculator(root, page, options = {}) {
  const unified = options.unified === true
  let state = buildServiceState(unified ? Object.values(CALCULATOR_PAGES)[0].serviceKey : page.serviceKey)

  root.innerHTML = `
    <div class="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div class="space-y-6 print:hidden" id="calc-inputs"></div>
      <div id="calc-results"></div>
    </div>
    <div class="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between bg-blue-700 px-4 py-3 shadow-lg lg:hidden print:hidden" id="calc-mobile-bar"></div>
  `

  const inputsEl = root.querySelector('#calc-inputs')
  const resultsEl = root.querySelector('#calc-results')
  const mobileBarEl = root.querySelector('#calc-mobile-bar')

  const render = () => {
    const service = PRICING_CONFIG.services[state.serviceKey]
    const sizeRange = PRICING_CONFIG.sizeRanges[state.serviceKey]
    renderInputs(inputsEl, service, sizeRange, state, page, unified)
    const estimate = computeEstimate(service, state)
    renderResults(resultsEl, service, state, estimate, page)
    renderMobileBar(mobileBarEl, estimate)
  }

  root.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]')
    if (!target) return
    const { action, value } = target.dataset
    const service = PRICING_CONFIG.services[state.serviceKey]

    if (action === 'select-service') state = buildServiceState(value)
    if (action === 'select-rate') state.rateId = value
    if (action === 'select-location') state.location = value
    if (action === 'select-material') {
      state.materialKey = value
      state.material = service.materialFactors[value]
    }
    if (action === 'select-complexity') {
      state.complexityKey = value
      state.complexity = service.complexityFactors[value]
    }
    if (action === 'select-site') {
      state.siteKey = value
      state.site = service.siteConditionFactors[value]
    }
    if (action === 'toggle-details') state.showDetails = !state.showDetails
    if (action === 'print') window.print()

    render()
  })

  root.addEventListener('input', (e) => {
    const target = e.target
    if (target.id === 'sqft-input') {
      state.sqftInput = target.value
      const parsed = Number(target.value)
      if (parsed >= 1) state.sqft = parsed
      updateResults()
    }
    if (target.dataset.adder) {
      state.adders[target.dataset.adder] = Math.max(0, Number(target.value) || 0)
      updateResults()
    }
  })

  root.addEventListener('blur', (e) => {
    if (e.target.id === 'sqft-input') {
      const parsed = Number(state.sqftInput)
      if (!state.sqftInput || parsed < 1) {
        state.sqftInput = String(state.sqft)
        e.target.value = state.sqftInput
      }
      updateResults()
    }
  }, true)

  function updateResults() {
    const service = PRICING_CONFIG.services[state.serviceKey]
    const estimate = computeEstimate(service, state)
    renderResults(resultsEl, service, state, estimate, page)
    renderMobileBar(mobileBarEl, estimate)
  }

  render()
}

function computeEstimate(service, state) {
  const rate = service.baseRates[state.rateId]
  const location = PRICING_CONFIG.locationFactors[state.location]
  const addersTotal = (service.adders ?? []).reduce((sum, adder) => {
    const qty = state.adders[adder.id] ?? 0
    return sum + adder.cost * qty
  }, 0)

  return calculateEstimate({
    squareFootage: state.sqft,
    baseDirectCost: rate.directCost,
    locationFactor: location.factor,
    materialFactor: state.material,
    complexityFactor: state.complexity,
    siteConditionFactor: state.site,
    addersTotal,
    overheadAndProfit: PRICING_CONFIG.defaultOverheadAndProfit,
    outputRanges: PRICING_CONFIG.outputRanges,
  })
}

function card(title, body) {
  return `
    <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 lg:p-7">
      <h2 class="text-xl font-bold text-slate-900 mb-5">${title}</h2>
      ${body}
    </div>
  `
}

function factorButtons(entries, selectedKey, action, service) {
  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      ${entries
        .map(([key, factor]) => `
          <button type="button" data-action="${action}" data-value="${key}"
            class="rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
              selectedKey === key
                ? 'border-blue-600 bg-blue-50 text-blue-800'
                : 'border-slate-200 text-slate-700 hover:border-blue-300'
            }">
            <div class="font-medium capitalize">${key}</div>
            <div class="text-xs text-slate-500 mt-0.5">${getFactorLabel(key)}</div>
            <div class="font-mono text-xs font-bold mt-1">${factor.toFixed(2)}×</div>
          </button>
        `)
        .join('')}
    </div>
  `
}

function howWeCalculateCard() {
  return `
    <details class="group rounded-xl border border-slate-200 bg-white p-5 open:shadow-sm">
      <summary class="font-semibold text-slate-900 cursor-pointer list-none flex items-start justify-between gap-4">
        <span>How We Calculate Your Estimate</span>
        <span class="text-blue-700 text-lg leading-none group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
      </summary>
      <div class="mt-4 space-y-3 text-sm text-slate-600 leading-relaxed">
        <p><strong class="text-slate-800">Direct cost</strong> — labor and materials for your project size, including typical waste and overage, based on current Upstate SC supplier and subcontractor pricing.</p>
        <p><strong class="text-slate-800">Location, material, complexity &amp; site factors</strong> — adjust the direct cost for exactly where you are, the finish level you choose, how complex the design is, and your site's conditions.</p>
        <p><strong class="text-slate-800">Overhead &amp; profit (${formatPercent(PRICING_CONFIG.defaultOverheadAndProfit)})</strong> — covers project supervision, scheduling, warranty coverage, insurance, and standard business overhead, not just markup.</p>
        <p>This is a planning estimate only. Your final price is confirmed after a free on-site visit, once we've verified scope, permits, and site-specific factors.</p>
      </div>
    </details>
  `
}

function servicePickerCard(state) {
  const options = Object.values(CALCULATOR_PAGES)
  return card(
    'What Are You Planning to Build?',
    `<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      ${options
        .map(
          (opt) => `
        <button type="button" data-action="select-service" data-value="${opt.serviceKey}"
          class="rounded-xl border-2 p-4 text-center transition-all ${
            state.serviceKey === opt.serviceKey
              ? 'border-blue-600 bg-blue-50 text-blue-900'
              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
          }">
          <div class="font-semibold text-sm">${opt.title.replace(' Cost Calculator', '')}</div>
        </button>
      `
        )
        .join('')}
    </div>`
  )
}

function renderInputs(el, service, sizeRange, state, page, unified = false) {
  const rates = Object.entries(service.baseRates)
  const updated = new Date(PRICING_UPDATED).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  el.innerHTML = `
    ${unified ? servicePickerCard(state) : ''}
    <div class="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
      <strong>Pricing data updated:</strong> ${updated} — based on current Upstate SC market rates (BLS labor data plus local supplier and subcontractor pricing).
    </div>
    <div class="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 leading-relaxed">
      <h2 class="font-bold text-base mb-2">Budget Planning Tool</h2>
      This calculator uses local market pricing with transparent ${formatPercent(PRICING_CONFIG.defaultOverheadAndProfit)} overhead and profit. Final pricing depends on site conditions, materials, permits, and scope verification.
    </div>
    ${howWeCalculateCard()}
    ${card(
      'Choose Your Project Type',
      `<div class="space-y-3">
        ${rates
          .map(([id, rate]) => `
            <button type="button" data-action="select-rate" data-value="${id}"
              class="w-full rounded-xl border-2 p-4 text-left transition-all ${
                state.rateId === id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="font-semibold text-slate-900">${rate.label}</h3>
                  <p class="mt-1 text-sm text-slate-600">${rate.description}</p>
                </div>
                <div class="text-right shrink-0">
                  <div class="text-xs uppercase tracking-wide text-slate-500">Base rate</div>
                  <div class="text-lg font-bold text-slate-900">${formatCurrency(rate.directCost)}</div>
                  <div class="text-xs text-slate-500">per SF</div>
                </div>
              </div>
            </button>
          `)
          .join('')}
      </div>`
    )}
    ${card(
      'Size & Location',
      `
        <label for="sqft-input" class="block text-sm font-semibold text-slate-700 mb-1">Project Size (square feet)</label>
        <p class="text-xs text-slate-500 mb-2">Typical range: ${sizeRange.min.toLocaleString()}–${sizeRange.max.toLocaleString()} SF</p>
        <input type="number" id="sqft-input" min="1" step="1" value="${state.sqftInput}"
          class="mb-5 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600" />
        <label class="block text-sm font-semibold text-slate-700 mb-2">Project Location</label>
        <div class="space-y-2">
          ${Object.entries(PRICING_CONFIG.locationFactors)
            .map(([id, loc]) => `
              <button type="button" data-action="select-location" data-value="${id}"
                class="w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  state.location === id
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-slate-200 text-slate-700 hover:border-blue-300'
                }">
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <span class="font-semibold">${loc.name}</span>
                    <span class="ml-2 text-xs text-slate-500">(${loc.cities.join(', ')})</span>
                  </div>
                  <span class="font-mono text-xs font-bold">${loc.factor.toFixed(2)}×</span>
                </div>
              </button>
            `)
            .join('')}
        </div>
      `
    )}
    ${card(
      'Project Factors',
      `
        <div class="mb-5">
          <label class="block text-sm font-semibold text-slate-700 mb-2">Material Level</label>
          ${factorButtons(Object.entries(service.materialFactors), state.materialKey, 'select-material')}
        </div>
        <div class="mb-5">
          <label class="block text-sm font-semibold text-slate-700 mb-2">Project Complexity</label>
          ${factorButtons(Object.entries(service.complexityFactors), state.complexityKey, 'select-complexity')}
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Site Conditions</label>
          ${factorButtons(Object.entries(service.siteConditionFactors), state.siteKey, 'select-site')}
        </div>
      `
    )}
    ${
      service.adders?.length
        ? card(
            'Optional Add-Ons',
            `<div class="space-y-4">
              ${service.adders
                .map(
                  (adder) => `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p class="font-medium text-slate-900 text-sm">${adder.label}</p>
                    <p class="text-xs text-slate-500">${formatCurrency(adder.cost)} ${adder.unit}</p>
                  </div>
                  <input type="number" min="0" step="1" data-adder="${adder.id}" value="${state.adders[adder.id]}"
                    class="w-full sm:w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
              `
                )
                .join('')}
            </div>`
          )
        : ''
    }
  `
}

function renderResults(el, service, state, estimate, page) {
  const rate = service.baseRates[state.rateId]
  const location = PRICING_CONFIG.locationFactors[state.location]
  const addersTotal = (service.adders ?? []).reduce((sum, adder) => {
    return sum + adder.cost * (state.adders[adder.id] ?? 0)
  }, 0)
  const combined = location.factor * state.material * state.complexity * state.site

  el.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 lg:p-8 lg:sticky lg:top-24">
      <div class="hidden print:flex items-center justify-between gap-4 border-b-2 border-slate-900 pb-4 mb-6">
        <img src="/images/burch-contracting-logo.webp" alt="Burch Contracting" class="h-14 w-auto" />
        <div class="text-right text-xs text-slate-700 leading-relaxed">
          <p class="font-bold text-sm text-slate-900">Burch Contracting</p>
          <p>1095 Water Tank Rd, Gray Court, SC 29645</p>
          <p>(864) 724-4600 &middot; estimates@burchcontracting.com</p>
          <p>SC License #CLG118679</p>
        </div>
      </div>
      <h2 class="text-xl font-bold text-slate-900 mb-5">Your Estimate</h2>
      <div class="text-sm text-slate-600 mb-6 space-y-1">
        <p><span class="font-semibold text-slate-800">Selected Project:</span> ${rate.label}</p>
        <p>${state.sqft.toLocaleString()} SF · ${location.name}</p>
      </div>
      <div class="space-y-3 mb-6">
        <div class="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
          <div class="text-xs uppercase tracking-wide text-slate-500">Budget-Conscious</div>
          <div class="text-2xl font-bold text-slate-900">${formatCurrency(estimate.budgetLow)}</div>
          <div class="text-xs text-slate-500">Conservative estimate (×0.93)</div>
        </div>
        <div class="rounded-xl border-2 border-blue-600 bg-blue-50 p-4">
          <div class="text-xs uppercase tracking-wide text-blue-700">Most Common</div>
          <div class="text-3xl font-bold text-blue-900">${formatCurrency(estimate.mostCommon)}</div>
          <div class="text-xs text-blue-600">Typical project outcome</div>
        </div>
        <div class="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
          <div class="text-xs uppercase tracking-wide text-slate-500">Custom/High-End</div>
          <div class="text-2xl font-bold text-slate-900">${formatCurrency(estimate.customHigh)}</div>
          <div class="text-xs text-slate-500">Premium selections (×1.12)</div>
        </div>
      </div>
      <div class="space-y-2 border-t border-slate-200 pt-4 text-sm mb-6">
        <div class="flex justify-between text-slate-700"><span>Direct Cost (${state.sqft} SF × ${formatCurrency(rate.directCost)}/SF)</span><strong>${formatCurrency(estimate.directCost)}</strong></div>
        <div class="flex justify-between text-slate-700"><span>Combined multiplier (${combined.toFixed(2)}×)</span><span class="text-xs font-mono">applied</span></div>
        <div class="flex justify-between text-slate-700 border-t border-slate-100 pt-2"><span>Adjusted Direct Cost</span><strong>${formatCurrency(estimate.adjustedDirectCost)}</strong></div>
        ${addersTotal > 0 ? `<div class="flex justify-between text-slate-700"><span>Add-Ons</span><strong>+${formatCurrency(addersTotal)}</strong></div>` : ''}
        <div class="flex justify-between text-slate-700"><span>Subtotal</span><strong>${formatCurrency(estimate.subtotalBeforeOP)}</strong></div>
        <div class="flex justify-between text-slate-700"><span>Overhead & Profit (${formatPercent(PRICING_CONFIG.defaultOverheadAndProfit)})</span><strong>+${formatCurrency(estimate.overheadAndProfitAmount)}</strong></div>
        <div class="flex justify-between border-t border-slate-300 pt-3 text-base font-bold text-slate-900"><span>Final Investment</span><span>${formatCurrency(estimate.finalPrice)}</span></div>
      </div>
      <p class="mb-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">Planning estimate only. Actual pricing depends on site inspection, material selections, structural requirements, and scope verification.</p>
      <button type="button" data-action="toggle-details" class="mb-4 w-full rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-left font-semibold text-blue-700 hover:bg-blue-100 transition-colors text-sm">
        ${state.showDetails ? 'Hide' : 'Show'} Detailed Math & Assumptions
      </button>
      ${
        state.showDetails
          ? `<div class="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm space-y-2">
              <p class="font-bold text-slate-900">Line-by-Line Calculation</p>
              <p>1. Base: ${formatCurrency(rate.directCost)}/SF × ${state.sqft} SF = ${formatCurrency(estimate.directCost)}</p>
              <p>2. Location (${location.name}): ${location.factor.toFixed(2)}×</p>
              <p>3. Materials (${state.materialKey}): ${state.material.toFixed(2)}×</p>
              <p>4. Complexity (${state.complexityKey}): ${state.complexity.toFixed(2)}×</p>
              <p>5. Site (${state.siteKey}): ${state.site.toFixed(2)}×</p>
              <p class="font-semibold pt-2 border-t border-slate-200">Adjusted: ${formatCurrency(estimate.adjustedDirectCost)}</p>
              ${addersTotal > 0 ? `<p>Add-ons: +${formatCurrency(addersTotal)}</p>` : ''}
              <p>Subtotal: ${formatCurrency(estimate.subtotalBeforeOP)}</p>
              <p>O&P (${formatPercent(PRICING_CONFIG.defaultOverheadAndProfit)}): +${formatCurrency(estimate.overheadAndProfitAmount)}</p>
              <p class="font-bold text-blue-800">Final: ${formatCurrency(estimate.finalPrice)}</p>
            </div>`
          : ''
      }
      <div class="space-y-3 print:hidden">
        <a href="/contact.html" class="flex items-center justify-center gap-2 w-full bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors">Get Your Free On-Site Consultation</a>
        <a href="tel:+18647244600" class="flex items-center justify-center gap-2 w-full border-2 border-slate-300 hover:bg-slate-50 text-slate-800 px-6 py-3 rounded-lg font-semibold text-sm transition-colors">(864) 724-4600</a>
        <button type="button" data-action="print" class="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-sm">Save / Print This Estimate</button>
      </div>
    </div>
  `
}

function renderMobileBar(el, estimate) {
  el.innerHTML = `
    <div>
      <div class="text-xs text-blue-200">Most Common Estimate</div>
      <div class="text-xl font-bold text-white">${formatCurrency(estimate.mostCommon)}</div>
    </div>
    <a href="/contact.html" class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors">Get Free Quote</a>
  `
}