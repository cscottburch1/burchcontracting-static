/**
 * The visible text of a rendered page, as a date-override text hash sees it
 * (check-build check 15, repo-truth 2026-09-24).
 *
 * Drops <head>, the <header> and <footer> chrome, scripts, styles and tags,
 * collapses whitespace, and replaces every ISO date with "D". The date
 * normalisation matters: the author byline prints the page's own
 * dateModified ("Last reviewed: 2026-09-23"), so without it bumping a date
 * would change the hash and the check would chase its own tail.
 */
import crypto from 'node:crypto'

export function visibleText(html) {
  return String(html)
    .replace(/<head[\s\S]*?<\/head>/i, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\d{4}-\d{2}-\d{2}/g, 'D')
    .replace(/\s+/g, ' ')
    .trim()
}

/** First 16 hex characters of the SHA-256 of the page's visible text. */
export function visibleTextHash(html) {
  return crypto.createHash('sha256').update(visibleText(html)).digest('hex').slice(0, 16)
}
