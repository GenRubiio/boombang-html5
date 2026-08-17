/**
 * Factory for accessory child display objects added to `containerUser` (design.md §1 z-order
 * table). Not unit-tested directly for the same reason as LayeredAvatar.js (design.md §8): it
 * only calls live Phaser scene/animation APIs. Kind-specific creation keeps each accessory's
 * anchor/depth rule in one place so hat, pet and aura cannot diverge.
 */
class AccessoryLayer {
    /**
     * Aura: depth 0.2 (above the shadow, behind the body — design.md §1), own anchor
     * independent of the wearer's character body pivots (ACC2) — anchor comes straight from
     * the accessory manifest, never from the body's bodyBounds/frame origin data.
     */
    static createAura(gameScene, atlasKey, manifest) {
        const anchor = manifest.anchor || [0.5, 0.85];
        const sprite = gameScene.add.sprite(0, 0, atlasKey, manifest.frames[0]);
        sprite.setOrigin(anchor[0], anchor[1]);
        sprite.setDepth(0.2);
        sprite.isAccessory = true;
        sprite.accessoryKind = 'aura';

        const animKey = `acc_aura_${manifest.key}`;
        if (!gameScene.anims.exists(animKey)) {
            gameScene.anims.create({
                key: animKey,
                frames: manifest.frames.map((frameName) => ({ key: atlasKey, frame: frameName })),
                frameRate: manifest.fps,
                repeat: -1,
            });
        }
        sprite.play(animKey);
        return sprite;
    }

    /**
     * Hat: depth `1.0 + zBias` (default `+0.5`, design.md §1). A bare Image placeholder is
     * created here; LayeredAvatar.attachAccessory() drives its texture/position/depth every
     * frame in lockstep with the body (ACC1, ACC4) — this factory just creates the display
     * object and hands it off, mirroring how the aura factory owns its own animation instead.
     */
    static createHatPlaceholder(gameScene, atlasKey) {
        const sprite = gameScene.add.image(0, 0, atlasKey);
        sprite.setVisible(false);
        sprite.isAccessory = true;
        sprite.accessoryKind = 'hat';
        return sprite;
    }

    /**
     * Pet: depth flips 0.5/1.5 (design.md §1, ACC5) — driven per frame by
     * LayeredAvatar._updateAccessory() from the registration point's resolved Y sign, exactly
     * like the hat's zBias but with a dynamic rather than fixed depth.
     */
    static createPetPlaceholder(gameScene, atlasKey) {
        const sprite = gameScene.add.image(0, 0, atlasKey);
        sprite.setVisible(false);
        sprite.isAccessory = true;
        sprite.accessoryKind = 'pet';
        return sprite;
    }
}

export default AccessoryLayer;
