# asset-overrides

Committed, sparse tree of hand-edited per-animation whole-file replacements, produced by the
asset-authoring round-trip (design.md §16.2/§16.3, tasks.md slice 11). Applied by
`client/scripts/apply-asset-overrides.cjs <char>` (wired into
`client/scripts/stage-layered-source.sh`, right after accessory staging, before compile) — so a
hand edit survives a later re-unzip of the raw `.bb` source, which the destructible
`client/.assets-src/` tree does not.

Layout: `<char>/<kind>/<key>/_frames_<anim>.json` — a whole-file replacement of exactly one
staged `_frames_<anim>.json`. Only edited animations are committed here; an untouched animation
never appears, so a design fix to one sequence never touches the other forty.

Empty by default. Nothing here changes any compiled output until a file is actually added.
