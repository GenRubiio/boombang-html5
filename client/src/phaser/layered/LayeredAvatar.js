import Phaser from 'phaser';
import { computeMaxPoolSize } from './computeMaxPoolSize.js';
import { resolveAnimationKey, accessoryFollows, resolveAccessoryFrameId } from './fallback.js';
import { computeActionBackedKeys } from './actionPack.js';
import { expandSequence } from './sequence.js';
import {
    resolveRenderPosition,
    scaleBodyBounds,
    resolveAccessoryPlacement,
    reflectSpan,
    computeBodyBoundsX,
    resolvePetSideX,
    resolvePieceSs,
} from './pivot.js';
import { resolvePalette, resolveTintHex } from './paletteResolve.js';
import { resolveAccessoryDepth } from './depths.js';
import { advanceSequence } from './sequenceClock.js';
import { report as reportDegrade } from './degradeReporter.js';
import { resolveAtlasKeyForPiece } from './atlasKeyResolve.js';
import { isCanvasRenderer, getOrCreateTintedTexture } from './canvasTintCache.js';

/**
 * Drop-in replacement for `spriteAvatar` at container index 1, depth 1.0 (design.md §5).
 * Extends Phaser.GameObjects.Container with a fixed pool of Image children sized to the
 * character's maximum per-frame piece count — no per-frame create/destroy.
 *
 * Not unit-tested directly: instantiating a Phaser GameObject requires a live Phaser.Scene
 * (WebGL/Canvas context), which this project's node-environment vitest setup deliberately
 * does not provide (design.md §8). Its pure logic (fallback resolution, sequence expansion,
 * pivot/registration-point math) lives in sibling modules that ARE unit-tested; this class is
 * exercised live in Slice 4's parity checks.
 */
class LayeredAvatar extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {{manifest: object, atlasKeys: {base: string, actions?: Map<string,string>}, avatarId: number, sceneScaleFactor?: number, palette?: Record<string,string>, onActionPackNeeded?: (packId: string) => Promise<string|null>}} config
     *   `palette` is the persisted (saved) slot map for this (user, avatarId) — e.g.
     *   `userData.avatar_palette?.[avatarId]` — or undefined/null when nothing was ever saved.
     *   `atlasKeys.actions` (design.md §13.3, tasks.md slice 15) is a `Map<packId, atlasKey>` —
     *   empty when no per-key action pack has loaded yet, gaining one entry per key once its
     *   own pack finishes loading. `onActionPackNeeded(packId)`, if provided, is invoked (once
     *   per distinct packId) the first time `play()` resolves a key backed by a not-yet-loaded
     *   pack, and must resolve to that pack's own atlas key once it has finished loading (or
     *   `null` on failure).
     */
    constructor(scene, x, y, { manifest, atlasKeys, avatarId, sceneScaleFactor = 1, palette, onActionPackNeeded }) {
        super(scene, x, y);

        this.isLayered = true;
        this._manifest = manifest;
        // Correction 2 (apply-progress.md's "Correction 2"): computed ONCE per avatar, not
        // per-frame — the WebGL hot path (`_tintChild`, called every `_applyFrame`) pays for
        // exactly one already-cached boolean read, never a fresh renderer-type lookup.
        this._isCanvasRenderer = isCanvasRenderer(scene);
        this._atlasKeys = { base: atlasKeys.base, actions: atlasKeys.actions || new Map() };
        this._avatarId = avatarId;
        // design.md §13.3: which sequence/alias/mirror keys are backed by an action pack,
        // mapped to the SPECIFIC packId that backs each one — computed once, independent of
        // load state.
        this._actionBackedKeys = computeActionBackedKeys(manifest);
        this._onActionPackNeeded = onActionPackNeeded || null;
        // design.md §13.3: per-packId request guard (was a single boolean) — different keys
        // need different packs requested independently, each with its own idempotent request.
        this._actionPackRequestedFor = new Set();
        // design.md §6: a monotonically increasing token, bumped on every play() call — the
        // staleness guard for a deferred (pack-loading) replay: the original key is only
        // re-played once the pack arrives if NO later play() has happened meanwhile.
        this._playToken = 0;
        this._z = null;
        this._sceneScaleFactor = sceneScaleFactor;
        this._palette = {};
        this._seqKey = null;
        // The key exactly as REQUESTED by the caller (design.md §9), e.g. "left_punch_rec" —
        // distinct from `_seqKey`, which may be alias/mirror-resolved (e.g.
        // "leftdown_punch_rec"). Every emitted `animationupdate`/`animationcomplete` `anim.key`
        // and the `anims.currentAnim` getter use THIS, because existing listeners
        // (UserUppercutAnimation.js:23-27) compare against the key they asked for — emitting
        // the resolved key would leave such a listener permanently dead.
        this._requestedKey = null;
        // The UNMIRRORED (canonical) key actually used to look up `sequences`/`frames` — e.g.
        // "leftdown_walk" when `_seqKey` is the mirrored "rightdown_walk". Accessories never
        // get synthesized mirror entries of their own (their compiled `anims{}` only has the
        // authored keys), so `_updateAccessory` must look them up by `_sourceKey`, not
        // `_seqKey` — see the live-validation defect 4/7 fix note on `play()`.
        this._sourceKey = null;
        this._seqFrames = [];
        this._seqIndex = 0;
        this._accum = 0;
        this._fps = 19;
        this._repeat = -1;
        this._playing = false;
        this._mirrored = false;
        // Hat/pet accessories driven in lockstep with the body's own frame clock (design.md
        // §5: "Implemented once, in LayeredAvatar.play(), so hat, pet and aura cannot
        // diverge"). Aura is NOT attached here — it is character-independent (ACC2) and runs
        // its own Phaser animation loop via AccessoryLayer.createAura().
        this._accessories = new Map(); // kind -> {sprite, manifest, atlasKey}
        this._originX = 0.5;
        this._originY = 0.5;

        // Façade completion (live-validation defect 4): several existing call sites read
        // `spriteAvatar.anims.currentAnim` / `.isPlaying` / `.stop()` directly
        // (UserMoveDeniedController.js, RemoveUserController.js, and the flag-gated
        // MovementControlsController.js debug tool) — a plain Sprite always has this object,
        // a bare Container never did. Built once here with live getters over this instance's
        // own state, matching what those call sites actually read.
        const self = this;
        this.anims = {
            // design.md §9: keyed on the REQUESTED key, not the alias/mirror-resolved
            // `_seqKey` — see `_requestedKey`'s field comment above.
            get currentAnim() {
                return self._requestedKey ? { key: `${self._avatarId}_${self._requestedKey}` } : null;
            },
            get isPlaying() {
                return self._playing;
            },
            stop() {
                self.stop();
            },
        };

        const maxPoolSize = LayeredAvatar.computeMaxPoolSize(manifest);
        this._pool = [];
        for (let i = 0; i < maxPoolSize; i++) {
            // Placeholder texture only — every pool child's real texture is set per-frame in
            // `_applyFrame` (resolved per-piece via `resolveAtlasKeyForPiece`) before it is
            // ever made visible, so which key is used here is immaterial.
            const child = scene.add.image(0, 0, this._atlasKeys.base);
            child.setOrigin(0, 0);
            child.setVisible(false);
            this.add(child);
            this._pool.push(child);
        }

        scene.add.existing(this);

        // Mirrors baked's `spriteAvatar.setScale(scaleFactor)` (AddUserController.js:227):
        // the container carries the scene's big-scene scale factor; Phaser composes it with
        // each child's own scale automatically, so per-piece math never re-applies it (see
        // the coordinate-space note on _applyFrame below).
        this.setScale(sceneScaleFactor);
        // Container.width/height default to 0 unless set explicitly (unlike a Sprite, which
        // derives them from its texture frame) — AddUserController.createContainerUser()
        // reads spriteAvatar.width/height for containerUser.setSize(), so this must be set.
        // Scaled into real-pixel (ss) space (live-validation defect fix): bodyBounds is
        // declared in logical units, but the game's own baked art already renders at native
        // ss:2 resolution — see resolveRenderPosition/scaleBodyBounds in pivot.js.
        const renderBounds = scaleBodyBounds(manifest.bodyBounds, manifest.ss);
        this.setSize(renderBounds.width, renderBounds.height);

        // Live-validation defect 3 fix: seed with the EFFECTIVE resolved palette (saved values
        // merged over manifest defaults via paletteResolve.resolvePalette — PAL5), not raw
        // manifest defaults. Previously this always seeded with `manifest.defaults` alone, so a
        // persisted palette was applied only after a live in-room change and never on scene
        // entry/reconnect (confirmed live: DB held a saved color1, the debug panel showed it,
        // but the rendered avatar showed the manifest default). Because every pool child starts
        // hidden and nothing is drawn until the first `play()`/`_applyFrame()` call below in
        // AddUserController.createAvatarSprite, seeding `this._palette` correctly here means
        // there is no flash of default colours — the first frame ever shown already uses the
        // resolved palette.
        this.applyPalette(resolvePalette(manifest, palette));
    }

    /**
     * Live defect fix (tasks.md slice 26): delegates to the standalone, unit-tested
     * `computeMaxPoolSize.js` (see its own docblock for the full defect account this closes —
     * this static method used to scan `manifest.frames` directly, which at construction time
     * holds ONLY the base pack's frames, silently under-sizing the pool for any action key
     * needing more pieces per frame than the base pack ever did). Kept as a static method for
     * API-surface stability — nothing about the class's own public contract changes.
     */
    static computeMaxPoolSize(manifest) {
        return computeMaxPoolSize(manifest);
    }

    static hexToInt(hex) {
        return parseInt(String(hex).replace('#', ''), 16);
    }

    /**
     * Body-only bounds (manifest.bodyBounds), excluding accessory children — so the name-tag
     * height calc (AddUserController.js:310-311) never moves when an accessory is worn. Scaled
     * into real-pixel (ss) space to match the baked renderer's actual atlas-frame dimensions
     * (live-validation defect fix — see resolveRenderPosition/scaleBodyBounds in pivot.js).
     */
    get frame() {
        return scaleBodyBounds(this._manifest.bodyBounds, this._manifest.ss);
    }

    /**
     * Sets `this._mirrored`, which `_applyFrame`/`_updateAccessory` use to decide whether to
     * reflect each piece/registration-point about the frame's own origin (`reflectSpan`/
     * `reflectPoint`, pivot.js) and flip its texture — NOT a separate mirrored pivot (`oMirror`
     * no longer exists in the compiled manifest; see pivot.js's `mirrorPivot` deprecation note).
     *
     * Ownership decision (live-validation follow-up, coordinator-flagged risk): `play()` is
     * the SOLE authority over `_mirrored` in normal operation — it re-derives the flag from
     * `manifest.mirrors` on every call, from the manifest data actually selected for the frame
     * about to render, so it can never disagree with what is drawn. This method exists only
     * for API-surface parity with a baked `Sprite`'s `setFlipX()` and is a plain, honest
     * setter — it does NOT re-resolve or validate against the current key. In the live
     * codebase today, no real animation caller ever reaches this method on a layered avatar:
     * `AnimationUtils.setSpriteConfig()`'s layered branch returns via `applyClipConfig()`
     * before it would call `setFlipX()` (see that method below), so the two would only ever
     * compete if some future caller invoked this directly. If that ever happens, whichever is
     * called LAST wins — call `play()` again afterward to make the manifest-derived value
     * authoritative again.
     */
    setFlipX(mirrored) {
        this._mirrored = !!mirrored;
        return this;
    }

    /**
     * No-op hook for AnimationUtils.setSpriteConfig's layered branch (design.md §5): unlike
     * baked sprites, a layered avatar has no window.avatars_config entry to read — play()
     * resolves position/scale/flip from the manifest for every frame.
     */
    applyClipConfig(_textureKey) {
        return this;
    }

    /**
     * design.md §13.3 (tasks.md slice 15): called once ONE specific per-key action pack has
     * finished loading (by the deferred-play callback below). Idempotent; a redundant call for
     * the same packId is harmless — `Map.set` on an already-loaded pack is a no-op overwrite
     * with the same value.
     */
    setActionsAtlasKey(packId, atlasKey) {
        this._atlasKeys.actions.set(packId, atlasKey);
        return this;
    }

    /**
     * Live-validation defect 4 fix: the animation façade was incomplete. `Phaser.GameObjects.
     * Container` (this class's real superclass) already provides `x`/`y`/`setPosition`/
     * `scene`/`setScale`/`destroy`/`depth`/`setDepth`/`setVisible`/`on`/`once`/
     * `parentContainer`/`scaleY`/`width`/`height`/`displayWidth`/`displayHeight` natively (the
     * last four via its `ComputedSize` mixin, correctly reflecting the ss-scaled `setSize()`
     * call in the constructor) — those were never missing. What WAS missing, confirmed by a
     * live `TypeError: user.spriteAvatar.stop is not a function` thrown from
     * `MoveUserController.js`'s tween `onComplete` (which aborted the rest of that handler,
     * so the avatar never returned to idle and appeared frozen): `stop()`, an `anims`-shaped
     * object (`currentAnim`, `isPlaying`, `stop()`), and a settable origin surface (Container's
     * own `originX`/`originY` are READ-ONLY, fixed at 0.5, with no `setOrigin()` at all — see
     * `phaser/src/gameobjects/container/Container.js`). All three are added below.
     */
    stop() {
        this._playing = false;
        return this;
    }

    /**
     * Origin is not a meaningful per-instance concept for a composite multi-piece avatar (each
     * piece already carries its own per-frame origin from the manifest) — this exists purely
     * so debug/admin tooling built against a baked `Sprite`'s `setOrigin()` (e.g.
     * `AvatarOriginSpriteModal.js`, gated behind `VITE_ANIMATION_AVATAR_EDITOR`) does not throw
     * when pointed at a layered avatar. It stores the values and nothing else reads them.
     */
    setOrigin(x = 0.5, y = x) {
        this._originX = x;
        this._originY = y;
        return this;
    }

    get originX() {
        return this._originX ?? 0.5;
    }

    get originY() {
        return this._originY ?? 0.5;
    }

    /**
     * Iterates the pool calling Phaser's built-in setTint per slot — no
     * rexColorReplacePipeline, zero additional GPU pipeline instances (design.md §5).
     */
    applyPalette(slots) {
        this._palette = { ...this._palette, ...slots };
        this._pool.forEach((child) => {
            if (!child.visible) return;
            const pieceId = child.getData('pieceId');
            if (!pieceId) return;
            this._tintChild(child, pieceId);
        });
        return this;
    }

    _tintChild(child, pieceId) {
        const piece = this._manifest.pieces[pieceId];
        if (!piece || !piece.slot) {
            child.clearTint();
            return;
        }
        // Live defect fix (tasks.md slice 26): `resolveTintHex` never returns falsy (see its own
        // docblock, paletteResolve.js) — a piece can be slot-tagged with neither a saved palette
        // value nor a manifest default (ninja/werewolf's own shape), and the old `if (!hex)
        // return` left such a piece showing its own raw, untinted grayscale-mask pixels instead
        // of any real colour.
        const hex = resolveTintHex(this._palette, this._manifest.defaults, piece.slot);

        // Correction 2 (apply-progress.md's "Correction 2"): under Phaser's Canvas renderer,
        // `setTint()` is a documented no-op (`CanvasRenderer#batchSprite` draws via a plain
        // `ctx.drawImage`, never reading `tint`/`tintTopLeft`) — a real player with no WebGL, or
        // with the `phaser_type: "canvas"` per-user setting `App.vue` reads, would otherwise see
        // every slotted run as its raw, untinted white mask. The WebGL path below is BYTE-FOR-
        // BYTE unchanged (still one `setTint()` call, zero extra pipeline cost) — this branch
        // only ever runs for a renderer that already cannot use `setTint()` at all.
        if (this._isCanvasRenderer) {
            const atlasKey = resolveAtlasKeyForPiece(this._atlasKeys, piece.pack);
            const tintedKey = getOrCreateTintedTexture(this.scene, atlasKey, pieceId, hex);
            if (tintedKey) {
                child.setTexture(tintedKey);
            }
            return;
        }
        child.setTint(LayeredAvatar.hexToInt(hex));
    }

    /**
     * Registers a hat/pet accessory sprite to be driven from this avatar's own frame clock
     * (ACC1, ACC4). `sprite` is a plain Phaser Image/Sprite already parented to the SAME
     * container (`containerUser`) this LayeredAvatar sits in — not a child of this Container —
     * so accessory z-order stays governed by design.md §1's explicit depth table rather than
     * this class's own pooled-child depths (0..L.length-1).
     */
    attachAccessory(kind, sprite, manifest, atlasKey) {
        this._accessories.set(kind, { sprite, manifest, atlasKey, kind });
        if (this._seqFrames.length > 0) {
            this._updateAccessory(kind);
        }
    }

    detachAccessory(kind) {
        this._accessories.delete(kind);
    }

    /**
     * Hybrid fallback (ACC4): the resolved key is handed to every worn accessory. If the
     * accessory package covers it, play the matching frame in sync with the body; otherwise
     * hide it for the duration rather than render frame indices from an unrelated animation.
     */
    _updateAccessory(accessoryKind) {
        const entry = this._accessories.get(accessoryKind);
        if (!entry || !this._seqKey) return;
        const { sprite, manifest, atlasKey } = entry;

        // Live-validation defect 7 fix: an accessory package NEVER declares a synthesized
        // mirrored key in its own `anims{}` (only the compiled body manifest gets a `mirrors`
        // table — Slice 9/10 compile only the 15 authored keys per accessory). Looking the
        // accessory up by `_seqKey` (e.g. "rightdown_walk") therefore always missed, hiding
        // the hat/pet for every mirrored direction. `_sourceKey` is the canonical
        // (unmirrored) key both the body AND the accessory actually declare frames under
        // (e.g. "leftdown_walk") — `_mirrored` below still flips the accessory's own texture
        // and pivot the same way the body does.
        if (!accessoryFollows(manifest.anims, this._sourceKey)) {
            sprite.setVisible(false);
            return;
        }

        // Live-reported defect fix (user: hat/pet disappearing and reappearing mid-animation,
        // see fallback.js's resolveAccessoryFrameId docblock for the full root-cause account
        // and the real compiled-data evidence): the accessory's OWN frame array is frequently
        // SHORTER than the body's for a given key (compile-accessory.cjs derives it from the
        // accessory's own source data, independent of the body's frame count) — indexing it
        // directly with the body's `_seqIndex` used to return `undefined` past the accessory's
        // own last frame, hiding it for the remainder of that animation. Clamping (never
        // cycling back to index 0 — see the docblock for why) keeps the accessory visible,
        // holding its own last authored frame for the rest of the body's cycle.
        const accFid = resolveAccessoryFrameId(this._seqIndex, manifest.anims[this._sourceKey].frames);
        const accFrame = manifest.frames[String(accFid)];
        if (!accFrame) {
            sprite.setVisible(false);
            return;
        }

        const bodyFid = this._seqFrames[this._seqIndex];
        const bodyFrame = this._manifest.frames[String(bodyFid)];
        if (!bodyFrame) {
            sprite.setVisible(false);
            return;
        }
        // Live-validation defect 8 fix, root-cause corrected: the body's OWN mirroring used to
        // choose between `bodyFrame.o` and `bodyFrame.oMirror` (the latter reflecting about the
        // bodyBounds bounding-box centre, not the frame's own anchor — measured live to drift
        // the character up to 56.8 real px sideways of its own shadow). `oMirror` is no longer
        // part of the runtime contract at all (see pivot.js's `mirrorPivot` deprecation note):
        // the body ALWAYS subtracts its own `o`, and mirroring is now applied by reflecting each
        // piece/registration-point about `o.x` instead of computing a second origin. An
        // accessory must use the SAME (always-`o`) origin the body now uses, or it would
        // desync from wherever the body actually renders.
        const bodyOrigin = bodyFrame.o;

        // Live-validation defect 10 fix: resolveAccessoryPlacement's geometric-centre X anchor
        // needs the accessory's own currently-set NATIVE (unscaled) frame size — set the texture
        // FIRST so `sprite.frame.width/height` (Phaser's own, always-native atlas-frame values,
        // unaffected by any scale already on the sprite) are available before computing where to
        // place it.
        sprite.setTexture(atlasKey, String(accFid));

        // resolveAccessoryPlacement (pivot.js) encodes the corrected contract: hat and pet
        // resolve position/origin/flip IDENTICALLY (both body-origin-relative — a second
        // "pet is different" branch was tried and found wrong live, see its docblock's "Root
        // -cause correction 2"); the only kind-specific behaviour left is the depth-flip sign
        // and the two pet-only corrections (ground contact, silhouette clearing) applied below.
        //
        // Live-reported defect fix (user: "cuando me pegan la animacion el pet tambien se mueve
        // de posicion" — the pet/hat desyncs from the body while the local player is on the
        // receiving end of a punch): `this.x`/`this.y` are threaded through as the container
        // offset (pivot.js's own docblock has the full root-cause account and the live numeric
        // trace that proved it) — every hat/pet position was silently assuming this Container's
        // own transform always sits at (0, 0), which `UserUppercutAnimation.launchUpwards`
        // violates by tweening `spriteAvatar.y` directly to fly the body upward on knockback.
        // The body's pooled pieces are real children of THIS Container so they move with it for
        // free; the accessory sprites are siblings in `containerUser`, so without this term they
        // stayed frozen at the ground position while the body flew away from them.
        const { x, y, scale, relativeY, originX, originY, flipX } = resolveAccessoryPlacement(
            manifest.kind,
            accFrame,
            bodyOrigin,
            manifest.ss,
            manifest.base && manifest.base.scale,
            this._mirrored,
            { width: sprite.frame.width, height: sprite.frame.height },
            manifest.base && manifest.base.groundOffsetY,
            undefined,
            this.x,
            this.y
        );

        let finalX = x;

        if (accessoryKind === 'pet') {
            // Live-validation defect 12 fix, now design.md §8's unconditional per-side clamp
            // (decision 6, a deliberate reversal — see resolvePetSideX's docblock): the pet
            // must remain on its manifest-DECLARED canonical side across all 8 directions, not
            // "whichever side it is already closer to". `base.side` is written by
            // compile-accessory.cjs's pet-side derivation for every pet package compiled after
            // this change; a package compiled before it (or missing `side` for any reason)
            // fails loudly here rather than silently defaulting to one side.
            const side = manifest.base && manifest.base.side;
            if (side !== 'left' && side !== 'right') {
                throw new Error(
                    `LayeredAvatar: pet accessory manifest is missing a valid base.side ("left"|"right") — recompile with the pet-side derivation (design.md §8).`
                );
            }
            const bodyBounds = computeBodyBoundsX(
                bodyFrame.L,
                this._manifest.pieces,
                bodyOrigin,
                this._manifest.ss,
                this._mirrored
            );
            const halfWidth = (sprite.frame.width * scale) / 2;
            // `x` above already carries `this.x` (the container-offset fix); `bodyBounds` does
            // not (computeBodyBoundsX has no such term, since the body's own pieces are real
            // children of this Container and never need one) — shifting the clamp bounds by the
            // SAME `this.x` keeps both sides of the comparison in the same coordinate space, so
            // the clamp still holds during a horizontal container offset, not just the vertical
            // one the live-reported defect above was proven against.
            finalX = resolvePetSideX(x, halfWidth, bodyBounds.minX + this.x, bodyBounds.maxX + this.x, side);
        }

        sprite.setOrigin(originX, originY);
        sprite.setFlipX(flipX);
        sprite.setPosition(finalX, y);
        sprite.setScale(scale);

        if (accessoryKind === 'pet') {
            // ACC5/design.md §2: petDepth = resolveAccessoryDepth('pet', {relativeY}) — 1.60
            // in front, 0.5 behind (was 1.5/0.5; 1.5 collided with the hat's 1.0+zBias band
            // before zBias was clamped, design.md §2). Computed from the same registration
            // point pivot.js already resolves, no extra state. A pet "below" the body's anchor
            // (further from camera-up, i.e. nearer the viewer in this isometric convention)
            // draws in front; otherwise behind. Decision (defect 12, documented in
            // apply-progress.md): the pet stays behind or in front per this SAME existing rule
            // once it no longer overlaps the body horizontally — being behind is fine, and
            // probably correct, for a pet standing slightly further from the camera; what was
            // wrong was the overlap itself (fixed above), not the depth choice.
            sprite.setDepth(resolveAccessoryDepth('pet', { relativeY }));
        } else {
            const zBias = accFrame.zBias ?? (manifest.base && manifest.base.zBias) ?? 0;
            sprite.setDepth(resolveAccessoryDepth('hat', { zBias }));
        }
        sprite.setVisible(true);
    }

    _updateAllAccessories() {
        this._accessories.forEach((_entry, kind) => this._updateAccessory(kind));

        // Live-validation defects 5/6 fix (z-order): `Phaser.GameObjects.Container` does NOT
        // sort its children by `.depth` — that only happens on the top-level Scene display
        // list. A Container renders `this.list` in plain array-insertion order every frame
        // (verified against `phaser/src/gameobjects/container/ContainerWebGLRenderer.js`: it
        // iterates `container.list` with a straight `for` loop, never reading `.depth`).
        // `sort('depth')` is a manual, on-demand method — the design's assumption that
        // "Container already re-sorts on a child setDepth" was wrong; today's baked 0/1/2/3
        // order only ever looked correct because those four children happened to be inserted
        // into the array in that same order. Since the pet's depth flips every frame and a
        // hat's zBias can change when its direction switches between front/back-facing, the
        // safe, general fix is to re-sort every time an accessory's depth might have changed,
        // rather than relying on array-insertion order matching intent.
        if (this.parentContainer && typeof this.parentContainer.sort === 'function') {
            this.parentContainer.sort('depth');
        }
    }

    /**
     * Resolves `${avatarId}_${textureKey}` (the shape every animation class already calls
     * with) through sequence.js + fallback.js, then applies the first resolved frame.
     */
    play(key, ignoreIfPlaying = false) {
        this._playToken += 1;
        const myPlayToken = this._playToken;

        const prefix = `${this._avatarId}_`;
        const textureKey = key.startsWith(prefix) ? key.slice(prefix.length) : key;
        const direction = textureKey.split('_')[0];
        // design.md §13.3: per-key granularity — a key is "unloaded" only while ITS OWN
        // specific pack has not finished loading, not merely "some pack". resolveAnimationKey
        // degrades those to the fallback chain with the distinguishable `reason: 'pack-loading'`
        // instead of a silent no-op.
        const unloadedKeys = new Set();
        for (const [backedKey, packId] of this._actionBackedKeys) {
            if (!this._atlasKeys.actions.has(packId)) unloadedKeys.add(backedKey);
        }
        // Live-validation defect 4/7 fix: `mirrors` must be passed through so a synthesized
        // right-facing key (never a member of `sequences`) is recognised as covered instead of
        // falling all the way through to the static `down_idle` — see fallback.js's
        // resolveAnimationKey docblock for the full root-cause account. `aliases` (design.md
        // §5.5, fact I) resolves a direction-less emote name (e.g. "risa1") to its authored
        // sequence (e.g. "down_risa1") BEFORE the fallback chain. `degraded`/`reason` make the
        // substitution observable (design.md §9 success criterion 3) instead of a silent key
        // swap.
        const { resolvedKey, degraded, reason } = resolveAnimationKey(
            this._manifest.sequences,
            textureKey,
            direction,
            this._manifest.mirrors,
            this._manifest.aliases,
            unloadedKeys
        );

        if (degraded) {
            reportDegrade({ avatarId: this._avatarId, requestedKey: textureKey, resolvedKey, reason });
        }

        // design.md §13.3: deferred play + staleness guard, per PACK now rather than a single
        // global gate. Start the load for THIS SPECIFIC pack (once per packId — idempotent via
        // `_actionPackRequestedFor`), play the degraded fallback meanwhile (below, unchanged),
        // and replay the ORIGINAL requested key once the pack arrives — but ONLY if no later
        // play() call has happened in the meantime (`_playToken` no longer matches).
        //
        // Live-discovered defect fix: `resolvedKey` has ALREADY been overwritten to the
        // fallback key (e.g. "down_idle") by the pack-loading override above, by the time this
        // runs — looking `_actionBackedKeys` up by `resolvedKey` here always misses (a base
        // fallback key is never action-backed), so `onActionPackNeeded` was silently never
        // called. `textureKey` (the RAW requested key, pre-resolution) is itself always one of
        // `_actionBackedKeys`' three key forms (a direct sequence key, an alias key, or a
        // mirror key all self-index that map) whenever `reason === 'pack-loading'` can fire at
        // all, so it is the correct lookup — confirmed live via a real (Playwright) load-race
        // reproduction before this fix (R8/R12 hung waiting on a pack that was never requested).
        if (reason === 'pack-loading' && this._onActionPackNeeded) {
            const packId = this._actionBackedKeys.get(textureKey);
            if (packId && !this._actionPackRequestedFor.has(packId)) {
                this._actionPackRequestedFor.add(packId);
                Promise.resolve(this._onActionPackNeeded(packId))
                    .then((actionsAtlasKey) => {
                        if (!actionsAtlasKey) return;
                        this.setActionsAtlasKey(packId, actionsAtlasKey);
                        if (this._playToken === myPlayToken) {
                            this.play(key, false);
                        }
                    })
                    .catch(() => {
                        // Best-effort: a failed action-pack load must never throw into the
                        // caller; the avatar simply stays on its degraded fallback.
                    });
            }
        }

        if (ignoreIfPlaying && this._playing && this._seqKey === resolvedKey) {
            return this;
        }

        // sourceKey is the canonical `sequences` key `resolvedKey` actually plays: a mirror
        // resolves to its `from` source, an alias resolves to the sequence it names, and a
        // direct match/fallback is already a `sequences` key.
        const mirrorInfo = this._manifest.mirrors ? this._manifest.mirrors[resolvedKey] : undefined;
        const aliasSource = this._manifest.aliases ? this._manifest.aliases[resolvedKey] : undefined;
        const sourceKey = mirrorInfo ? mirrorInfo.from : aliasSource || resolvedKey;
        const seqMeta = this._manifest.sequences[sourceKey];
        const frames = expandSequence(this._manifest.sequences, sourceKey) || [];

        // design.md §9: recorded BEFORE any fallback/alias/mirror resolution touches
        // `resolvedKey` — this is the raw key the caller asked for, textureKey (post
        // avatarId-prefix-stripping), used verbatim by every emitted event and by
        // `anims.currentAnim` above.
        this._requestedKey = textureKey;
        this._seqKey = resolvedKey;
        this._sourceKey = sourceKey;
        this._seqFrames = frames;
        this._seqIndex = 0;
        this._accum = 0;
        this._fps = seqMeta ? seqMeta.fps : 19;
        this._repeat = seqMeta ? seqMeta.repeat : -1;
        // `play()` is the SOLE owner of `_mirrored` (live-validation follow-up finding): it is
        // always re-derived here from the manifest's own `mirrors` table for whatever key was
        // just resolved, so it can never disagree with the frame data currently selected. See
        // `setFlipX()`'s docblock for why an external caller cannot desync this.
        this._mirrored = !!(mirrorInfo && mirrorInfo.flipX);
        this._playing = frames.length > 0;

        if (this._playing) {
            this._applyFrame(frames[0]);
        }
        return this;
    }

    /**
     * Advances the animation clock by `delta` ms. Driven by LayeredAvatarRegistry's single
     * scene-level tick (design.md §5 cost 3), not a per-avatar timer. The frame-advance math
     * itself lives in the pure `advanceSequence` (sequenceClock.js, unit-tested there); this
     * method applies each visited frame and emits the two animation events (design.md §9).
     */
    tick(delta) {
        if (!this._playing || this._seqFrames.length <= 1) return;

        const result = advanceSequence(
            {
                seqIndex: this._seqIndex,
                accum: this._accum,
                fps: this._fps,
                repeat: this._repeat,
                frameCount: this._seqFrames.length,
            },
            delta
        );
        this._accum = result.accum;

        const emitKey = { key: `${this._avatarId}_${this._requestedKey}` };

        if (result.completed) {
            // design.md §9: emitted AFTER `_playing = false`, so a listener that calls play()
            // from inside the handler re-enters a consistent (not-playing) state.
            this._playing = false;
            this.emit('animationcomplete', emitKey, { index: this._seqIndex + 1 }, this);
            return;
        }

        result.visited.forEach((visitedIndex) => {
            this._seqIndex = visitedIndex;
            this._applyFrame(this._seqFrames[this._seqIndex]);
            // 1-based frame.index, matching Phaser — what the existing `frame.index === 160`
            // check depends on.
            this.emit('animationupdate', emitKey, { index: this._seqIndex + 1 }, this);
        });
    }

    /**
     * Layer order is immutable: pool index === L index === child depth. No comparator, no
     * sort, no insertion-order dependency (LR4). Per-frame origin is the anchor: subtracting
     * origin positions every piece relative to the declared `o` (LR2).
     *
     * Coordinate-space note — CORRECTED after live-validation found the layered avatar
     * rendering at half the correct size. The compiler's `dx`/`dy`/`o`/`bodyBounds` values are
     * LOGICAL (pre-supersampling) units, matching config.json's declared "frameWidth"/
     * "frameHeight" numbers — but the baked renderer does NOT scale by those logical numbers at
     * all; it draws the full supersampled atlas texture directly (measured live: rasta's real
     * baked `down_idle` atlas frame is 162x196px, double config.json's declared 81x98). The
     * game's own art space is already ss:2 native. So pieces here render at NATIVE scale (1,
     * not `1/ss`), and every logical position is scaled into that same real-pixel space via
     * `resolveRenderPosition()` (pivot.js) — the earlier `bodyBounds.w == baked frameWidth`
     * cross-check matched the LOGICAL number on both sides, which is why it looked correct
     * while the rendered result was visually half-size on screen. The scene's big-scale factor
     * is still carried once by the container itself (constructor), not re-applied per piece.
     *
     * Mirroring — CORRECTED again after live-validation found the character itself drifting
     * sideways off its own shadow, worse on mirrored (right-facing) directions (up to 56.8 real
     * px, measured against the real compiled rasta manifest across all `left*`-family poses).
     * The origin is now ALWAYS `f.o` — `f.oMirror` (reflecting about the bodyBounds
     * bounding-box centre, `bodyBoundsW - o.x`) is no longer read at all, because that axis is
     * wrong: it is only correct when a frame's own `o.x` happens to sit at `bodyBoundsW / 2`
     * (true, by coincidence, for `down`/`up`-family poses; off by 35-57 real px for `left*`
     * poses). Mirroring is applied instead by reflecting each PIECE about the frame's own
     * `o.x` via `reflectSpan` (pivot.js) — which accounts for the piece's own width, so the
     * piece's FAR edge reflects to where an un-reflected piece's near edge would be — and
     * flipping its texture (`setFlipX`) so the artwork faces the correct way too. This keeps
     * the anchor (`o.x`, the point the shadow/name-tag/container are keyed off) fixed at local
     * x=0 for every direction, mirrored or not, and makes a mirrored frame a TRUE reflection of
     * its source (verified: mirrored bounding-box width now exactly matches the source's, and
     * its centre is exactly the negation of the source's centre — previously the same width was
     * preserved only because the old code was a rigid translation of the unmirrored piece
     * layout, not a reflection, which is what let the anchor itself drift).
     */
    _applyFrame(fid) {
        const f = this._manifest.frames[String(fid)];
        if (!f) return;
        const origin = f.o;
        const ss = this._manifest.ss;

        f.L.forEach((l, i) => {
            const child = this._pool[i];
            if (!child) return;
            const piece = this._manifest.pieces[l.p];
            if (!piece) return;
            // design.md §13.7 (tasks.md slice 20): a piece compiled at ss:1 (the measurement-
            // driven override for an over-budget action key) occupies the SAME on-screen size
            // and position an ss:2 piece would — only its own native raster density is lower.
            // `pieceSs` resolves that per PIECE (via its own `pack`), never per character, since
            // one compiled character can mix ss:2 and ss:1 pieces across different action keys.
            const pieceSs = resolvePieceSs(this._manifest.ssOverrides, piece.pack, ss);
            const dx = this._mirrored
                ? reflectSpan(l.dx, piece.frame.w / pieceSs, origin[0])
                : l.dx;
            const [x, y] = resolveRenderPosition([dx, l.dy], origin, ss);
            // design.md §13.3 (tasks.md slice 15): resolved per piece — `piece.pack` is
            // `'base'` or a specific per-key action packId (`compile-layered-avatar.cjs`), so
            // each compiled action key can live in its own Phaser atlas without any other
            // change to this method. `page` is not part of this resolution — Phaser's own
            // `setTexture(atlasKey, frameName)` disambiguates by frame name within one atlas
            // key regardless of how many physical pages compose it.
            child.setTexture(resolveAtlasKeyForPiece(this._atlasKeys, piece.pack), l.p);
            child.setPosition(x, y);
            child.setFlipX(this._mirrored);
            // design.md §13.7: an ss:1 piece's native texture is HALF the pixel count an ss:2
            // piece of the same logical size would be — `ss / pieceSs` (1 normally, 2 for an
            // ss:1 piece) upsamples it back to the project's shared ss:2 real-pixel-space
            // convention so its ON-SCREEN size and position stay identical to what an ss:2
            // raster would show; only its own crispness is lower (the accepted density
            // tradeoff, design.md §13.7/tasks.md slice 20 task 6 — not a size change).
            child.setScale(ss / pieceSs);
            child.setVisible(true);
            child.setDepth(i);
            child.setData('pieceId', l.p);
            this._tintChild(child, l.p);
        });

        for (let i = f.L.length; i < this._pool.length; i++) {
            // Defensive fix (live-validation follow-up finding): Phaser.GameObjects.Container's
            // own getBounds() (phaser/src/gameobjects/container/Container.js) unions every
            // child's bounds regardless of `.visible` — it never checks visibility at all. A
            // hidden pool child (this fixed pool is sized to the character's MAXIMUM per-frame
            // piece count, design.md §5 cost 8) therefore keeps contributing its LAST-assigned,
            // now-stale position/texture-size to any getBounds() call, even though it draws
            // nothing. This was confirmed to be the exact cause of a live measurement appearing
            // to show mirrored directions "spreading" the body's bounding box (width changing
            // between a direction and its mirror) — a getBounds() measurement artifact, not a
            // real rendering defect (replaying the actual per-frame math for VISIBLE pieces only
            // shows mirrored width exactly equals source width, in every case). Resetting a
            // hidden child's position to the local origin does not change anything a player
            // sees (it is invisible either way) but collapses its stale contribution to
            // getBounds() from "anywhere within the character's silhouette" down to a small
            // region right at the anchor, so any future bounds-based tooling is not misled by
            // frames with fewer pieces than the pool's maximum.
            this._pool[i].setVisible(false);
            this._pool[i].setPosition(0, 0);
        }

        this._updateAllAccessories();
    }
}

export default LayeredAvatar;
