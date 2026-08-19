// design.md §9.2 (tasks.md slice 16 task 2): pure grouping of a compiled character's flat file
// list into bundle units — the base pack (one bundle) and each per-key action pack (one bundle
// each), matching slice 15's own lazy-loading granularity so bundling never re-couples what
// per-key packing deliberately decoupled.

import { describe, it, expect } from 'vitest'
import { groupLayeredFilesIntoBundles } from './groupLayeredFilesIntoBundles.cjs'

describe('groupLayeredFilesIntoBundles', () => {
  it('groups the base pack\'s 3 files into one bundle', () => {
    const files = ['rasta.layers.webp', 'rasta.layers.atlas.json', 'rasta.layers.manifest.json']
    const bundles = groupLayeredFilesIntoBundles('rasta', files)
    expect(bundles['rasta.layers']).toEqual(files)
  })

  it('groups each action key\'s files into its OWN bundle, never mixed with another key', () => {
    const files = [
      'rasta.actions.down_llorar.webp',
      'rasta.actions.down_llorar.atlas.json',
      'rasta.actions.down_llorar.manifest.json',
      'rasta.actions.leftdown_punch_rec.webp',
      'rasta.actions.leftdown_punch_rec.atlas.json',
      'rasta.actions.leftdown_punch_rec.manifest.json',
    ]
    const bundles = groupLayeredFilesIntoBundles('rasta', files)
    expect(bundles['rasta.actions.down_llorar']).toHaveLength(3)
    expect(bundles['rasta.actions.leftdown_punch_rec']).toHaveLength(3)
    expect(bundles['rasta.actions.down_llorar']).not.toEqual(
      expect.arrayContaining(['rasta.actions.leftdown_punch_rec.webp'])
    )
  })

  it('groups a multi-page action key\'s extra .webp pages into the SAME bundle', () => {
    const files = [
      'rasta.actions.left_fall.webp',
      'rasta.actions.left_fall_1.webp',
      'rasta.actions.left_fall.atlas.json',
      'rasta.actions.left_fall.manifest.json',
    ]
    const bundles = groupLayeredFilesIntoBundles('rasta', files)
    expect(bundles['rasta.actions.left_fall']).toHaveLength(4)
  })

  it('ignores an unrelated file (e.g. config.json) rather than inventing a bundle for it', () => {
    const bundles = groupLayeredFilesIntoBundles('rasta', ['config.json'])
    expect(Object.keys(bundles)).toEqual([])
  })
})
