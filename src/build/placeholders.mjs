/**
 * Named holes in a template, and the two ways filling them can go wrong.
 *
 * A template in src/templates/ is a page's <main> body with {{group.name}}
 * placeholders where generated sections belong. Phase 3.3c introduced these for
 * the trust layer; 3.3b added a second group for the calculator pricing tables,
 * which is why this is no longer part of trust-layer.mjs.
 *
 * THE TWO FAILURES, AND WHY BOTH ARE FATAL
 *
 * A block with no placeholder means a whole section — a byline, a pricing
 * table, a set of answers — is built and then dropped on the floor. A
 * placeholder with no block means a literal '{{calculator.table}}' ships to a
 * reader. Neither is recoverable at render time and neither is visible in a
 * diff of the generator, so both stop the build.
 *
 * The patcher these replaced had a third behaviour for the first case: insert
 * the block at a guessed anchor. That is how content ended up in places nobody
 * chose, and why a "the anchor moved" bug could only be found by reading the
 * output.
 *
 * WHY THE CHECK IS A SEPARATE CALL
 *
 * A calculator fills two groups in sequence — its table first, because the
 * trust layer reads the table's own <h2> to build the page's FAQPage schema,
 * then the trust blocks. Checking for leftovers inside fillBlocks() would make
 * the first pass fail on the second group's placeholders. assertNoPlaceholders()
 * runs once, after every group, which is also the only point at which "nothing
 * is left unfilled" is a true statement.
 */

const OPEN = '{{'
const NL = String.fromCharCode(10)

/**
 * Replaces each `{{prefix.key}}` line with its block.
 *
 * The whole placeholder LINE goes, indentation included, because every block
 * string already carries its own.
 */
export function fillBlocks(html, prefix, blocks, relFile) {
  const lines = html.split(NL)

  for (const [key, block] of Object.entries(blocks)) {
    const token = `${OPEN}${prefix}.${key}}}`
    const at = lines.findIndex((line) => line.trim() === token)
    if (at === -1) {
      throw new Error(
        `${relFile}: a '${prefix}.${key}' block was built, but src/templates/${relFile} has no ${token} placeholder. ` +
          `Add the placeholder where the block belongs — do not drop the block.`
      )
    }
    lines[at] = block
  }

  return lines.join(NL)
}

/** Every placeholder must be filled by the time the page is assembled. */
export function assertNoPlaceholders(html, relFile) {
  const lines = html.split(NL)
  const at = lines.findIndex((line) => line.includes(OPEN) && /\{\{[a-z]+\.[a-zA-Z]+\}\}/.test(line))
  if (at !== -1) {
    throw new Error(
      `${relFile}: line ${at + 1} still holds ${lines[at].trim()} — nothing built a block for it.`
    )
  }
}
