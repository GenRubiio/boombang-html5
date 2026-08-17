# Avatar Look Protocol Specification

## Purpose

Define the socket/API contract that carries avatar look changes — palette updates and
accessory equip/unequip — between the client, the server and the API: server authority over
validity, the functional-ACK error contract (a deliberate departure from this project's
existing disconnect-on-error pattern), broadcast reliability to observing sessions, durable
persistence across the full chain, event-naming consistency, and the debug panel that proves
the round trip live.

Out of scope for this domain: the layered frame/manifest format (see the layered rendering
specification), palette slot semantics (see the palette specification), and accessory
anchoring/ownership rules themselves (see the accessories specification) — this domain defines
how a change request travels and is judged, not what makes a given palette or accessory value
valid.

## Requirements

### Requirement: The Server Is Authoritative For Palette And Accessory Validity

For every submitted palette or accessory change, the server MUST independently validate
slot-key membership, glove-preset unlock status, and accessory ownership. The server MUST NOT
trust client-side validation, client-side rendering state, or any value the client displays as
authoritative.

#### Scenario: the server rejects an invalid change regardless of what the client attempted to send

- GIVEN a client sends a palette or accessory change request that fails server-side validation (an unknown slot key, a locked glove preset, or an unowned accessory)
- WHEN the server processes that request
- THEN the server MUST reject the change based on its own authoritative check, regardless of what value the requesting client's UI displayed or allowed the user to select.

### Requirement: Rejected Changes Return A Functional ACK, Never A Disconnect

When a submitted palette or accessory change is rejected, the server MUST respond with a
functional acknowledgement shaped at least as `{success: false, code, message}`. The server
MUST NOT disconnect the user's session and MUST NOT emit a critical/fatal error event as a
result of a rejected change. This is a deliberate departure from this project's existing
avatar- and uppercut-change controllers, which disconnect the session on any thrown error.

#### Scenario: an unowned accessory selection keeps the session connected

- GIVEN a user requests to equip an accessory they do not own
- WHEN the server rejects the request
- THEN the response MUST be a functional ACK of the shape `{success: false, code, message}`, and the user's socket session MUST remain connected with no disconnect or critical-error event emitted.

#### Scenario: an invalid palette slot key keeps the session connected

- GIVEN a user submits a palette update for a slot key not declared by their avatar's manifest
- WHEN the server rejects the request
- THEN the response MUST be a functional ACK of the same shape, and the session MUST remain connected.

#### Scenario: a locked glove preset keeps the session connected

- GIVEN a user requests a glove-slot preset their progression tier has not unlocked
- WHEN the server rejects the request
- THEN the response MUST be a functional ACK of the same shape, and the session MUST remain connected.

### Requirement: Accepted Changes Are Broadcast To Observing Sessions Reliably

A successfully applied palette or accessory change MUST be broadcast so that other users
currently viewing the same scene see the updated look. This broadcast MUST reach the correct
avatar instance on an observing client regardless of which asset-loading path (immediate load
vs. fallback/upgrade load) that observing client took to load the changed user's avatar.

#### Scenario: a second session observes the change live

- GIVEN two users are logged into the same scene, and user A changes a palette slot
- WHEN the server accepts user A's change
- THEN user B's client MUST receive and apply the update to user A's rendered avatar without requiring user B to reload or re-enter the scene.

#### Scenario: the broadcast reaches an avatar that loaded via the fallback/upgrade path

- GIVEN an observing user's client resolved the changed user's avatar through the fallback/upgrade loading path rather than the immediate load path
- WHEN the look-change broadcast is delivered
- THEN the observing client MUST still apply the update to the correct avatar instance, matched consistently regardless of which identifier was used to register that avatar instance when it was loaded.

### Requirement: Palette State Persists Across The Full Client-Server-API Chain

An accepted palette change MUST be durably persisted from server to API to database, scoped to
the (user, avatar) pair, such that it is retrievable after the originating session ends.

#### Scenario: a persisted palette is retrievable after disconnect

- GIVEN a user's palette change has been accepted and acknowledged as successful
- WHEN the user later disconnects and a new session is established for the same user and avatar
- THEN the server MUST retrieve and apply the same persisted palette values without requiring the user to resubmit them.

### Requirement: Look-Change Events Follow The Existing Request/Response Naming Convention

New socket events introduced for palette and accessory changes MUST follow the existing
`request:` / `response:` naming convention already used by other gameplay socket events.

#### Scenario: new events are named consistently with existing events

- GIVEN a new palette-change socket event is introduced
- WHEN its request and response event names are declared
- THEN they MUST follow the `request:snake_case` / `response:snake_case` pattern already used by existing events such as `request:user_change_avatar` / `response:user_change_avatar`.

### Requirement: A Debug Panel Proves The Live Round Trip

A developer-facing debug panel MUST exist that lets a tester change a palette slot value, or
equip/unequip an accessory, for the current session's avatar, and observe the result applied
in-room without a full sprite replacement. Free colour input in this panel MUST be provided
through a plain value input (for example a hex text field); introducing a colour-wheel widget
library is out of scope for this change.

#### Scenario: the debug panel triggers a live in-room palette update

- GIVEN the debug panel is open for a logged-in test account in a scene
- WHEN the user changes a palette slot value via the panel
- THEN the in-room avatar MUST update to the new colour without the avatar sprite being destroyed and recreated.

#### Scenario: the debug panel triggers a live in-room accessory update

- GIVEN the debug panel is open for a logged-in test account who owns a given accessory
- WHEN the user equips that accessory via the panel
- THEN the in-room avatar MUST render the accessory without a full sprite replacement of the body.
