import { describe, it, expect } from 'vitest'
import { parseBundleEntries } from './parseBundleEntries.js'

// design.md §9.2 (tasks.md slice 16 task 3): identifies which unzipped bundle entry is the
// manifest, which is the atlas, and which (possibly several, for a multi-page pack) are the
// webp pages — pure name classification, no decoding.
describe('parseBundleEntries', () => {
  it('classifies a single-page bundle\'s 3 entries', () => {
    const entries = {
      'rasta.layers.manifest.json': new Uint8Array(),
      'rasta.layers.atlas.json': new Uint8Array(),
      'rasta.layers.webp': new Uint8Array(),
    }
    expect(parseBundleEntries(entries)).toEqual({
      manifestEntry: 'rasta.layers.manifest.json',
      atlasEntry: 'rasta.layers.atlas.json',
      webpEntries: ['rasta.layers.webp'],
    })
  })

  it('sorts multiple webp pages so page order matches the atlas textures[] index order', () => {
    const entries = {
      'rasta.actions.left_fall_1.webp': new Uint8Array(),
      'rasta.actions.left_fall.manifest.json': new Uint8Array(),
      'rasta.actions.left_fall.webp': new Uint8Array(),
      'rasta.actions.left_fall.atlas.json': new Uint8Array(),
    }
    expect(parseBundleEntries(entries).webpEntries).toEqual([
      'rasta.actions.left_fall.webp',
      'rasta.actions.left_fall_1.webp',
    ])
  })

  it('throws (naming the missing kind) when the bundle is missing an atlas entry', () => {
    const entries = { 'rasta.layers.manifest.json': new Uint8Array(), 'rasta.layers.webp': new Uint8Array() }
    expect(() => parseBundleEntries(entries)).toThrow(/atlas/)
  })
})
