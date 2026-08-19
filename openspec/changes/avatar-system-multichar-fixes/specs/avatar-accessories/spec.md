# Delta for Avatar Accessories

## MODIFIED Requirements

### Requirement: Accessory Anchoring By Registration Point

An accessory instance (hat or pet) MUST be positioned using a registration point `(regX, regY)`
resolved per frame as: an instance-level override value if present, otherwise the
asset-declared base value, otherwise zero. Hats and pets MUST share this anchoring mechanism,
discriminated by a `kind` field (`"hat"` or `"pet"`). This resolution MUST also be scoped by the
wearing character: the same accessory key (for example `Custom6Hat`, which is authored under both
`lilian` and `rasta`) MUST be able to resolve to a different base registration point and a
different `zBias` per character, and the registry MUST NOT collapse two characters' distinct
per-character anchor data onto a single `(kind, key)` entry. A pet accessory MUST additionally
declare a canonical side (left or right) in its compiled package, and the pet's resolved
horizontal placement relative to the body MUST remain on that declared side across all 8
directions; only the pet's `flipX` state MUST change to face the avatar's current direction.

(Previously: the registry keyed `hasPackage`/`getAtlasKey`/`getManifest` purely on `(kind, key)`
with no character dimension, so a shared key like `Custom6Hat` could only resolve one anchor
regardless of which character wore it. Separately, per the shipped `pivot.js` implementation's own
documented intent — "preserving the antisymmetric-under-mirroring property the coordinator asked
to keep" — a pet's `regX` for authored, non-mirrored directions (`left`, `leftdown`, `leftup`,
`down`) was taken directly from each direction's raw per-frame authored data with no side
correction, and `clearBodySilhouetteX` then pushed the pet clear of the body "on whichever side it
[was] already closer to" with no cross-direction consistency enforced — so the pet could render on
either side depending on direction, with no declared canonical side. Both of these are reversed:
anchor resolution now includes a character dimension, and pet placement now holds a single
manifest-declared canonical side across all 8 directions.)

#### Scenario: the base registration point positions the accessory when no override exists

- GIVEN a hat accessory frame declares a base registration point and no instance-level override
- WHEN the hat is rendered attached to a character
- THEN it MUST be positioned using the asset-declared base `(regX, regY)` value.

#### Scenario: an override registration point takes precedence over the base value

- GIVEN a hat accessory has both an asset-declared base registration point and an instance-level override registration point
- WHEN the hat is rendered
- THEN the override value MUST be used for each axis where it is present, falling back to the base value only where no override exists, and to zero only where neither the override nor the base value exists.

#### Scenario: pets use the same anchoring mechanism as hats

- GIVEN a pet accessory frame declares `kind: "pet"` with its own registration-point data
- WHEN the pet is rendered attached to its owner
- THEN it MUST resolve its position through the same override-then-base-then-zero registration-point mechanism used for hats.

#### Scenario: the same accessory key resolves a different anchor for a different character

- GIVEN the accessory key `Custom6Hat` is authored under both `lilian` and `rasta`, each with its own base registration point and `zBias`
- WHEN `Custom6Hat` is rendered on a `lilian` avatar and, separately, on a `rasta` avatar
- THEN each avatar MUST resolve `Custom6Hat`'s anchor from that character's own registered anchor data, and the two characters MUST NOT be forced to share one resolved anchor value.

#### Scenario: a pet stays on its declared side across all 8 directions

- GIVEN a pet accessory package declares a canonical side of "right"
- WHEN the wearing avatar is driven through all 8 directions, including `left`, `leftdown` and `leftup`
- THEN the pet's resolved horizontal position MUST remain on the right side of the body in every one of the 8 directions, and only the pet's `flipX` value MUST change to face left-facing directions.

### Requirement: Accessory Z-Order Is Explicitly Defined And Applied Consistently

The render pipeline MUST apply one explicit, documented z-order among body, hat, pet and aura
layers, and that z-order MUST be applied consistently for every user wearing the same accessory
combination. The aura layer MUST render above both the body and the hat layers — it MUST be the
topmost layer among body, hat, pet and aura, regardless of which character or hat is worn.

(Previously: the shipped depth table placed the aura between the shadow and the body — `shadow:
0.0`, `aura: 0.2`, ..., `body: 1.0` — documented rationale being that the aura sits "behind the
body, which matches its `(0.5, 0.85)` anchor placing it around the feet." This is reversed: the
aura's resolved depth now exceeds both the body's and the hat's resolved depth, making it the
topmost layer instead of one of the lowest.)

#### Scenario: z-order is consistent across different users wearing the same accessory combination

- GIVEN two different users each wearing a hat and an aura on the same character
- WHEN both are rendered in the same scene
- THEN the layering order among body, hat and aura MUST be identical for both users, matching the documented z-order decision.

#### Scenario: the aura renders above the hat as well as the body

- GIVEN a user wearing both a hat and an aura on a layered character
- WHEN that user's avatar container is sorted by resolved depth
- THEN the aura's resolved depth MUST be greater than both the hat's and the body's resolved depth, so the aura draws as the topmost child, not behind the body or behind the hat.

### Requirement: Hybrid Fallback For Body Animations Outside Layered Coverage

Because an accessory package's declared animation coverage MAY exceed the layered body
package's declared animation coverage (or vice versa), the system MUST define one deterministic
fallback body animation for any triggered animation key the layered body package does not
cover, and MUST apply that same fallback key to determine what a worn accessory does: if the
accessory package defines frames for the fallback key, the accessory MUST play those matching
frames in sync with the body; if it does not, the accessory MUST be hidden for the duration of
the fallback animation. A worn accessory MUST NOT be rendered using frame indices computed from
an animation the accessory package never declared for that key. Every time the fallback is
engaged for a body-level triggered animation key (i.e. the requested key was not found in the
body package's own sequence coverage and the system substituted the fallback), that substitution
MUST be observable — logged or emitted as telemetry with the original requested key and the
resolved fallback key — and MUST NOT be indistinguishable at the call site from a genuine match on
the requested sequence.

(Previously: the shipped `resolveFallbackKey` silently returned `${direction}_idle` for any
requested key absent from `manifest.sequences`/`manifest.mirrors`, with no error, no log and no
signal distinguishing a genuine idle request from a silent degrade — the caller and the player
had no way to tell a requested action had been dropped. This is reversed: the same substitution
must now be observable wherever it is engaged.)

#### Scenario: an accessory with matching fallback coverage stays in sync with the body

- GIVEN a layered character whose body package covers a limited set of base animations, worn with an accessory package that covers additional animation keys including specials
- WHEN the body is triggered into an animation key not present in its layered body package
- THEN the system MUST apply its defined fallback body animation, and if the worn accessory's package defines frames for that fallback key, the accessory MUST play those matching frames in sync with the body.

#### Scenario: an accessory with no fallback coverage is hidden rather than desynced

- GIVEN a layered character triggers its defined fallback animation for an animation key its layered body package does not cover
- WHEN the worn accessory's package has no frames declared for that fallback key
- THEN the accessory MUST be hidden for the duration of that fallback animation rather than rendered using frame indices from an unrelated animation.

#### Scenario: engaging the fallback for a body-level key is observable, never silent

- GIVEN a layered avatar's body package does not cover a requested animation key
- WHEN the system substitutes its deterministic fallback body animation for that key
- THEN the substitution MUST be logged or emitted as telemetry, identifying both the originally requested key and the resolved fallback key, so this class of dropped request can be detected without visually observing the running game.
