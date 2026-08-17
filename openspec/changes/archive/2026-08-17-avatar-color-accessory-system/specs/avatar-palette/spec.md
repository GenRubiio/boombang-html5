# Avatar Palette Specification

## Purpose

Define the palette contract for layered avatars: how palette slot keys are declared and
validated, how slot defaults and labels resolve independently of each other, how a palette is
persisted and scoped, and the special gating rules that apply to the glove
(`colorGuante`-equivalent) slot, including how it coexists with this project's existing
progression-gated uppercut/glove-tint feature for avatars that remain on the baked renderer.

Out of scope for this domain: the layered frame/manifest format itself (see the layered
rendering specification), accessory anchoring/ownership (see the accessories specification),
and the socket/API transport and authority rules for submitting a change (see the look-protocol
specification).

## Requirements

### Requirement: Palette Slot Keys Are An Open, Manifest-Declared Set

A character's set of palette slot keys MUST be exactly the set declared by that character's own
manifest. Slot keys MUST NOT be constrained to a fixed numeric pattern. Validation of a
submitted slot key MUST check membership in the character's declared slot set, never a
numeric-pattern match such as `color[1-9]`.

#### Scenario: a non-numeric slot key is accepted when declared by the manifest

- GIVEN the `rasta` character manifest declares slot keys `color1` through `color7` plus a non-numeric slot key `colorGuante`
- WHEN a palette update submits a value for the slot key `colorGuante`
- THEN the server MUST accept `colorGuante` as a valid slot key for `rasta` because it is a member of `rasta`'s declared slot set, not because it matches a `color[1-9]` pattern.

#### Scenario: a slot key valid for one character is rejected for a character that does not declare it

- GIVEN a character manifest that does not declare a `colorGuante` slot
- WHEN a palette update for that character submits a value for the slot key `colorGuante`
- THEN the server MUST reject the update for that slot key with a functional error, because `colorGuante` is not a member of that character's declared slot set.

### Requirement: Slot Counts And Key Sets Vary Independently Per Character

The number and identity of palette slots MUST be resolved from each character's own manifest
independently. No two characters are assumed to share slot counts or slot keys.

#### Scenario: two characters expose different slot counts

- GIVEN character A declares 7 colour slots and character B declares a different number of colour slots
- WHEN the palette validation logic resolves each character's available slots
- THEN it MUST use each character's own manifest-declared slot set and MUST NOT assume a shared or fixed slot count across characters.

### Requirement: Defaults And Labels Are Independent, Optional Per-Slot Metadata

A slot's default colour value and a slot's human-readable label MUST be looked up
independently of each other. A slot MAY have a declared default with no declared label. Any
consumer that needs to present a slot MUST fall back to displaying the raw slot key when no
label is declared for that slot.

#### Scenario: a slot with a default but no label falls back to its raw key

- GIVEN a character manifest declares a default value for slot key `color5` but declares no entry for `color5` in its labels map
- WHEN the palette resolution logic or a UI needs to present that slot
- THEN it MUST use the manifest-declared default value for `color5`'s colour, and it MUST display the raw key `color5` — not an invented or blank label — wherever a label would otherwise appear.

#### Scenario: a labelled slot displays its declared label

- GIVEN a character manifest's labels declare `"piel"` for a skin slot
- WHEN that slot is presented in a UI
- THEN the UI MUST display the declared label text, not the raw slot key.

### Requirement: Palette Persistence Is Scoped Per (User, Avatar)

A persisted palette MUST be stored and retrieved per the combination of the owning user and the
specific avatar/character it applies to. Changing a user's active avatar MUST NOT overwrite or
discard the palette stored for a different avatar owned by the same user.

#### Scenario: switching avatars preserves each avatar's own palette

- GIVEN a user has previously saved distinct palettes for avatar A and avatar B
- WHEN the user switches their active avatar from A to B and later back to A
- THEN the palette applied to B MUST be B's own saved palette, and switching back to A MUST restore A's own saved palette unchanged.

#### Scenario: a saved palette survives reconnect

- GIVEN a user has saved a palette for their active avatar
- WHEN the user disconnects and reconnects
- THEN the same palette MUST be applied to that avatar on reconnect, with no reset to manifest defaults.

### Requirement: A Missing Palette Falls Back To Manifest Defaults

When no persisted palette exists for a given (user, avatar) pair, every slot other than the
glove slot MUST resolve to its manifest-declared default value.

#### Scenario: first-time resolution with no saved palette uses manifest defaults

- GIVEN a user has never saved a palette for a given avatar
- WHEN that avatar's palette is resolved for rendering
- THEN every slot other than the glove slot MUST use the manifest-declared default value for that slot.

### Requirement: Non-Glove Slots Accept A Free Colour Value

For any palette slot other than the glove/`colorGuante`-equivalent slot, a user MUST be
permitted to submit an arbitrary valid colour value, subject only to the slot-key-membership
validation defined above.

#### Scenario: a free colour value is accepted for a standard slot

- GIVEN a character manifest declares a `color3` slot with no preset-gating rule
- WHEN a palette update submits an arbitrary valid colour value for `color3`
- THEN the server MUST accept the value without checking it against any preset or unlock list.

### Requirement: The Glove Slot Only Accepts Unlocked Preset Colours

The glove/`colorGuante`-equivalent palette slot MUST NOT accept an arbitrary free colour value
the way other slots do. It MUST only accept one of the ten named preset colours, and only if
the requesting user's progression tier has unlocked that preset. The server MUST be the sole
authority on this check.

#### Scenario: an unlocked preset is accepted

- GIVEN a user's progression tier has unlocked the "red" glove preset
- WHEN the user submits a glove-slot palette update selecting "red"
- THEN the server MUST accept the update and the client MUST render the glove slot in that colour.

#### Scenario: a locked preset is rejected even if requested directly

- GIVEN a user's progression tier has not reached the tier required for the "gold" glove preset
- WHEN a glove-slot palette update selecting "gold" is submitted for that user, regardless of what the requesting client displayed or allowed
- THEN the server MUST reject the update and MUST NOT apply the change.

#### Scenario: an arbitrary colour value is rejected for the glove slot

- GIVEN any user, regardless of progression tier
- WHEN they submit a glove-slot palette update with a colour value that is not one of the ten named presets
- THEN the server MUST reject the update.

### Requirement: Glove Preset Identity Is Preserved

The ten existing named glove colours MUST keep their existing identity — name and meaning — as
glove-slot presets in the new palette system, including the historical unlock tier required for
the gold preset.

#### Scenario: the gold preset still requires its historical unlock tier

- GIVEN a user reaches the progression tier historically required to unlock the gold glove colour
- WHEN that user's available glove presets are resolved
- THEN the gold preset MUST appear as available to that user, identified consistently with its existing name, and a user below that tier MUST NOT see it as available.

### Requirement: The Glove Slot Seeds From Current Progression, Then Persists

The first time a user's layered glove slot is resolved with no saved value, it MUST be seeded
from the colour the user's current progression tier already grants — not from the slot's raw
manifest default. From that point forward, the user's explicit choice MUST persist across
reconnects rather than being recomputed from progression tier on every connection.

#### Scenario: first resolution seeds from the current progression tier

- GIVEN a user has no saved glove-slot palette value and their current progression tier grants the "blue" preset
- WHEN the user's layered glove slot is resolved for the first time
- THEN the resolved and persisted glove colour MUST be "blue" — the colour their current tier already grants.

#### Scenario: a later explicit choice persists across reconnect

- GIVEN a user has been seeded with a glove colour and later explicitly selects a different unlocked preset
- WHEN the user disconnects and reconnects
- THEN the glove slot MUST resolve to the user's explicitly chosen preset, not be recomputed back to their progression-tier default.

### Requirement: Baked-Renderer Characters Keep Existing Glove Tint Behaviour Unchanged

For any character still on the baked (non-layered) renderer, the existing global-tint
glove/uppercut mechanism MUST continue to function exactly as it does today. It MUST NOT be
replaced, gated behind the new glove-slot preset validation, or altered by this change.

#### Scenario: a baked character's glove tint is unaffected by the new palette system

- GIVEN a character that has not been migrated to the layered renderer
- WHEN a user changes their uppercut/glove tint selection via the existing mechanism
- THEN the existing global sprite tint behaviour MUST apply exactly as before, independent of the new palette system, and MUST NOT be routed through the new glove-slot preset validation.
