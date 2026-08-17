# Avatar Layered Rendering Specification

## Purpose

Define what a compiled layered avatar package (manifest, per-piece frame assets, and animation
sequences) must contain and guarantee, and define the render-strategy behaviour that lets the
client choose between the existing baked-atlas renderer and the new layered renderer per
character, behind a feature flag. Also defines the performance measurement harness required to
gate wider rollout, and the client-side testability bar for the new manifest/frame/validation
logic this format introduces.

Out of scope for this domain: palette slot semantics and validation (see the palette
specification), accessory anchoring and ownership (see the accessories specification), and the
socket/API transport that carries palette and accessory changes (see the look-protocol
specification).

## Requirements

### Requirement: Explicit Frame-Index Animation Sequences

Each animation sequence in a layered avatar package MUST be declared as an explicit, ordered
list of frame indices, including any intentionally repeated indices. A sequence MUST NOT be
collapsed into, or represented internally as, a numeric start/end range.

#### Scenario: down_walk sequence preserves a repeated frame index

- GIVEN the layered manifest declares the `down_walk` sequence as `[9,10,11,12,13,14,15,10,16,17,18,19,20]`
- WHEN the animation player resolves `down_walk` for playback
- THEN the played frame order MUST match the declared list exactly, including the repeated frame index `10`, and the sequence MUST NOT be reduced to a `{start, end}` range at any point in resolution.

### Requirement: Per-Frame Origin Is The Animation Anchor

Each frame in a layered avatar package MUST carry its own origin (`o`), and that origin MUST be
used directly as the frame's animation anchor. The anchor MUST NOT be recomputed from the
piece's raw pixel bounding box.

#### Scenario: frame pivot drives sprite anchor

- GIVEN a layered frame declares an origin `o: [x, y]` that differs from the piece's raw bounding-box centre
- WHEN that frame is rendered as part of an animation
- THEN the piece MUST be positioned using the declared origin as its pivot, and no bounding-box-derived recentre value MUST override it.

### Requirement: Raster Piece Supersampling Contract

Raster pieces in a layered avatar package are authored at a supersampling scale of `ss: 2`. A
piece's raster asset MUST measure exactly `width * 2` by `height * 2` pixels, where `width` and
`height` are the piece's manifest-declared logical dimensions.

#### Scenario: piece asset dimensions match the declared supersampling scale

- GIVEN a layered piece manifest entry declares `ss: 2` with logical dimensions `w` and `h`
- WHEN the piece's raster asset is loaded
- THEN the asset's pixel dimensions MUST equal `w * 2` by `h * 2`, and a package whose piece asset does not match MUST be treated as invalid.

### Requirement: Layer Order Is Immutable At Render Time

The declared layer order (`L`) of pieces within a character frame MUST be preserved exactly as
authored. The compositor MUST NOT reorder, sort, or otherwise change piece draw order at
render time.

#### Scenario: pieces render in authored layer order

- GIVEN a character frame declares pieces with layer values `L: 1`, `L: 2`, `L: 3`
- WHEN the frame is composited for display
- THEN the pieces MUST be drawn in the order `1, 2, 3` as declared, regardless of any other ordering (such as insertion order) present in the underlying data.

### Requirement: Mirrored Directions Derive From Left-Facing Source With A Corrected Pivot

Right-facing (mirrored) animation directions MUST be derived from the corresponding left-facing
source frames. The mirrored frame's pivot MUST be corrected for the horizontal-flip transform;
it MUST NOT reuse the source frame's origin unmodified.

#### Scenario: a mirrored direction renders at the visually correct anchor

- GIVEN a left-facing animation frame with origin `o: [x, y]`
- WHEN the corresponding right-facing (mirrored) frame is produced and rendered
- THEN the mirrored frame MUST render at the visually correct anchor position, using a pivot value corrected for the horizontal flip rather than the unmodified source origin.

### Requirement: Renderer Strategy Selection Behind A Feature Flag

The client MUST select between the existing baked-atlas renderer and the new layered renderer
per avatar, gated by a single feature flag. With the flag disabled, every avatar MUST render via
the existing baked-atlas path, unchanged.

#### Scenario: flag off preserves today's baked rendering exactly

- GIVEN the layered-rendering feature flag is disabled
- WHEN any user's avatar is added to a scene
- THEN the avatar MUST be assembled via the existing baked-atlas single-sprite path (shadow, avatar sprite, name background, name text), with no layered compositor invoked and no accessory child sprites created.

#### Scenario: flag on renders a layered character at parity with its baked version

- GIVEN the layered-rendering feature flag is enabled and a character has a compiled layered package
- WHEN that character's avatar idles, talks and walks in each authored direction (and its mirrored counterparts)
- THEN the rendered result MUST show no pivot drift and no frame gaps compared to the character's existing baked-atlas rendering of the same animations.

### Requirement: Disabling The Feature Flag Does Not Lose Persisted Palette Data

Disabling the layered-rendering feature flag MUST NOT delete, truncate, or otherwise lose any
previously persisted avatar palette data.

#### Scenario: a saved palette survives a flag toggle

- GIVEN a user has a persisted palette for one of their avatars while the feature flag is enabled
- WHEN an operator disables the feature flag and the user reconnects
- THEN the user's avatar MUST render via the baked path unaffected, and the previously persisted palette data MUST still be present and unmodified in storage, ready to apply if the flag is re-enabled later.

### Requirement: Performance Measurement Harness With Go/No-Go Thresholds

A measurement harness MUST report frames-per-second and a draw-call (or display-object count)
figure for the layered renderer under a defined load, and those numbers MUST be checkable
against explicit go/no-go thresholds before wider rollout.

#### Scenario: harness reports FPS and object counts at 25 avatars, layered renderer

- GIVEN a scene populated with 25 visible avatars using the layered renderer (feature flag on)
- WHEN the measurement harness is run against that scene
- THEN it MUST report an FPS figure and a draw-call/display-object count, the reported FPS MUST be at least 45 on the target hardware profile used for the measurement, and 60 FPS MUST be the stated target on desktop reference hardware.

#### Scenario: harness reports the baked baseline for comparison

- GIVEN the same 25-avatar scene using the existing baked renderer (feature flag off)
- WHEN the measurement harness is run against that scene
- THEN it MUST report the equivalent FPS and draw-call/display-object numbers, so the layered numbers can be compared against the baked baseline, and the comparison MUST acknowledge the accepted risk that roughly 25 pieces per avatar across 25 avatars is expected to produce roughly 500-775 display objects versus roughly 100 today.

### Requirement: Palette Change Renders Within A Latency Bound

Once a palette change is acknowledged as successful and the affected avatar's piece assets are
already loaded, the visual update MUST be visible on the affected avatar within 100
milliseconds of the acknowledgement, without a full sprite replacement.

#### Scenario: a palette change appears promptly when assets are pre-loaded

- GIVEN a layered avatar whose piece assets are already loaded in the client
- WHEN the user receives a successful acknowledgement for a palette change
- THEN the in-room avatar MUST visibly reflect the new colour within 100 milliseconds of the acknowledgement, without the avatar sprite being destroyed and recreated.

### Requirement: New Client-Side Look Logic Is Automatically Testable

New client-side logic introduced to support this system — manifest parsing, frame-index
sequence resolution, and palette/accessory validation helpers — MUST be covered by an
automated test command runnable in the `client` surface, and that command MUST pass.

#### Scenario: a client test command exists and passes for new look logic

- GIVEN this change introduces new client-side logic for manifest parsing, frame-sequence resolution, or palette/accessory validation
- WHEN the client's automated test command is run
- THEN a test script MUST exist for the `client` surface and running it MUST execute and pass automated tests covering that new logic.
