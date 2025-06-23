import AvatarEmojisEnum from "../../enums/AvatarEmojisEnum.js";
import AvatarEmojisNameAnimationsEnum from "../../enums/AvatarEmojisNameAnimationsEnum.js";
import AnimationUtils from "../../utils/AnimationUtils.js";
import UserIdleAnimation from "./UserIdleAnimation.js";

class UserEmojiAnimation {
    /**
     * Inicia la animación según la dirección
     */
    /**
    * Inicia la animación según el emoji
    * @param {{ spriteAvatar: Phaser.GameObjects.Sprite, avatarId: string, position: {z: number} }} user
    * @param {string} emojiId
    * @param {Phaser.Scene} scene
    */
    static main(user, emojiId, scene) {
        const sprite = user.spriteAvatar;

        // Cancelar vuelo en curso si existe
        if (this.isFlying(sprite)) {
            this.cancelFly(sprite, scene);
        }

        const avatarId = user.avatarId;
        const textureKey = this.getTextureKey(emojiId);
        if (!textureKey) return;

        // Acción de volar
        if (emojiId === AvatarEmojisEnum.FLY) {
            this.flyAnimation(sprite, avatarId, textureKey, scene);
            return;
        }

        // Otras animaciones: texturas y vuelta a idle
        AnimationUtils.setSpriteConfig(sprite, avatarId, textureKey);
        sprite.play(`${avatarId}_${textureKey}`, false);
        sprite.once("animationcomplete", () => {
            // Usa propiedades del sprite (_z y _avatarId) para el idle
            UserIdleAnimation.main(
                sprite,
                sprite._z,
                sprite._avatarId
            );
        });
    }

    /**
     * Indica si el sprite está en medio de vuelo
     * @param {Phaser.GameObjects.Sprite} sprite
     */
    static isFlying(sprite) {
        return sprite._flyOriginalLocalY !== undefined;
    }

    /**
     * Cancela la animación de vuelo en curso y restaura posición
     * @param {Phaser.GameObjects.Sprite} sprite
     * @param {Phaser.Scene} scene
     */
    static cancelFly(sprite, scene) {
        // Matar tweens activos sobre el sprite
        scene.tweens.killTweensOf(sprite);
        // Quitar temporizador si existe
        if (sprite._flyTimerMid) {
            sprite._flyTimerMid.remove();
            delete sprite._flyTimerMid;
        }
        // Restaurar posición local original
        sprite.y = sprite._flyOriginalLocalY;
        delete sprite._flyOriginalLocalY;
    }

    /**
     * Animación de vuelo: mueve sólo el sprite dentro de su contenedor padre
     * para que la sombra quede fija. Sube, flota y baja en 7000ms.
     * @param {Phaser.GameObjects.Sprite} sprite
     * @param {string} avatarIdParam
     * @param {string} textureKey
     * @param {Phaser.Scene} scene
     */
    static flyAnimation(sprite, avatarIdParam, textureKey, scene) {
        const container = sprite.parentContainer;
        // Guardar propiedades en el sprite para posterior cancelación o idle
        sprite._avatarId = avatarIdParam;
        sprite._z = sprite._z !== undefined ? sprite._z : sprite.y; // Asigna z si no existe

        // Guardar posición local original
        sprite._flyOriginalLocalY = sprite.y;

        // Margen superior para no pasar del viewport
        const marginTop = 10;
        const worldTopY = scene.cameras.main.worldView.y + (sprite.displayHeight / 2) + marginTop;
        const localTopY = worldTopY - container.y;

        // Configurar animación de frames
        AnimationUtils.setSpriteConfig(sprite, avatarIdParam, textureKey);
        sprite.play(`${avatarIdParam}_${textureKey}`, false);

        // Duraciones
        const upDuration = 2000;
        const floatDuration = 2000;
        const downDuration = 2000;

        // Subir
        scene.tweens.add({
            targets: sprite,
            y: localTopY,
            duration: upDuration,
            ease: 'Linear',
            onComplete: () => {
                // Flotar
                sprite._flyTimerMid = scene.time.delayedCall(floatDuration, () => {
                    // Bajar
                    scene.tweens.add({
                        targets: sprite,
                        y: sprite._flyOriginalLocalY,
                        duration: downDuration,
                        ease: 'Linear',
                        onComplete: () => {
                            // Limpiar estado y volver a idle
                            delete sprite._flyOriginalLocalY;
                            UserIdleAnimation.main(
                                sprite,
                                sprite._z,
                                sprite._avatarId
                            );
                        }
                    });
                });
            }
        });
    }

    /**
     * Devuelve el key de la animación/texture
     */
    static getTextureKey(emojiId) {
        switch (emojiId) {
            case AvatarEmojisEnum.LAUGHTER_1:
                return AvatarEmojisNameAnimationsEnum.LAUGHTER_1;
            case AvatarEmojisEnum.LAUGHTER_2:
                return AvatarEmojisNameAnimationsEnum.LAUGHTER_2;
            case AvatarEmojisEnum.CRY:
                return AvatarEmojisNameAnimationsEnum.CRY;
            case AvatarEmojisEnum.LOVE:
                return AvatarEmojisNameAnimationsEnum.LOVE;
            case AvatarEmojisEnum.SPIT:
                return AvatarEmojisNameAnimationsEnum.SPIT;
            case AvatarEmojisEnum.FART:
                return AvatarEmojisNameAnimationsEnum.FART;
            case AvatarEmojisEnum.PROVOKE:
                return AvatarEmojisNameAnimationsEnum.PROVOKE;
            case AvatarEmojisEnum.FLY:
                return AvatarEmojisNameAnimationsEnum.FLY;
            default:
                return null;
        }
    }
}

export default UserEmojiAnimation;