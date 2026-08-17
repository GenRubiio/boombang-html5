import accessoryManager from "../../managers/AccessoryManager.js";
import gameConfig from "@/config/gameConfig.js";

/**
 * Applies an accepted accessory-change broadcast in-room, without a full sprite replacement
 * of the body (avatar-look-protocol spec). Resolves the target directly through
 * `gameScene.users[socketId]`, matching UserChangePaletteController.js's targeting fix
 * (PROTO3).
 */
class UserChangeAccessoryController {
    static async main(gameScene, data) {
        const user = gameScene.users[data.socketId];
        if (!user) return;

        if (!user.accessories) user.accessories = {};
        user.accessories[data.kind] = data.value;

        // LR6: no accessory child sprites are created with the flag off (design.md §1 ships
        // this whole visible surface behind VITE_LAYERED_AVATARS) — the equipped state is
        // still tracked above so it applies correctly once the flag is re-enabled.
        if (!gameConfig.LAYERED_AVATARS) return;

        if (data.kind === 'aura') {
            await this.applyAura(gameScene, user, data.value);
        } else if (data.kind === 'hat') {
            await this.applyHat(gameScene, user, data.value);
        } else if (data.kind === 'pet') {
            await this.applyPet(gameScene, user, data.value);
        }
    }

    static async applyPet(gameScene, user, petKey) {
        const container = user.containerUser;
        const spriteAvatar = user.spriteAvatar;
        if (!container || !spriteAvatar?.isLayered) return;

        const existing = container.list.find((child) => child.accessoryKind === 'pet');
        if (existing) {
            spriteAvatar.detachAccessory('pet');
            container.remove(existing, true);
        }

        if (!petKey || !accessoryManager.hasPackage('pet', petKey)) {
            return;
        }

        try {
            const { default: AccessoryLayer } = await import("../../layered/AccessoryLayer.js");
            await accessoryManager.load(gameScene, 'pet', petKey);
            const manifest = accessoryManager.getManifest('pet', petKey);
            const atlasKey = accessoryManager.getAtlasKey('pet', petKey);
            if (manifest) {
                const petSprite = AccessoryLayer.createPetPlaceholder(gameScene, atlasKey);
                spriteAvatar.attachAccessory('pet', petSprite, manifest, atlasKey);
                container.add(petSprite);
                // Live-validation defects 5/6 fix: container.add() appends to the END of the
                // child array regardless of .depth, which Container never sorts by on its own
                // (see LayeredAvatar._updateAllAccessories()'s docblock) — without this the
                // newly-equipped pet would render on top of the name tag until the next body
                // frame tick re-sorts it.
                container.sort('depth');
            }
        } catch (err) {
            console.warn('[UserChangeAccessoryController] failed to apply pet', petKey, err);
        }
    }

    static async applyHat(gameScene, user, hatKey) {
        const container = user.containerUser;
        const spriteAvatar = user.spriteAvatar;
        if (!container || !spriteAvatar?.isLayered) return;

        const existing = container.list.find((child) => child.accessoryKind === 'hat');
        if (existing) {
            spriteAvatar.detachAccessory('hat');
            container.remove(existing, true);
        }

        if (!hatKey || !accessoryManager.hasPackage('hat', hatKey)) {
            return;
        }

        try {
            const { default: AccessoryLayer } = await import("../../layered/AccessoryLayer.js");
            await accessoryManager.load(gameScene, 'hat', hatKey);
            const manifest = accessoryManager.getManifest('hat', hatKey);
            const atlasKey = accessoryManager.getAtlasKey('hat', hatKey);
            if (manifest) {
                const hatSprite = AccessoryLayer.createHatPlaceholder(gameScene, atlasKey);
                spriteAvatar.attachAccessory('hat', hatSprite, manifest, atlasKey);
                container.add(hatSprite);
                container.sort('depth');
            }
        } catch (err) {
            console.warn('[UserChangeAccessoryController] failed to apply hat', hatKey, err);
        }
    }

    static async applyAura(gameScene, user, auraKey) {
        const container = user.containerUser;
        if (!container) return;

        const existing = container.list.find((child) => child.accessoryKind === 'aura');
        if (existing) {
            container.remove(existing, true);
        }

        if (!auraKey || !accessoryManager.hasPackage('aura', auraKey)) {
            return;
        }

        try {
            const { default: AccessoryLayer } = await import("../../layered/AccessoryLayer.js");
            await accessoryManager.load(gameScene, 'aura', auraKey);
            const manifest = accessoryManager.getManifest('aura', auraKey);
            const atlasKey = accessoryManager.getAtlasKey('aura', auraKey);
            if (manifest) {
                const sprite = AccessoryLayer.createAura(gameScene, atlasKey, manifest);
                container.add(sprite);
                container.sort('depth');
            }
        } catch (err) {
            console.warn('[UserChangeAccessoryController] failed to apply aura', auraKey, err);
        }
    }
}

export default UserChangeAccessoryController;
