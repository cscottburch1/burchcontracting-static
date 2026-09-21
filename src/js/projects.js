const filterBtns = document.querySelectorAll('[data-filter]')
const projectCards = document.querySelectorAll('[data-project-category]')
const projectCount = document.getElementById('project-count')
const lightbox = document.getElementById('lightbox')
const lightboxImg = document.getElementById('lightbox-img')
const lightboxCaption = document.getElementById('lightbox-caption')
const lightboxClose = document.getElementById('lightbox-close')

const inactiveFilterClass = 'bg-white text-slate-700 border border-slate-200 hover:border-blue-200 hover:text-blue-700'
const activeFilterClass = 'bg-blue-700 text-white border border-blue-700'

function setActiveFilter(activeBtn) {
  filterBtns.forEach((btn) => {
    const isActive = btn === activeBtn
    btn.setAttribute('aria-pressed', String(isActive))
    btn.className = `px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isActive ? activeFilterClass : inactiveFilterClass}`
  })
}

function updateGallery(filter) {
  let visible = 0
  projectCards.forEach((card) => {
    const show = filter === 'all' || card.dataset.projectCategory === filter
    card.classList.toggle('hidden', !show)
    if (show) visible += 1
  })
  if (projectCount) {
    projectCount.textContent = String(visible)
  }
}

if (filterBtns.length && projectCards.length) {
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      setActiveFilter(btn)
      updateGallery(btn.dataset.filter)
    })
  })
  updateGallery('all')
}

function openLightbox(src, alt, caption) {
  if (!lightbox || !lightboxImg || !lightboxCaption) return
  lightboxImg.src = src
  lightboxImg.alt = alt
  lightboxCaption.textContent = caption
  lightbox.classList.remove('hidden')
  lightbox.classList.add('flex')
  document.body.classList.add('overflow-hidden')
  lightboxClose?.focus()
}

function closeLightbox() {
  if (!lightbox || !lightboxImg) return
  lightbox.classList.add('hidden')
  lightbox.classList.remove('flex')
  lightboxImg.src = ''
  document.body.classList.remove('overflow-hidden')
}

document.querySelectorAll('[data-lightbox]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    openLightbox(trigger.dataset.src, trigger.dataset.alt, trigger.dataset.caption)
  })
})

lightboxClose?.addEventListener('click', closeLightbox)

lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox()
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox && !lightbox.classList.contains('hidden')) {
    closeLightbox()
  }
})