import {
  PRICING_CONFIG,
  PRICING_UPDATED,
  ADA_BATH_SHOWER_ITEMS,
  formatCurrency,
  formatPercent,
} from './calculator-config.js'

const app = document.getElementById('ada-bath-calculator-app')
if (app) initCalculator(app)

function initCalculator(root) {
  const state = {
    location: 'fountainInnArea',
    finish: 'fiberglass',
    grabBars: true,
    thermostatic: false,
    tubSize: 'standard60',
  }

  root.innerHTML = `
    <div class="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div class="space-y-6 print:hidden" id="ada-bath-inputs"></div>
      <div id="ada-bath-results"></div>
    </div>
  `

  const inputsEl = root.querySelector('#ada-bath-inputs')
  const resultsEl = root.querySelector('#ada-bath-results')

  const render = () => {
    renderInputs(inputsEl, state)
    renderResults(resultsEl, state)
  }

  root.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]')
    if (!target) return
    const { action, value } = target.dataset

    if (action === 'select-location') state.location = value
    if (action === 'select-finish') state.finish = value
    if (action === 'select-tub-size') state.tubSize = value
    if (action === 'toggle-grab-bars') state.grabBars = !state.grabBars
    if (action === 'toggle-thermostatic') state.thermostatic = !state.thermostatic
    if (action === 'toggle-details') state.showDetails = !state.showDetails
    if (action === 'print') window.print()

    render()
  })

  render()
}

function computeEstimate(state) {
  const location = PRICING_CONFIG.locationFactors[state.location]
  let directLow = 0
  let directHigh = 0
  const includedItems = []

  for (const item of ADA_BATH_SHOWER_ITEMS) {
    let low = item.low
    let high = item.high
    let included = Boolean(item.always)

    if (item.group === 'finish') {
      included = state.finish === item.groupValue
    }
    if (item.optional) {
      included = item.id === 'grabBars' ? state.grabBars : included
    }
    if (item.hasThermostatic) {
      included = true
      if (state.thermostatic) {
        low = item.high
        high = item.high
      } else {
        low = item.low
        high = item.low
      }
    }

    if (included) {
      directLow += low
      directHigh += high
      includedItems.push({ ...item, low, high })
    }
  }

  const adjustedLow = directLow * location.factor
  const adjustedHigh = directHigh * location.factor
  const finalLow = adjustedLow * (1 + PRICING_CONFIG.defaultOverheadAndProfit)
  const finalHigh = adjustedHigh * (1 + PRICING_CONFIG.defaultOverheadAndProfit)

  return {
    directLow,
    directHigh,
    finalLow,
    finalHigh,
    mostCommon: (finalLow + finalHigh) / 2,
    includedItems,
    location,
  }
}

function card(title, body) {
  return `
    <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 lg:p-7">
      <h2 class="text-xl font-bold text-slate-900 mb-5">${title}</h2>
      ${body}
    </div>
  `
}

function renderInputs(el, state) {
  const updated = new Date(PRICING_UPDATED).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  el.innerHTML = `
    <div class="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
      <strong>Pricing data updated:</strong> ${updated} — based on current Upstate SC market rates.
    </div>
    ${card(
      'Current Tub',
      `<label class="block text-sm font-semibold text-slate-700 mb-2">Tub Size</label>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        ${[
          ['standard60', 'Standard 60"'],
          ['alcove', 'Alcove'],
          ['other', 'Other / Corner'],
        ]
          .map(
            ([id, label]) => `
          <button type="button" data-action="select-tub-size" data-value="${id}"
            class="rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              state.tubSize === id
                ? 'border-blue-600 bg-blue-50 text-blue-800'
                : 'border-slate-200 text-slate-700 hover:border-blue-300'
            }">${label}</button>
        `
          )
          .join('')}
      </div>
      <p class="mt-3 text-xs text-slate-500">Non-standard tub sizes or wall configurations may affect the final quote after a site visit.</p>`
    )}
    ${card(
      'Shower Finish',
      `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button type="button" data-action="select-finish" data-value="fiberglass"
          class="rounded-xl border-2 p-4 text-left transition-all ${
            state.finish === 'fiberglass' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'
          }">
          <h3 class="font-semibold text-slate-900">Fiberglass</h3>
          <p class="mt-1 text-sm text-slate-600">One-piece ADA shower base and walls. Lower cost, faster install.</p>
        </button>
        <button type="button" data-action="select-finish" data-value="tile"
          class="rounded-xl border-2 p-4 text-left transition-all ${
            state.finish === 'tile' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'
          }">
          <h3 class="font-semibold text-slate-900">Tile Surround</h3>
          <p class="mt-1 text-sm text-slate-600">Tile-ready ADA base with 3x6" or larger tile walls. Custom look.</p>
        </button>
      </div>`
    )}
    ${card(
      'Options',
      `<div class="space-y-4">
        <label class="flex items-center justify-between gap-3 cursor-pointer">
          <span>
            <span class="block font-medium text-slate-900 text-sm">ADA Grab Bars (2-3, installed)</span>
            <span class="block text-xs text-slate-500">Recommended for every accessible conversion</span>
          </span>
          <button type="button" data-action="toggle-grab-bars" role="switch" aria-checked="${state.grabBars}"
            class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${state.grabBars ? 'bg-blue-600' : 'bg-slate-300'}">
            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${state.grabBars ? 'translate-x-6' : 'translate-x-1'}"></span>
          </button>
        </label>
        <label class="flex items-center justify-between gap-3 cursor-pointer">
          <span>
            <span class="block font-medium text-slate-900 text-sm">Thermostatic Shower Valve</span>
            <span class="block text-xs text-slate-500">Constant water temperature — recommended for accessibility</span>
          </span>
          <button type="button" data-action="toggle-thermostatic" role="switch" aria-checked="${state.thermostatic}"
            class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${state.thermostatic ? 'bg-blue-600' : 'bg-slate-300'}">
            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${state.thermostatic ? 'translate-x-6' : 'translate-x-1'}"></span>
          </button>
        </label>
      </div>`
    )}
    ${card(
      'Project Location',
      `<div class="space-y-2">
        ${Object.entries(PRICING_CONFIG.locationFactors)
          .map(
            ([id, loc]) => `
          <button type="button" data-action="select-location" data-value="${id}"
            class="w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
              state.location === id ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-700 hover:border-blue-300'
            }">
            <div class="flex items-center justify-between gap-2">
              <div>
                <span class="font-semibold">${loc.name}</span>
                <span class="ml-2 text-xs text-slate-500">(${loc.cities.join(', ')})</span>
              </div>
              <span class="font-mono text-xs font-bold">${loc.factor.toFixed(2)}×</span>
            </div>
          </button>
        `
          )
          .join('')}
      </div>`
    )}
  `
}

function renderResults(el, state) {
  const estimate = computeEstimate(state)

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
        <p><span class="font-semibold text-slate-800">ADA Bath-to-Shower Conversion</span></p>
        <p>${state.finish === 'tile' ? 'Tile Surround' : 'Fiberglass'} · ${estimate.location.name}</p>
      </div>
      <div class="space-y-3 mb-6">
        <div class="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
          <div class="text-xs uppercase tracking-wide text-slate-500">Budget-Conscious</div>
          <div class="text-2xl font-bold text-slate-900">${formatCurrency(estimate.finalLow)}</div>
        </div>
        <div class="rounded-xl border-2 border-blue-600 bg-blue-50 p-4">
          <div class="text-xs uppercase tracking-wide text-blue-700">Most Common</div>
          <div class="text-3xl font-bold text-blue-900">${formatCurrency(estimate.mostCommon)}</div>
        </div>
        <div class="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
          <div class="text-xs uppercase tracking-wide text-slate-500">Custom/High-End</div>
          <div class="text-2xl font-bold text-slate-900">${formatCurrency(estimate.finalHigh)}</div>
        </div>
      </div>
      <button type="button" data-action="toggle-details" class="mb-4 w-full rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-left font-semibold text-blue-700 hover:bg-blue-100 transition-colors text-sm">
        ${state.showDetails ? 'Hide' : 'Show'} Itemized Breakdown
      </button>
      ${
        state.showDetails
          ? `<div class="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm space-y-2">
              ${estimate.includedItems
                .map(
                  (item) => `<div class="flex justify-between gap-3"><span>${item.label}</span><strong>${formatCurrency(item.low)}${item.low !== item.high ? `–${formatCurrency(item.high)}` : ''}</strong></div>`
                )
                .join('')}
              <div class="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900"><span>Direct Cost</span><span>${formatCurrency(estimate.directLow)}–${formatCurrency(estimate.directHigh)}</span></div>
              <div class="flex justify-between text-slate-700"><span>Location Factor (${estimate.location.name})</span><span class="font-mono text-xs">${estimate.location.factor.toFixed(2)}×</span></div>
              <div class="flex justify-between text-slate-700"><span>Overhead &amp; Profit</span><span>+${formatPercent(PRICING_CONFIG.defaultOverheadAndProfit)}</span></div>
            </div>`
          : ''
      }
      <p class="mb-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">Prices are estimates for Upstate SC in 2026. Final quote after a free site visit, once tub size, plumbing access, and wall condition are confirmed.</p>
      <div class="space-y-3 print:hidden">
        <a href="/contact.html" class="flex items-center justify-center gap-2 w-full bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors">Get Your Free On-Site Consultation</a>
        <a href="tel:+18647244600" class="flex items-center justify-center gap-2 w-full border-2 border-slate-300 hover:bg-slate-50 text-slate-800 px-6 py-3 rounded-lg font-semibold text-sm transition-colors">(864) 724-4600</a>
        <button type="button" data-action="print" class="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-sm">Save / Print This Estimate</button>
      </div>
    </div>
  `
}
