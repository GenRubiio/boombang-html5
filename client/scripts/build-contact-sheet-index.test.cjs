import { describe, it, expect } from 'vitest'
import { renderIndexHtml } from './build-contact-sheet-index.cjs'

// tasks.md slice 21 task 5: the pure templating half of the roster index builder — I/O
// (directory scan, file write) is the untested shell, matching this apply pass's own convention.
describe('renderIndexHtml', () => {
  it('links every character sheet by name, image and href', () => {
    const html = renderIndexHtml(['rasta'])
    expect(html).toContain('href="./rasta.png"')
    expect(html).toContain('src="./rasta.png"')
    expect(html).toContain('>rasta<')
  })

  it('lists multiple characters, each with its own entry', () => {
    const html = renderIndexHtml(['rasta', 'sally'])
    expect(html).toContain('href="./rasta.png"')
    expect(html).toContain('href="./sally.png"')
  })

  it('reports "(none yet)" rather than an empty list when nothing has been captured', () => {
    const html = renderIndexHtml([])
    expect(html).toContain('(none yet)')
  })

  it('escapes a character name that could break the markup', () => {
    const html = renderIndexHtml(['<script>'])
    expect(html).not.toContain('<script>.png')
    expect(html).toContain('&lt;script&gt;')
  })
})
