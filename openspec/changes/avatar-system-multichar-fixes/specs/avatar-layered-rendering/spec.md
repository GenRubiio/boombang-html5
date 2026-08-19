# Delta for Avatar Layered Rendering

## ADDED Requirements

### Requirement: Every Character With A Compiled Layered Source Package Is Migrated

Every character that ships a `<char>.layers.bb` package in the decrypted source index MUST be
migrated to the layered renderer: staged from its source package, compiled with the existing
layered-avatar compiler, and registered in the client's avatar manager and asset-version manifest.
A character with no `.layers.bb` package (no layered source art exists for it at all) MUST NOT be
required by this change and remains on the baked renderer.

#### Scenario: a character with a layered source package is registered as layered

- GIVEN a character's source index lists a `<char>.layers.bb` package
- WHEN the roster migration for this change is complete
- THEN that character MUST be compiled into `client/src/assets/game/avatars/<char>/layers/`, registered in `AvatarManager.js`'s layered-character registries, and given an `assetVersionManager.layeredVersions.characters` entry, so it renders via the layered renderer when the feature flag is enabled.

#### Scenario: a character with no layered source package is not required to migrate

- GIVEN a character (for example `skeleton` or `zombie`) has no `<char>.layers.bb` package in the source index, only a vector `<char>.bb`
- WHEN the roster migration for this change is evaluated
- THEN that character MUST NOT be required to migrate as part of this change, and MUST continue rendering via the existing baked-atlas path unaffected.

### Requirement: Triggered Action And Emote Sequences Play With The Body Package's Compiled Coverage And Preserve Palette

A layered character's compiled body package MUST include, as real `manifest.sequences` entries,
the action and emote sequences (for example `risa1`, `risa2`, `llorar`, `coco`, `escupir`,
`punch_doy`, `punch_rec`) that exist for that character in its source data, compiled by the same
vector-to-raster pipeline already used for accessory pieces, with each authored per-path colour
slot reference (`"c":"colorN"`) mapped onto the same per-slot tint mechanism the body's idle/walk/
talk pieces already use. Playing a triggered action or emote sequence on a layered avatar MUST
apply and visibly preserve the avatar's current custom palette for the sequence's entire duration.
Falling back to the legacy baked-atlas spritesheet path to play an action or emote on a layered
avatar MUST NOT be used, because that path has no per-slot tint mechanism and would visibly reset
the avatar to its default baked colours mid-action.

#### Scenario: a triggered action sequence plays instead of silently staying idle

- GIVEN a layered avatar with a compiled body package covering the `llorar` sequence
- WHEN the player triggers the `llorar` action
- THEN the avatar's rendered animation MUST visibly change from its current idle/walk pose to the `llorar` sequence's frames, not remain on an idle frame.

#### Scenario: the player's custom palette survives the full duration of a triggered action

- GIVEN a layered avatar whose current palette has a non-default colour applied to at least one slot
- WHEN the player triggers an action sequence (for example `risa1`) and that sequence plays to completion
- THEN every frame of the played sequence MUST render with the avatar's current custom palette applied to the same slots as its idle/walk frames, at no point snapping to a default or baked colour.

### Requirement: Layered Avatar Animations Emit A Completion Event

A layered avatar's animation player MUST emit an `animationcomplete` event when a non-repeating
sequence finishes playing its last frame, matching the event name and timing semantics that
existing animation controllers (for example the emoji and coco animation controllers) already
listen for via `sprite.once('animationcomplete', ...)`.

#### Scenario: a completed action returns the avatar to idle

- GIVEN a layered avatar is playing a non-repeating action sequence and a caller has registered a one-time `animationcomplete` listener
- WHEN the sequence's last frame finishes playing
- THEN the layered avatar MUST emit `animationcomplete`, and the registered listener MUST fire and transition the avatar back to its idle sequence, instead of the avatar freezing on the sequence's last frame.

### Requirement: Resolved-Rendered-State Validation Covers The Full Migrated Roster

Correctness of a migrated character's rendering across all 8 directions MUST be verifiable by
asserting resolved rendered state — the migrated avatar's container child order and each child's
computed on-screen `x`, `y` and `depth` for body, shadow, hat, pet and aura — not by asserting on
pure functions fed hand-built fixtures or manifest JSON in isolation. This validation MUST be
runnable, per migrated character, across all 8 authored/mirrored directions, and MUST include an
assertion that the shadow's resolved position stays correctly aligned with the body across every
direction.

#### Scenario: a character's resolved container order is asserted directly, not inferred from data

- GIVEN a migrated character's avatar is spawned in a live (or live-driven, e.g. Playwright-controlled) scene with a hat, pet and aura equipped
- WHEN the avatar's container is read after its render-order sort has run
- THEN the assertion MUST read the container's actual child list and each child's actual resolved `depth`, `x` and `y` values, and MUST fail if the aura, hat, pet, body or shadow's resolved position or order differs from the expected values — a test that only re-derives expected depths or positions from manifest JSON without reading an actual container's resolved children MUST NOT be treated as satisfying this requirement.

#### Scenario: a character's shadow alignment is checked per direction against resolved position, not computed independently

- GIVEN a migrated character is driven through each of its 8 directions in a live or live-driven scene
- WHEN the character's shadow child and body child are read from the resolved container after each direction change
- THEN the assertion MUST compare the shadow's actual resolved `x`/`y` against the body's actual resolved `x`/`y` for that direction, and MUST fail if any of the 8 directions shows a resolved misalignment, even if a pure-function computation of the expected offset would have reported no error.
