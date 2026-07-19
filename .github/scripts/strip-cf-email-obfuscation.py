#!/usr/bin/env python3
"""Normalize away Cloudflare's Email Address Obfuscation rewrite before hashing.

Cloudflare (proxying burchcontracting.com) rewrites every mailto: link to a
/cdn-cgi/l/email-protection# link at the edge and injects a decoder <script>
tag, on every request. That's an intentional, permanent transformation, not a
deploy bug — so the deploy workflow's content-integrity check normalizes both
the built file and the live response through this script before comparing
hashes, instead of treating the rewrite as a false-positive mismatch forever.

Usage: strip-cf-email-obfuscation.py [file]   (reads stdin if no file given)
"""
import re
import sys

html = open(sys.argv[1], encoding="utf-8").read() if len(sys.argv) > 1 else sys.stdin.read()

EMAIL_LINK_RE = re.compile(
    r'<a href="(?:mailto:[^"]*|/cdn-cgi/l/email-protection#[0-9a-f]+)"[^>]*>.*?</a>',
    re.S,
)
DECODER_SCRIPT_RE = re.compile(
    r'<script data-cfasync="false" src="/cdn-cgi/scripts/[0-9a-f]+/cloudflare-static/email-decode\.min\.js"></script>'
)

html = EMAIL_LINK_RE.sub("<!--EMAIL-LINK-->", html)
html = DECODER_SCRIPT_RE.sub("", html)

sys.stdout.write(html)
