/**
 * Generates the SHA-256 password hash used by cloudflare/api.js for admin login.
 *
 * Usage:
 *   node scripts/generate-admin-hash.mjs yourpassword
 *
 * Copy the output and add it as the ADMIN_PASSWORD_HASH Worker secret
 * (`npx wrangler secret put ADMIN_PASSWORD_HASH`). CI doesn't need it.
 *
 * Never commit the actual password or hash to the repo.
 */

import { createHash } from 'crypto'

const password = process.argv[2]
if (!password) {
  console.error('Usage: node scripts/generate-admin-hash.mjs <password>')
  process.exit(1)
}

const hash = createHash('sha256').update(password + ':burch').digest('hex')
console.log('\nADMIN_PASSWORD_HASH value to add as a Worker secret:\n')
console.log(hash)
console.log('\nThe Worker needs these secrets (`npx wrangler secret put NAME`; see cloudflare/api.js):')
console.log('  RESEND_API_KEY       — Resend API key (burchcontracting.com verified in Resend)')
console.log('  RECAPTCHA_SECRET_KEY — reCAPTCHA v3 secret, the recaptcha_secret_key from Hostinger\'s config.local.php')
console.log('  ADMIN_USERNAME       — the username you want for /api/admin login')
console.log('  ADMIN_PASSWORD_HASH  — the hash above')
console.log('  SESSION_SECRET       — any random 32+ character string\n')
