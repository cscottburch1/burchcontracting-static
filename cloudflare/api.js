/**
 * Contact form and leads admin for burchcontracting.com on Cloudflare Workers
 * + D1. Replaces public/api/contact.php and public/api/admin/*.php;
 * cloudflare/worker.js sends every /api/* request here.
 *
 * Routes. The .php forms keep the live form (contact.html posts to
 * /api/contact.php) and old admin bookmarks working.
 *   POST     /api/contact, /api/contact.php          — contact form submission
 *   GET      /api/admin, /api/admin/index.php        — leads list
 *   GET/POST /api/admin/lead/:id (lead.php?id= 302s) — lead detail, status, notes
 *   GET/POST /api/admin/login, /api/admin/login.php  — login
 *   GET      /api/admin/logout, /api/admin/logout.php
 *
 * Secrets (`npx wrangler secret put NAME` — never in code):
 *   RESEND_API_KEY       — Resend API key. burchcontracting.com must be a
 *                          verified sending domain in Resend.
 *   RECAPTCHA_SECRET_KEY — reCAPTCHA v3 secret. Without it the spam check is
 *                          skipped, exactly as contact.php did.
 *   ADMIN_USERNAME       — admin login username
 *   ADMIN_PASSWORD_HASH  — output of `node scripts/generate-admin-hash.mjs <password>`
 *   SESSION_SECRET       — random 32+ characters that sign the session cookie.
 *                          Changing it logs every session out.
 *
 * Bindings (wrangler.jsonc):
 *   DB            — D1 database, schema in cloudflare/schema.sql
 *   LOGIN_LIMITER — rate limit on login attempts per IP
 */

// ─── Email ───────────────────────────────────────────────────────────────────

const TO_EMAILS = ['scott@burchcontracting.com', 'estimates@burchcontracting.com']
const FROM_EMAIL = 'noreply@burchcontracting.com'
const FROM_NAME = 'Burch Contracting'

async function sendEmail(resendApiKey, { to, replyTo, subject, text, html, attachments }) {
  if (!resendApiKey) throw new Error('RESEND_API_KEY is not set')

  const body = {
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: Array.isArray(to) ? to : [to],
    subject,
  }
  if (replyTo) body.reply_to = replyTo
  if (html) body.html = html
  if (text) body.text = text
  if (attachments?.length) body.attachments = attachments

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error ${res.status}: ${err}`)
  }
  return res.json()
}

function buildLeadEmailText(data) {
  return [
    'New contact form submission',
    '',
    `Name:           ${data.name}`,
    `Phone:          ${data.phone}`,
    `Email:          ${data.email}`,
    `Address:        ${data.address || 'N/A'}`,
    `Zip Code:       ${data.zipCode || 'N/A'}`,
    `Project Type:   ${data.projectType}`,
    `Budget:         ${data.budgetRange}`,
    `Timeframe:      ${data.timeframe}`,
    `Referral:       ${data.referralSource}`,
    '',
    'Description:',
    data.description,
    '',
    `Attachments: ${data.attachmentCount > 0 ? data.attachmentCount + ' file(s)' : 'None'}`,
  ].join('\n')
}

function buildConfirmationEmailHtml(firstName, projectLabel) {
  const project = projectLabel && projectLabel !== 'N/A' ? projectLabel : 'home remodeling'
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Thank You - Burch Contracting</title></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f4;padding:20px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
        <tr><td style="background-color:#003087;padding:25px 40px;text-align:center;">
          <p style="margin:0;color:white;font-size:22px;font-weight:bold;">Burch Contracting</p>
          <p style="margin:15px 0 0;color:white;font-size:16px;opacity:0.95;">Upstate SC Additions, Garages &amp; Outdoor Living Since 1995</p>
        </td></tr>
        <tr><td style="padding:40px;color:#333333;line-height:1.6;font-size:16px;">
          <p>Dear ${escHtml(firstName)},</p>
          <p>Thank you for submitting your project inquiry to <strong>Burch Contracting</strong>.</p>
          <p>We've received your details and appreciate the opportunity to help with your <strong>${escHtml(project)}</strong> project. Scott Burch and our team have proudly served Upstate South Carolina homeowners since 1995 with quality craftsmanship and no shortcuts.</p>
          <h3 style="color:#003087;margin-bottom:10px;">What Happens Next:</h3>
          <ol style="padding-left:20px;margin-top:0;">
            <li>We review your submission today.</li>
            <li>We'll contact you to schedule a convenient, no-obligation site visit. We typically reply within 1-2 business days.</li>
            <li>You'll receive a free, no-obligation consultation. If you want a detailed written estimate, concept drawings, or floor plans? Those are available for a fee — fully credited toward your project if you hire us.</li>
          </ol>
          <p>If you have project photos, drawings, or additional notes, simply reply to this email or call us directly at <a href="tel:8647244600" style="color:#003087;">(864) 724-4600</a>.</p>
          <p>We're looking forward to working with you!</p>
          <p style="margin-top:30px;">Best regards,<br><strong>Scott Burch</strong><br>Owner &amp; Lead Contractor</p>
        </td></tr>
        <tr><td style="background-color:#f8f8f8;padding:30px 40px;border-top:1px solid #eeeeee;font-size:14px;color:#555555;line-height:1.5;">
          <p style="margin:0 0 10px;"><strong>Burch Contracting</strong><br>SC Licensed General Contractor #CLG118679 | NC Licensed (Limited) #107292 • Fully Insured • BBB A+ Rated<br>1095 Water Tank Rd, Gray Court, SC 29645</p>
          <p style="margin:10px 0;"><a href="tel:8647244600" style="color:#003087;">(864) 724-4600</a> | <a href="mailto:estimates@burchcontracting.com" style="color:#003087;">estimates@burchcontracting.com</a></p>
          <p style="margin:10px 0 0;"><a href="https://burchcontracting.com" style="color:#003087;">burchcontracting.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Labels ───────────────────────────────────────────────────────────────────

const PROJECT_LABELS = {
  'garage': 'Garage',
  'addition': 'Home Addition',
  'deck': 'Deck',
  'screened-porch': 'Screened Porch',
  'covered-patio': 'Covered Patio',
  'remodeling': 'Remodeling',
  'commercial': 'Commercial Upfit',
  'other': 'Other / Not Sure',
}
const BUDGET_LABELS = {
  'under-10k': 'Under $10,000',
  '10k-25k': '$10,000 – $25,000',
  '25k-50k': '$25,000 – $50,000',
  '50k-100k': '$50,000 – $100,000',
  'over-100k': 'Over $100,000',
  'not-sure': 'Not Sure Yet',
}
const TIMEFRAME_LABELS = {
  'asap': 'As soon as possible',
  '1-3months': 'Within 1–3 months',
  '3-6months': '3–6 months',
  '6-12months': '6–12 months',
  'flexible': 'Flexible / Planning ahead',
}
const REFERRAL_LABELS = {
  'google': 'Google Search',
  'referral': 'Friend or Family Referral',
  'neighbor': 'Saw Work in Neighborhood',
  'repeat': 'Previous Customer',
  'facebook': 'Facebook',
  'nextdoor': 'Nextdoor',
  'other': 'Other',
}

function label(map, value) {
  return map[value] ?? (value || 'N/A')
}

// ─── Attachments ─────────────────────────────────────────────────────────────

// Same limits as contact.php, plus a total: Resend rejects an email over 40MB
// once attachments are base64-encoded (a third larger).
const MAX_FILES = 10
const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_TOTAL_ATTACHMENT_SIZE = 25 * 1024 * 1024
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

/** Resend attachments from the form's file fields; throws a visitor-facing message. */
async function collectAttachments(form) {
  const attachments = []
  let totalSize = 0

  for (const value of form.values()) {
    if (typeof value === 'string' || value.size === 0) continue
    if (attachments.length >= MAX_FILES) throw new Error('Too many files. Please upload up to 10 files.')
    if (value.size > MAX_FILE_SIZE) throw new Error('Each file must be 10MB or smaller.')
    if (value.type && !ALLOWED_FILE_TYPES.includes(value.type)) {
      throw new Error('Unsupported file type. Use images, PDF, or Word documents.')
    }
    totalSize += value.size
    if (totalSize > MAX_TOTAL_ATTACHMENT_SIZE) {
      throw new Error('Files must total 25MB or less. You can send more by replying to our confirmation email.')
    }
    attachments.push({ filename: value.name || 'attachment', content: toBase64(await value.arrayBuffer()) })
  }

  return attachments
}

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  // Chunked: spreading a multi-megabyte array into one call overflows the stack.
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

// ─── reCAPTCHA ────────────────────────────────────────────────────────────────

async function verifyRecaptcha(secret, token, action, minScore = 0.5) {
  if (!secret) return null
  if (!token) return 'Security verification failed. Please refresh and try again.'

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    })
    const data = await res.json()

    if (!data.success) return 'Security verification failed. Please try again.'
    if (data.action !== action) return 'Security verification failed. Please try again.'
    if ((data.score ?? 0) < minScore) return 'Spam detection triggered. Please try again.'
    return null
  } catch {
    return 'Security verification failed. Please try again.'
  }
}

// ─── Session (signed cookie, no storage) ────────────────────────────────────

const SESSION_COOKIE = 'bc_admin_session'
const SESSION_MAX_AGE = 7 * 86400

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

function parseCookies(req) {
  const cookies = {}
  for (const part of (req.headers.get('Cookie') || '').split(';')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    try {
      cookies[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim())
    } catch {
      // Another cookie on the domain with a malformed value — not ours.
    }
  }
  return cookies
}

/**
 * The session is valid only with a correct signature and an unexpired `exp`.
 * The expiry lives inside the signed value, so a copied cookie stops working
 * after SESSION_MAX_AGE even if the browser keeps sending it.
 */
async function getSession(req, secret) {
  const raw = parseCookies(req)[SESSION_COOKIE]
  if (!raw) return null
  const dot = raw.lastIndexOf('.')
  if (dot === -1) return null
  const value = raw.slice(0, dot)
  if (!timingSafeEqual(raw.slice(dot + 1), await hmac(secret, value))) return null
  try {
    const session = JSON.parse(atob(value))
    return session.exp > Date.now() ? session : null
  } catch {
    return null
  }
}

async function makeSessionCookie(secret) {
  const value = btoa(JSON.stringify({ exp: Date.now() + SESSION_MAX_AGE * 1000 }))
  const signed = `${value}.${await hmac(secret, value)}`
  return `${SESSION_COOKIE}=${encodeURIComponent(signed)}; Path=/api/admin; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/api/admin; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

// ADMIN_PASSWORD_HASH is sha256hex(password + ':burch'), made by
// scripts/generate-admin-hash.mjs. Guessing is throttled by LOGIN_LIMITER.
async function verifyPassword(password, hash) {
  const msgBuffer = new TextEncoder().encode(password + ':burch')
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
  return timingSafeEqual(hashHex, hash)
}

function timingSafeEqual(a, b) {
  a = String(a ?? '')
  b = String(b ?? '')
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return result === 0
}

/**
 * Login attempts are counted per IP by the LOGIN_LIMITER binding. A counter
 * kept in the visitor's own cookie would not work: an attacker simply sends
 * no cookie.
 */
async function loginAllowed(req, env) {
  if (!env.LOGIN_LIMITER) return true
  const { success } = await env.LOGIN_LIMITER.limit({ key: req.headers.get('CF-Connecting-IP') || 'unknown' })
  return success
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

const CSS = `* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; background: #f8fafc; color: #1e293b; }
header.top { background: #1d4ed8; color: #fff; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
header.top a { color: #fff; text-decoration: none; font-weight: 600; }
header.top nav a { margin-left: 16px; font-weight: 500; opacity: 0.9; }
header.top nav a:hover { opacity: 1; text-decoration: underline; }
main { max-width: 1100px; margin: 0 auto; padding: 24px; }
h1 { font-size: 22px; margin: 0 0 20px; } h2 { font-size: 17px; margin: 0 0 12px; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 20px; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
th { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.03em; }
tr:hover td { background: #f8fafc; } a { color: #1d4ed8; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
.badge-new { background: #dbeafe; color: #1e40af; } .badge-contacted { background: #fef3c7; color: #92400e; }
.badge-quoted { background: #ede9fe; color: #5b21b6; } .badge-won { background: #dcfce7; color: #166534; }
.badge-lost { background: #f1f5f9; color: #64748b; }
.filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.filters a { padding: 6px 14px; border-radius: 999px; border: 1px solid #e2e8f0; text-decoration: none; font-size: 13px; color: #475569; }
.filters a.active { background: #1d4ed8; color: #fff; border-color: #1d4ed8; }
input[type="text"], input[type="password"], select, textarea { width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-family: inherit; }
label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 5px; color: #334155; }
.field { margin-bottom: 14px; }
button, .btn { background: #1d4ed8; color: #fff; border: none; padding: 9px 18px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; text-decoration: none; }
button:hover, .btn:hover { background: #1e40af; }
.btn-secondary { background: #fff; color: #334155; border: 1px solid #cbd5e1; }
.btn-secondary:hover { background: #f1f5f9; }
.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; font-size: 14px; }
.success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; font-size: 14px; }
.meta { color: #64748b; font-size: 13px; }
.activity { border-left: 2px solid #e2e8f0; padding-left: 14px; margin-top: 16px; }
.activity-item { margin-bottom: 14px; } .activity-item .meta { margin-bottom: 2px; }
.login-wrap { max-width: 360px; margin: 80px auto; }
.pagination { margin-top: 16px; display: flex; gap: 8px; }`

function page(title, body, status = 200) {
  return new Response(`<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>${escHtml(title)} | Burch Contracting Admin</title>
<style>${CSS}</style>
</head>
<body>${body}</body>
</html>`, {
    status,
    // Lead names, phones and emails: never stored by a browser or proxy cache.
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  })
}

function adminHeader() {
  return `<header class="top">
  <a href="/api/admin">Burch Contracting — Leads</a>
  <nav><a href="/api/admin/logout">Log Out</a></nav>
</header>`
}

function redirect(url, headers = {}) {
  return new Response(null, { status: 302, headers: { Location: url, 'Cache-Control': 'no-store', ...headers } })
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

function text(body, status) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })
}

function qs(current, overrides) {
  const params = new URLSearchParams(current)
  for (const [k, v] of Object.entries(overrides)) {
    if (v === null || v === undefined || v === '') params.delete(k)
    else params.set(k, String(v))
  }
  const str = params.toString()
  return str ? '?' + str : ''
}

// D1's datetime('now') is "YYYY-MM-DD HH:MM:SS" in UTC. Shown in Upstate SC time.
const TIME_ZONE = 'America/New_York'

function parseDbDate(value) {
  return new Date(String(value).replace(' ', 'T') + 'Z')
}

function formatDate(value) {
  if (!value) return 'N/A'
  return parseDbDate(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: TIME_ZONE })
}

function formatDateTime(value) {
  if (!value) return 'N/A'
  const d = parseDbDate(value)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: TIME_ZONE }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TIME_ZONE })
}

// ─── Route handlers ───────────────────────────────────────────────────────────

// POST /api/contact
async function handleContact(req, env) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let form
  try {
    form = await req.formData()
  } catch {
    return json({ error: 'Invalid submission' }, 400)
  }
  const field = (name) => {
    const value = form.get(name)
    return typeof value === 'string' ? value.trim() : ''
  }

  // Honeypot
  if (field('website')) return json({ error: 'Invalid submission' }, 400)

  const name = field('name')
  const phone = field('phone')
  const email = field('email')
  const zipCode = field('zipCode')
  const serviceType = field('serviceType') || field('projectType')
  const description = field('description')

  if (!name || !phone || !email || !description) return json({ error: 'Missing required fields' }, 400)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Enter a valid email address' }, 400)

  const recaptchaError = await verifyRecaptcha(env.RECAPTCHA_SECRET_KEY, field('recaptchaToken'), 'contact_form')
  if (recaptchaError) return json({ error: recaptchaError }, 400)

  let attachments
  try {
    attachments = await collectAttachments(form)
  } catch (err) {
    return json({ error: err.message }, 400)
  }

  const address = [field('address'), field('city'), field('state'), zipCode].filter(Boolean).join(', ')
  const projectType = label(PROJECT_LABELS, serviceType)
  const submission = {
    name, phone, email, address, zipCode,
    projectType,
    budgetRange: label(BUDGET_LABELS, field('budgetRange')),
    timeframe: label(TIMEFRAME_LABELS, field('timeframe')),
    referralSource: label(REFERRAL_LABELS, field('referralSource')),
    description,
    attachmentCount: attachments.length,
  }

  const subject = `New Estimate Request: ${name.replace(/[\r\n]+/g, ' ')}${projectType !== 'N/A' ? ' - ' + projectType : ''}`
  const [saved, notified] = await Promise.allSettled([
    env.DB.prepare(
      `INSERT INTO leads (name, phone, email, address, zip_code, service_type, budget_range, timeframe, referral_source, description, attachment_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      submission.name, submission.phone, submission.email,
      submission.address || null, submission.zipCode || null,
      submission.projectType, submission.budgetRange,
      submission.timeframe, submission.referralSource,
      submission.description, submission.attachmentCount
    ).run(),
    sendEmail(env.RESEND_API_KEY, {
      to: TO_EMAILS,
      replyTo: email,
      subject,
      text: buildLeadEmailText(submission),
      attachments,
    }),
  ])
  if (saved.status === 'rejected') console.error('[contact] D1 insert failed:', saved.reason?.message)
  if (notified.status === 'rejected') console.error('[contact] Lead email failed:', notified.reason?.message)

  // contact.php always had its fallback log file. Here, a lead that reached
  // neither D1 nor the inbox is gone, so the visitor has to hear about it.
  if (saved.status === 'rejected' && notified.status === 'rejected') {
    return json({ error: 'Something went wrong sending your request. Please call (864) 724-4600.' }, 500)
  }

  try {
    await sendEmail(env.RESEND_API_KEY, {
      to: email,
      subject: 'Thank You for Contacting Burch Contracting',
      html: buildConfirmationEmailHtml(name.split(' ')[0], projectType),
    })
  } catch (err) {
    console.error('[contact] Confirmation email failed:', err.message)
  }

  return json({ success: true, message: 'Request submitted successfully', filesUploaded: attachments.length })
}

// GET/POST /api/admin/login
async function handleLogin(req, env) {
  let error = null
  let status = 200

  if (req.method === 'POST') {
    const fd = await req.formData().catch(() => null)
    const username = String(fd?.get('username') ?? '').trim()
    const password = String(fd?.get('password') ?? '')

    if (!(await loginAllowed(req, env))) {
      error = 'Too many login attempts. Wait a minute and try again.'
      status = 429
    } else {
      // Both checks always run, so response time doesn't reveal which one failed.
      const usernameOk = timingSafeEqual(username, env.ADMIN_USERNAME)
      const passwordOk = await verifyPassword(password, env.ADMIN_PASSWORD_HASH)
      if (usernameOk && passwordOk) {
        return redirect('/api/admin', { 'Set-Cookie': await makeSessionCookie(env.SESSION_SECRET) })
      }
      error = 'Invalid username or password.'
      status = 401
    }
  }

  const errorHtml = error ? `<p class="error">${escHtml(error)}</p>` : ''
  return page('Login', `<main class="login-wrap"><div class="card">
    <h1>Admin Login</h1>
    ${errorHtml}
    <form method="post" action="/api/admin/login">
      <div class="field"><label for="u">Username</label><input type="text" id="u" name="username" autocomplete="username" required autofocus></div>
      <div class="field"><label for="p">Password</label><input type="password" id="p" name="password" autocomplete="current-password" required></div>
      <button type="submit">Log In</button>
    </form>
  </div></main>`, status)
}

// GET /api/admin/logout
function handleLogout() {
  return redirect('/api/admin/login', { 'Set-Cookie': clearSessionCookie() })
}

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost']

// Columns the admin may edit by hand. created_at, id, status and
// attachment_count are deliberately excluded: status has its own form, and the
// other three are records of what actually happened, not free-text fields.
const EDITABLE_FIELDS = [
  'name', 'phone', 'email', 'address', 'zip_code',
  'service_type', 'budget_range', 'timeframe', 'referral_source', 'description',
]
// NOT NULL in schema.sql — an edit that blanks any of these is rejected.
const REQUIRED_FIELDS = ['name', 'phone', 'email', 'description']

// GET /api/admin
async function handleAdminIndex(req, env) {
  const url = new URL(req.url)
  const statusFilter = STATUSES.includes(url.searchParams.get('status')) ? url.searchParams.get('status') : ''
  const search = (url.searchParams.get('q') || '').trim()
  const page_num = Math.max(1, parseInt(url.searchParams.get('page'), 10) || 1)
  const perPage = 50
  const offset = (page_num - 1) * perPage

  const whereClauses = []
  const bindings = []
  if (statusFilter) { whereClauses.push('status = ?'); bindings.push(statusFilter) }
  if (search) { whereClauses.push('(name LIKE ? OR email LIKE ? OR phone LIKE ?)'); bindings.push(`%${search}%`, `%${search}%`, `%${search}%`) }
  const where = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : ''

  const [countResult, leadsResult, countsResult] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) as c FROM leads ${where}`).bind(...bindings).first(),
    env.DB.prepare(`SELECT id, created_at, status, name, phone, email, service_type FROM leads ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`).bind(...bindings, perPage, offset).all(),
    env.DB.prepare(`SELECT status, COUNT(*) as c FROM leads GROUP BY status`).all(),
  ])

  const total = countResult?.c ?? 0
  const leads = leadsResult.results ?? []
  const statusCounts = Object.fromEntries(STATUSES.map(s => [s, 0]))
  let totalAll = 0
  for (const row of (countsResult.results ?? [])) {
    statusCounts[row.status] = row.c
    totalAll += row.c
  }

  const filterLinks = [`<a href="/api/admin${qs(url.searchParams, { status: '', page: null })}" class="${!statusFilter ? 'active' : ''}">All (${totalAll})</a>`]
  for (const s of STATUSES) {
    filterLinks.push(`<a href="/api/admin${qs(url.searchParams, { status: s, page: null })}" class="${statusFilter === s ? 'active' : ''}">${escHtml(s.charAt(0).toUpperCase() + s.slice(1))} (${statusCounts[s]})</a>`)
  }

  const rows = leads.length === 0
    ? '<p class="meta">No leads found.</p>'
    : `<table>
        <thead><tr><th>Date</th><th>Name</th><th>Contact</th><th>Service</th><th>Status</th></tr></thead>
        <tbody>${leads.map(l => `<tr>
          <td class="meta">${escHtml(formatDate(l.created_at))}</td>
          <td><a href="/api/admin/lead/${l.id}">${escHtml(l.name)}</a></td>
          <td class="meta">${escHtml(l.phone)}<br>${escHtml(l.email)}</td>
          <td class="meta">${escHtml(l.service_type || 'N/A')}</td>
          <td><span class="badge badge-${escHtml(l.status)}">${escHtml(l.status)}</span></td>
        </tr>`).join('')}</tbody>
      </table>`

  const pagination = total > perPage ? `<div class="pagination">
    ${page_num > 1 ? `<a class="btn btn-secondary" href="/api/admin${qs(url.searchParams, { page: page_num - 1 })}">← Newer</a>` : ''}
    ${offset + perPage < total ? `<a class="btn btn-secondary" href="/api/admin${qs(url.searchParams, { page: page_num + 1 })}">Older →</a>` : ''}
  </div>` : ''

  const hiddenStatus = statusFilter ? `<input type="hidden" name="status" value="${escHtml(statusFilter)}">` : ''

  const indexNotice = SAVED_NOTICES[url.searchParams.get('saved')]

  return page('Leads', `${adminHeader()}
  <main>
    <h1>Leads <span class="meta">(${totalAll} total)</span></h1>
    ${indexNotice ? `<p class="success">${escHtml(indexNotice)}</p>` : ''}
    <div class="filters">${filterLinks.join('')}</div>
    <form method="get" action="/api/admin" style="margin-bottom:16px;display:flex;gap:8px;max-width:400px;">
      ${hiddenStatus}
      <input type="text" name="q" value="${escHtml(search)}" placeholder="Search name, email, phone">
      <button type="submit">Search</button>
    </form>
    <div class="card">${rows}</div>
    ${pagination}
  </main>`)
}

const SAVED_NOTICES = {
  status: 'Status updated.',
  note: 'Note added.',
  details: 'Lead details updated.',
  deleted: 'Lead deleted.',
}
const ERROR_NOTICES = {
  required: 'Name, phone, email and description are all required — nothing was changed.',
}

// GET/POST /api/admin/lead/:id
async function handleLead(req, env, id) {
  const lead = await env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first()
  if (!lead) return text('Lead not found.', 404)

  // Every POST redirects back, so refreshing the page can't add a note twice.
  if (req.method === 'POST') {
    const fd = await req.formData().catch(() => null)
    const action = fd?.get('action')
    let saved = ''

    if (action === 'update_status') {
      const newStatus = fd.get('status')
      if (STATUSES.includes(newStatus) && newStatus !== lead.status) {
        await env.DB.batch([
          env.DB.prepare('UPDATE leads SET status = ? WHERE id = ?').bind(newStatus, id),
          env.DB.prepare('INSERT INTO lead_activity (lead_id, note) VALUES (?, ?)').bind(id, `Status changed: ${lead.status} → ${newStatus}`),
        ])
        saved = 'status'
      }
    } else if (action === 'add_note') {
      const note = String(fd.get('note') ?? '').trim()
      if (note) {
        await env.DB.prepare('INSERT INTO lead_activity (lead_id, note) VALUES (?, ?)').bind(id, note).run()
        saved = 'note'
      }
    } else if (action === 'update_lead') {
      const next = {}
      for (const f of EDITABLE_FIELDS) next[f] = String(fd.get(f) ?? '').trim()

      if (REQUIRED_FIELDS.some(f => !next[f])) {
        return redirect(`/api/admin/lead/${id}?err=required`)
      }

      // Only write when something actually differs, so a stray submit doesn't
      // litter the activity log with empty "edited" entries.
      const changed = EDITABLE_FIELDS.filter(f => next[f] !== (lead[f] ?? ''))
      if (changed.length) {
        const assignments = EDITABLE_FIELDS.map(f => `${f} = ?`).join(', ')
        await env.DB.batch([
          env.DB.prepare(`UPDATE leads SET ${assignments} WHERE id = ?`)
            .bind(...EDITABLE_FIELDS.map(f => next[f]), id),
          env.DB.prepare('INSERT INTO lead_activity (lead_id, note) VALUES (?, ?)')
            .bind(id, `Details edited: ${changed.join(', ')}`),
        ])
        saved = 'details'
      }
    } else if (action === 'delete_lead') {
      // Activity rows are removed explicitly rather than relying on the
      // schema's ON DELETE CASCADE, which only fires when foreign key
      // enforcement is on.
      await env.DB.batch([
        env.DB.prepare('DELETE FROM lead_activity WHERE lead_id = ?').bind(id),
        env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(id),
      ])
      return redirect('/api/admin?saved=deleted')
    }

    return redirect(`/api/admin/lead/${id}${saved ? '?saved=' + saved : ''}`)
  }

  const activityResult = await env.DB.prepare('SELECT * FROM lead_activity WHERE lead_id = ? ORDER BY created_at DESC, id DESC').bind(id).all()
  const activity = activityResult.results ?? []

  function detailRow(lbl, val) {
    return `<tr><th style="width:140px;">${escHtml(lbl)}</th><td>${escHtml(val || 'N/A')}</td></tr>`
  }

  const params = new URL(req.url).searchParams
  const notice = SAVED_NOTICES[params.get('saved')]
  const errNotice = ERROR_NOTICES[params.get('err')]
  const noticeHtml = (notice ? `<p class="success">${escHtml(notice)}</p>` : '')
    + (errNotice ? `<p class="error">${escHtml(errNotice)}</p>` : '')

  const statusOptions = STATUSES.map(s =>
    `<option value="${escHtml(s)}"${s === lead.status ? ' selected' : ''}>${escHtml(s.charAt(0).toUpperCase() + s.slice(1))}</option>`
  ).join('')

  const activityHtml = activity.length === 0
    ? '<p class="meta" style="margin-top:14px;">No activity yet.</p>'
    : `<div class="activity">${activity.map(a => `<div class="activity-item">
        <div class="meta">${escHtml(formatDateTime(a.created_at))}</div>
        <div style="white-space:pre-wrap;">${escHtml(a.note)}</div>
      </div>`).join('')}</div>`

  const editInput = (name, lbl, value, type = 'text') =>
    `<div class="field"><label for="f-${name}">${escHtml(lbl)}</label>`
    + `<input type="${type}" id="f-${name}" name="${name}" value="${escHtml(value ?? '')}"></div>`

  // Two-step delete: the link re-renders this page with a confirmation card, so
  // no amount of link prefetching or a stray click can destroy a lead outright.
  const dangerHtml = params.get('confirm') === 'delete'
    ? `<div class="card" style="border-color:#fecaca;">
      <h2 style="color:#991b1b;">Delete this lead?</h2>
      <p>This permanently removes <strong>${escHtml(lead.name)}</strong>${activity.length ? ` and ${activity.length} activity note(s)` : ''}. It cannot be undone.</p>
      <form method="post" action="/api/admin/lead/${id}" style="display:flex;gap:8px;align-items:center;margin-top:12px;">
        <input type="hidden" name="action" value="delete_lead">
        <button type="submit" style="background:#dc2626;">Yes, delete permanently</button>
        <a class="btn btn-secondary" href="/api/admin/lead/${id}">Cancel</a>
      </form>
    </div>`
    : `<div class="card">
      <h2>Delete</h2>
      <p class="meta" style="margin-bottom:12px;">Removes this lead and its notes permanently. You'll be asked to confirm.</p>
      <a class="btn btn-secondary" href="/api/admin/lead/${id}?confirm=delete">Delete this lead…</a>
    </div>`

  return page(lead.name, `${adminHeader()}
  <main>
    <p><a href="/api/admin">← Back to all leads</a></p>
    <h1>${escHtml(lead.name)} <span class="badge badge-${escHtml(lead.status)}">${escHtml(lead.status)}</span></h1>
    ${noticeHtml}
    <div class="card">
      <h2>Details</h2>
      <table>
        ${detailRow('Submitted', formatDateTime(lead.created_at))}
        ${detailRow('Phone', lead.phone)}
        ${detailRow('Email', lead.email)}
        ${detailRow('Address', lead.address)}
        ${detailRow('Zip Code', lead.zip_code)}
        ${detailRow('Service Type', lead.service_type)}
        ${detailRow('Budget', lead.budget_range)}
        ${detailRow('Timeframe', lead.timeframe)}
        ${detailRow('Referral Source', lead.referral_source)}
        ${detailRow('Attachments', lead.attachment_count > 0 ? lead.attachment_count + ' file(s) — sent by email' : 'None')}
      </table>
      <h2 style="margin-top:18px;">Description</h2>
      <p style="white-space:pre-wrap;">${escHtml(lead.description)}</p>
    </div>
    <div class="card">
      <h2>Update Status</h2>
      <form method="post" action="/api/admin/lead/${id}" style="display:flex;gap:8px;align-items:flex-end;max-width:400px;">
        <input type="hidden" name="action" value="update_status">
        <div class="field" style="flex:1;margin-bottom:0;"><select name="status">${statusOptions}</select></div>
        <button type="submit">Update</button>
      </form>
    </div>
    <div class="card">
      <h2>Activity &amp; Notes</h2>
      <form method="post" action="/api/admin/lead/${id}">
        <input type="hidden" name="action" value="add_note">
        <div class="field"><textarea name="note" rows="3" placeholder="Add a note (call summary, quote sent, etc.)"></textarea></div>
        <button type="submit">Add Note</button>
      </form>
      ${activityHtml}
    </div>
    <div class="card">
      <h2>Edit Details</h2>
      <p class="meta" style="margin-bottom:12px;">Corrects what the visitor typed — a misspelled name, a wrong digit in a phone number. Every change is recorded in the activity log above.</p>
      <form method="post" action="/api/admin/lead/${id}">
        <input type="hidden" name="action" value="update_lead">
        ${editInput('name', 'Name', lead.name)}
        ${editInput('phone', 'Phone', lead.phone)}
        ${editInput('email', 'Email', lead.email, 'email')}
        ${editInput('address', 'Address', lead.address)}
        ${editInput('zip_code', 'Zip Code', lead.zip_code)}
        ${editInput('service_type', 'Service Type', lead.service_type)}
        ${editInput('budget_range', 'Budget', lead.budget_range)}
        ${editInput('timeframe', 'Timeframe', lead.timeframe)}
        ${editInput('referral_source', 'Referral Source', lead.referral_source)}
        <div class="field">
          <label for="f-description">Description</label>
          <textarea id="f-description" name="description" rows="6">${escHtml(lead.description ?? '')}</textarea>
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
    ${dangerHtml}
  </main>`)
}

// ─── Main router ──────────────────────────────────────────────────────────────

export async function handleApiRequest(req, env) {
  const url = new URL(req.url)
  const path = url.pathname

  // Contact form — no auth needed
  if (path === '/api/contact' || path === '/api/contact.php') {
    return handleContact(req, env)
  }

  // Everything else under /api that isn't the admin panel (old PHP files,
  // version.txt, config.local.php) simply doesn't exist here.
  if (path !== '/api/admin' && !path.startsWith('/api/admin/')) {
    return text('Not found', 404)
  }

  // Fail closed: without these, a session cookie could be forged or any
  // password would compare against an empty hash.
  if (!env.SESSION_SECRET || !env.ADMIN_USERNAME || !env.ADMIN_PASSWORD_HASH) {
    console.error('[admin] ADMIN_USERNAME, ADMIN_PASSWORD_HASH and SESSION_SECRET must all be set')
    return text('Admin login is not configured.', 503)
  }

  if (path === '/api/admin/logout' || path === '/api/admin/logout.php') {
    return handleLogout()
  }

  const session = await getSession(req, env.SESSION_SECRET)

  if (path === '/api/admin/login' || path === '/api/admin/login.php') {
    return session ? redirect('/api/admin') : handleLogin(req, env)
  }

  if (!session) return redirect('/api/admin/login')

  if (path === '/api/admin' || path === '/api/admin/' || path === '/api/admin/index.php') {
    return handleAdminIndex(req, env)
  }

  const leadMatch = path.match(/^\/api\/admin\/lead\/(\d+)$/)
  if (leadMatch) {
    return handleLead(req, env, Number(leadMatch[1]))
  }

  // Legacy PHP URL: /api/admin/lead.php?id=12
  if (path === '/api/admin/lead.php') {
    const id = parseInt(url.searchParams.get('id'), 10)
    return id > 0 ? redirect(`/api/admin/lead/${id}`) : text('Missing lead id.', 400)
  }

  return text('Not found', 404)
}
