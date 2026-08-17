# Avatar Accessories Specification

## Purpose

Define the accessory contract for hats, pets and auras: how an accessory is anchored to a
character, how accessory ownership is modeled and enforced, what a worn accessory MUST do when
the layered body's animation coverage does not match the accessory's, and that a documented,
consistent z-order MUST govern how body, hat, pet and aura layers stack.

Out of scope for this domain: the layered body frame/manifest format itself (see the layered
rendering specification), palette slot semantics (see the palette specification — accessories
are treated as fixed-colour in this change; per-accessory recolouring is out of scope), and the
socket/API transport and authority rules for equipping/unequipping (see the look-protocol
specification).

## Requirements

### Requirement: Accessory Anchoring By Registration Point

An accessory instance (hat or pet) MUST be positioned using a registration point `(regX, regY)`
resolved per frame as: an instance-level override value if present, otherwise the
asset-declared base value, otherwise zero. Hats and pets MUST share this anchoring mechanism,
discriminated by a `kind` field (`"hat"` or `"pet"`).

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

### Requirement: Auras Are Character-Independent With Their Own Anchor

An aura accessory MUST render as a sheet animation independent of the wearer's character body,
using its own anchor rather than one derived from the character's body frame pivots.

#### Scenario: the same aura renders identically regardless of the wearer's character

- GIVEN two users wearing different characters both have the same aura equipped
- WHEN the aura is rendered on each
- THEN the aura's own anchor and animation MUST be applied identically regardless of which character it is attached to.

### Requirement: Accessory Ownership Reuses The Existing Decoration Ownership Model

Accessory ownership MUST be modeled using the existing decoration ownership pattern: a
decoration-type value on the catalog item (new values `avatar_hat`, `avatar_pet`, `avatar_aura`)
plus a per-user ownership row, exactly as avatar ownership works today. Accessories MUST be
grantable only through the existing admin-grant process; there MUST be no purchase/currency flow
for accessories, and no schema migration of the existing catalog-item table is required by this
ownership model.

#### Scenario: an accessory granted via admin is owned by the user

- GIVEN an administrator grants an `avatar_hat`-typed catalog item to a user through the existing admin process
- WHEN that user's owned accessories are queried
- THEN the granted hat MUST appear as owned for that user, via the same ownership-check pattern used for avatars.

#### Scenario: an accessory not owned by the user is not offered or rendered

- GIVEN a user has not been granted a particular pet accessory
- WHEN that user's available/equipped accessories are resolved
- THEN that pet MUST NOT be selectable, offered, or rendered for that user, and any request to equip it MUST be rejected server-side.

#### Scenario: no purchase flow exists for accessories

- GIVEN the accessory ownership model as implemented
- WHEN a user without an owned accessory looks for a way to acquire it in-product
- THEN no purchase or currency-spend flow MUST exist for accessories; ownership changes only through an admin grant.

### Requirement: Hybrid Fallback For Body Animations Outside Layered Coverage

Because an accessory package's declared animation coverage MAY exceed the layered body
package's declared animation coverage (or vice versa), the system MUST define one deterministic
fallback body animation for any triggered animation key the layered body package does not
cover, and MUST apply that same fallback key to determine what a worn accessory does: if the
accessory package defines frames for the fallback key, the accessory MUST play those matching
frames in sync with the body; if it does not, the accessory MUST be hidden for the duration of
the fallback animation. A worn accessory MUST NOT be rendered using frame indices computed from
an animation the accessory package never declared for that key.

#### Scenario: an accessory with matching fallback coverage stays in sync with the body

- GIVEN a layered character whose body package covers a limited set of base animations, worn with an accessory package that covers additional animation keys including specials
- WHEN the body is triggered into an animation key not present in its layered body package
- THEN the system MUST apply its defined fallback body animation, and if the worn accessory's package defines frames for that fallback key, the accessory MUST play those matching frames in sync with the body.

#### Scenario: an accessory with no fallback coverage is hidden rather than desynced

- GIVEN a layered character triggers its defined fallback animation for an animation key its layered body package does not cover
- WHEN the worn accessory's package has no frames declared for that fallback key
- THEN the accessory MUST be hidden for the duration of that fallback animation rather than rendered using frame indices from an unrelated animation.

### Requirement: Accessory Z-Order Is Explicitly Defined And Applied Consistently

The render pipeline MUST apply one explicit, documented z-order among body, hat, pet and aura
layers, and that z-order MUST be applied consistently for every user wearing the same
accessory combination.

#### Scenario: z-order is consistent across different users wearing the same accessory combination

- GIVEN two different users each wearing a hat and an aura on the same character
- WHEN both are rendered in the same scene
- THEN the layering order among body, hat and aura MUST be identical for both users, matching the documented z-order decision.
