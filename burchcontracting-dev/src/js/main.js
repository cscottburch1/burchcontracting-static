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

// Contact form — local PHP endpoint with reCAPTCHA v3
const form = document.getElementById('contact-form')
if (form) {
  const statusEl = document.getElementById('form-status')
  const submitBtn = document.getElementById('submit-btn')
  const fileInput = document.getElementById('file-upload')
  const fileList = document.getElementById('file-list')
  const defaultBtnText = submitBtn?.textContent ?? 'Submit Request'
  const MAX_FILE_SIZE = 10 * 1024 * 1024

  const recaptchaSiteKey =
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
    form.dataset.recaptchaSiteKey ||
    ''
  const endpoint = form.dataset.contactEndpoint || '/api/contact.php'

  const loadRecaptcha = () =>
    new Promise((resolve, reject) => {
      if (!recaptchaSiteKey) {
        resolve()
        return
      }
      if (window.grecaptcha) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('reCAPTCHA failed to load'))
      document.head.appendChild(script)
    })

  const getRecaptchaToken = async () => {
    if (!recaptchaSiteKey || !window.grecaptcha) return ''
    await new Promise((resolve) => window.grecaptcha.ready(resolve))
    return window.grecaptcha.execute(recaptchaSiteKey, { action: 'contact_form' })
  }

  const fieldRules = {
    name: (value) => (value.trim() ? '' : 'Name is required.'),
    phone: (value) => {
      const digits = value.replace(/\D/g, '')
      if (!digits) return 'Phone number is required.'
      if (digits.length < 10) return 'Enter a valid 10-digit phone number.'
      return ''
    },
    email: (value) => {
      if (!value.trim()) return 'Email is required.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.'
      return ''
    },
    address: (value) => (value.trim() ? '' : 'Street address is required.'),
    city: (value) => (value.trim() ? '' : 'City is required.'),
    state: (value) => {
      if (!value.trim()) return 'State is required.'
      if (!/^[A-Za-z]{2}$/.test(value.trim())) return 'Enter a 2-letter state code.'
      return ''
    },
    zipCode: (value) => {
      if (!value.trim()) return 'Zip code is required.'
      if (!/^\d{5}(-\d{4})?$/.test(value.trim())) return 'Enter a valid zip code.'
      return ''
    },
    projectType: (value) => (value ? '' : 'Please select a project type.'),
    description: (value) => (value.trim() ? '' : 'Project description is required.'),
  }

  const showStatus = (message, type) => {
    if (!statusEl) return
    statusEl.textContent = message
    statusEl.classList.remove('hidden', 'bg-green-50', 'border-green-200', 'text-green-800', 'bg-red-50', 'border-red-200', 'text-red-800')
    if (type === 'success') {
      statusEl.classList.add('bg-green-50', 'border', 'border-green-200', 'text-green-800')
    } else {
      statusEl.classList.add('bg-red-50', 'border', 'border-red-200', 'text-red-800')
    }
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const clearFieldErrors = () => {
    Object.keys(fieldRules).forEach((field) => {
      const errorEl = document.getElementById(`error-${field}`)
      const input = form.elements.namedItem(field)
      errorEl?.classList.add('hidden')
      if (input && 'classList' in input) {
        input.classList.remove('border-red-500', 'ring-red-500')
      }
    })
  }

  const showFieldError = (field, message) => {
    const errorEl = document.getElementById(`error-${field}`)
    const input = form.elements.namedItem(field)
    if (errorEl) {
      errorEl.textContent = message
      errorEl.classList.remove('hidden')
    }
    if (input && 'classList' in input) {
      input.classList.add('border-red-500')
      input.setAttribute('aria-invalid', 'true')
    }
  }

  const validateForm = () => {
    clearFieldErrors()
    let valid = true
    Object.entries(fieldRules).forEach(([field, rule]) => {
      const input = form.elements.namedItem(field)
      const value = input && 'value' in input ? String(input.value) : ''
      const error = rule(value)
      if (error) {
        showFieldError(field, error)
        valid = false
      }
    })
    return valid
  }

  const renderFileList = () => {
    if (!fileInput || !fileList) return
    const files = Array.from(fileInput.files ?? [])
    if (!files.length) {
      fileList.classList.add('hidden')
      fileList.innerHTML = ''
      return
    }
    fileList.classList.remove('hidden')
    fileList.innerHTML = files
      .map((file) => `<li>${file.name} (${Math.round(file.size / 1024)} KB)</li>`)
      .join('')
  }

  fileInput?.addEventListener('change', renderFileList)

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      showStatus('Please fix the highlighted fields and try again.', 'error')
      return
    }

    const honeypot = form.elements.namedItem('website')
    if (honeypot && 'value' in honeypot && honeypot.value) {
      return
    }

    if (fileInput?.files) {
      for (const file of fileInput.files) {
        if (file.size > MAX_FILE_SIZE) {
          showStatus(`"${file.name}" exceeds the 10MB limit. Please choose smaller files.`, 'error')
          return
        }
      }
    }

    if (submitBtn) {
      submitBtn.disabled = true
      submitBtn.textContent = 'Sending…'
    }

    const formData = new FormData()
    const getValue = (field) => {
      const input = form.elements.namedItem(field)
      return input && 'value' in input ? String(input.value).trim() : ''
    }

    formData.append('name', getValue('name'))
    formData.append('phone', getValue('phone'))
    formData.append('email', getValue('email'))
    formData.append('zipCode', getValue('zipCode'))
    formData.append('serviceType', getValue('projectType'))
    formData.append('budgetRange', getValue('budgetRange'))
    formData.append('timeframe', getValue('timeframe'))
    formData.append('referralSource', getValue('referralSource'))
    formData.append('description', getValue('description'))

    const fullAddress = [
      getValue('address'),
      getValue('city'),
      getValue('state'),
      getValue('zipCode'),
    ]
      .filter(Boolean)
      .join(', ')
    formData.append('address', fullAddress)

    if (fileInput?.files) {
      Array.from(fileInput.files).forEach((file, index) => {
        formData.append(`file${index}`, file, file.name)
      })
    }

    try {
      await loadRecaptcha()
      const recaptchaToken = await getRecaptchaToken()
      formData.append('recaptchaToken', recaptchaToken)

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      })

      const data = await response.json().catch(() => ({}))

      if (response.ok) {
        showStatus('Thank you! We received your request and will be in touch within one business day.', 'success')
        form.reset()
        renderFileList()
        if (submitBtn) submitBtn.textContent = 'Request Submitted'
      } else {
        const message = data.error || 'Something went wrong. Please try again or call (864) 724-4600.'
        showStatus(message, 'error')
        if (submitBtn) {
          submitBtn.disabled = false
          submitBtn.textContent = defaultBtnText
        }
      }
    } catch {
      showStatus('Network error. Please try again or call (864) 724-4600.', 'error')
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.textContent = defaultBtnText
      }
    }
  })
}