import Phaser from 'phaser';
import { resolveFallbackKey, accessoryFollows } from './fallback.js';
import { expandSequence } from './sequence.js';
import {
    resolveRenderPosition,
    scaleBodyBounds,
    resolveAccessoryPlacement,
    reflectSpan,
    computeBodyBoundsX,
    clearBodySilhouetteX,
} from './pivot.js';
import { resolvePalette } from './paletteResolve.js';

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
     * @param {{manifest: object, atlasKey: string, avatarId: number, sceneScaleFactor?: number, palette?: Record<string,string>}} config
     *   `palette` is the persisted (saved) slot map for this (user, avatarId) — e.g.
     *   `userData.avatar_palette?.[avatarId]` — or undefined/null when nothing was ever saved.
     */
    constructor(scene, x, y, { manifest, atlasKey, avatarId, sceneScaleFactor = 1, palette }) {
        super(scene, x, y);

        this.isLayered = true;
        this._manifest = manifest;
        this._atlasKey = atlasKey;
        this._avatarId = avatarId;
        this._z = null;
        this._sceneScaleFactor = sceneScaleFactor;
        this._palette = {};
        this._seqKey = null;
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
            get currentAnim() {
                return self._seqKey ? { key: `${self._avatarId}_${self._seqKey}` } : null;
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
            const child = scene.add.image(0, 0, atlasKey);
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

    static computeMaxPoolSize(manifest) {
        let max = 0;
        for (const fid of Object.keys(manifest.frames || {})) {
            max = Math.max(max, manifest.frames[fid].L.length);
        }
        return max;
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
        const hex = this._palette[piece.slot] ?? this._manifest.defaults[piece.slot];
        if (hex) child.setTint(LayeredAvatar.hexToInt(hex));
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

        const accFid = manifest.anims[this._sourceKey].frames[this._seqIndex];
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
        const { x, y, scale, relativeY, originX, originY, flipX } = resolveAccessoryPlacement(
            manifest.kind,
            accFrame,
            bodyOrigin,
            manifest.ss,
            manifest.base && manifest.base.scale,
            this._mirrored,
            { width: sprite.frame.width, height: sprite.frame.height },
            manifest.base && manifest.base.groundOffsetY
        );

        let finalX = x;

        if (accessoryKind === 'pet') {
            // Live-validation defect 12 fix: the pet was rendering entirely inside the body's
            // own silhouette ("appears under the leg"). Clear it against THIS frame's actual
            // body extent (not a global constant), mirrored consistently with the body itself.
            const bodyBounds = computeBodyBoundsX(
                bodyFrame.L,
                this._manifest.pieces,
                bodyOrigin,
                this._manifest.ss,
                this._mirrored
            );
            const halfWidth = (sprite.frame.width * scale) / 2;
            finalX = clearBodySilhouetteX(x, halfWidth, bodyBounds.minX, bodyBounds.maxX);
        }

        sprite.setOrigin(originX, originY);
        sprite.setFlipX(flipX);
        sprite.setPosition(finalX, y);
        sprite.setScale(scale);

        if (accessoryKind === 'pet') {
            // ACC5/design.md §1: petDepth = (resolvedRegY >= 0) ? 1.5 : 0.5 — computed from
            // the same registration point pivot.js already resolves, no extra state. A pet
            // "below" the body's anchor (further from camera-up, i.e. nearer the viewer in
            // this isometric convention) draws in front; otherwise behind. Decision (defect 12,
            // documented in apply-progress.md): the pet stays behind (0.5) or in front (1.5) per
            // this SAME existing rule once it no longer overlaps the body horizontally — being
            // behind is fine, and probably correct, for a pet standing slightly further from the
            // camera; what was wrong was the overlap itself (fixed above), not the depth choice.
            sprite.setDepth(relativeY >= 0 ? 1.5 : 0.5);
        } else {
            const zBias = accFrame.zBias ?? (manifest.base && manifest.base.zBias) ?? 0;
            sprite.setDepth(1.0 + zBias);
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
        const prefix = `${this._avatarId}_`;
        const textureKey = key.startsWith(prefix) ? key.slice(prefix.length) : key;
        const direction = textureKey.split('_')[0];
        // Live-validation defect 4/7 fix: `mirrors` must be passed through so a synthesized
        // right-facing key (never a member of `sequences`) is recognised as covered instead of
        // falling all the way through to the static `down_idle` — see fallback.js's
        // resolveFallbackKey docblock for the full root-cause account.
        const resolvedKey = resolveFallbackKey(
            this._manifest.sequences,
            textureKey,
            direction,
            this._manifest.mirrors
        );

        if (ignoreIfPlaying && this._playing && this._seqKey === resolvedKey) {
            return this;
        }

        const mirrorInfo = this._manifest.mirrors ? this._manifest.mirrors[resolvedKey] : undefined;
        const sourceKey = mirrorInfo ? mirrorInfo.from : resolvedKey;
        const seqMeta = this._manifest.sequences[sourceKey];
        const frames = expandSequence(this._manifest.sequences, sourceKey) || [];

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
     * scene-level tick (design.md §5 cost 3), not a per-avatar timer.
     */
    tick(delta) {
        if (!this._playing || this._seqFrames.length <= 1) return;
        this._accum += delta;
        const frameDuration = 1000 / this._fps;
        while (this._accum >= frameDuration) {
            this._accum -= frameDuration;
            const nextIndex = this._seqIndex + 1;
            if (nextIndex >= this._seqFrames.length) {
                if (this._repeat === 0) {
                    this._playing = false;
                    return;
                }
                this._seqIndex = 0;
            } else {
                this._seqIndex = nextIndex;
            }
            this._applyFrame(this._seqFrames[this._seqIndex]);
        }
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
            const dx = this._mirrored
                ? reflectSpan(l.dx, piece.frame.w / ss, origin[0])
                : l.dx;
            const [x, y] = resolveRenderPosition([dx, l.dy], origin, ss);
            child.setTexture(this._atlasKey, l.p);
            child.setPosition(x, y);
            child.setFlipX(this._mirrored);
            child.setScale(1);
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
