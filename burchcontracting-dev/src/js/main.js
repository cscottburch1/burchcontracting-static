// Mobile menu toggle
const menuBtn = document.getElementById('menu-btn')
const mobileMenu = document.getElementById('mobile-menu')
const iconOpen = document.getElementById('icon-open')
const iconClose = document.getElementById('icon-close')

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden')
    mobileMenu.classList.toggle('hidden')
    menuBtn.setAttribute('aria-expanded', String(!isOpen))
    iconOpen?.classList.toggle('hidden', !isOpen)
    iconClose?.classList.toggle('hidden', isOpen)
  })
}

// Testimonials carousel
const testimonialsTrack = document.getElementById('testimonials-track')
const testimonialsPrev = document.getElementById('testimonials-prev')
const testimonialsNext = document.getElementById('testimonials-next')

if (testimonialsTrack && testimonialsPrev && testimonialsNext) {
  const scrollAmount = () => testimonialsTrack.clientWidth * 0.85
  testimonialsPrev.addEventListener('click', () => {
    testimonialsTrack.scrollBy({ left: -scrollAmount(), behavior: 'smooth' })
  })
  testimonialsNext.addEventListener('click', () => {
    testimonialsTrack.scrollBy({ left: scrollAmount(), behavior: 'smooth' })
  })
}

// Contact form — wire up to Netlify Forms, Formspree, etc. before going live
const form = document.getElementById('contact-form')
if (form) {
  const statusEl = document.getElementById('form-status')
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const btn = form.querySelector('[type="submit"]')
    btn.disabled = true
    btn.textContent = 'Sending…'
    // TODO: replace with real form submission (Netlify Forms, Formspree, etc.)
    setTimeout(() => {
      if (statusEl) {
        statusEl.textContent = 'Thank you! We\'ll be in touch within one business day.'
        statusEl.classList.remove('hidden')
      }
      btn.textContent = 'Message Sent'
      form.reset()
    }, 600)
  })
}
