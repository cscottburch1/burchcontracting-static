<#
.SYNOPSIS
  Generates the ADMIN_PASSWORD_HASH value for cloudflare/api.js admin login.

.DESCRIPTION
  Prompts for the password with masked input, so PowerShell never expands $, `
  or ! inside it. Passing a password as a command-line argument is the usual
  cause of a "correct-looking hash that won't log in": PowerShell expands
  My!Pass$word2024 down to My!Pass2024 before node ever sees it, and you get a
  valid hash of the wrong string.

  Produces the same value as: node scripts/generate-admin-hash.mjs <password>
  i.e. sha256hex(password + ':burch').

.EXAMPLE
  .\scripts\Generate-AdminHash.ps1
#>

$first  = Read-Host -Prompt 'Password' -AsSecureString
$second = Read-Host -Prompt 'Confirm password' -AsSecureString

# SecureString -> plain text, unavoidable since we must hash the actual bytes.
function ConvertFrom-SecureStringPlain([System.Security.SecureString]$s) {
  $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
  try   { [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
  finally { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

$p1 = ConvertFrom-SecureStringPlain $first
$p2 = ConvertFrom-SecureStringPlain $second

if ($p1 -cne $p2) {
  Write-Error 'The two entries did not match. Nothing was generated.'
  exit 1
}
if ([string]::IsNullOrEmpty($p1)) {
  Write-Error 'An empty password is not usable. Nothing was generated.'
  exit 1
}

$sha   = [System.Security.Cryptography.SHA256]::Create()
$bytes = [System.Text.Encoding]::UTF8.GetBytes($p1 + ':burch')
$hash  = ($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString('x2') }) -join ''

Write-Host ''
Write-Host ("Password length: {0} characters (check this matches what you typed)" -f $p1.Length)
Write-Host ''
Write-Host 'ADMIN_PASSWORD_HASH value to add as a Worker secret:'
Write-Host ''
Write-Host $hash
Write-Host ''
Write-Host 'Add it with:  npx wrangler secret put ADMIN_PASSWORD_HASH'
Write-Host 'Never commit the password or the hash to the repo.'
Write-Host ''
