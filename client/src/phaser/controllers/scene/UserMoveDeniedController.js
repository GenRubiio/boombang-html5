

import UserIdleAnimation from "../../animations/UserIdleAnimation.js";

class UserMoveDeniedController {
    static main(gameScene, socketId) {
        const user = gameScene.users[socketId];
        
        if (user) {
            const spriteAvatar = user.spriteAvatar;
            const spriteShadow = user.spriteShadow;
            const direction = user.position.z;
            const avatarId = user.avatarId;

            // Detener Tweens activos del containerUser
            if (user.currentTween) {
                user.currentTween.stop();
                user.currentTween = null;
            }
            if (user.currentShadowTween) {
                user.currentShadowTween.stop();
                user.currentShadowTween = null;
            }
            // Matar cualquier otro tween de sprites
            gameScene.tweens.killTweensOf(user.containerUser);
            gameScene.tweens.killTweensOf(spriteAvatar);
            gameScene.tweens.killTweensOf(spriteShadow);

            // Forzar la posición del jugador en el mapa según (x, y)
            const tileWidth = 65;
            const tileHeight = 33;
            const finalX = (user.position.x - user.position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
            const finalY = (user.position.x + user.position.y) * (tileHeight / 2);

            // Establecer posición y profundidad
            user.containerUser.setPosition(finalX, finalY);
            user.containerUser.setDepth(finalY);

            // Ajustar posiciones internas del sprite
            spriteShadow.setPosition(0, 0);
            spriteAvatar.setPosition(
                0,
                -(spriteShadow.displayHeight / 2) - (spriteAvatar.displayHeight / 2) + 15
            );

            // Detener animación actual y asegurar el frame idle
            this.stopAnimation(spriteAvatar, direction, avatarId);
        }
    }

    static stopAnimation(spriteAvatar, direction, avatarId) {
        if (!spriteAvatar || !spriteAvatar.anims) {
            //console.error("Jugador no válido al detener animación.");
            UserIdleAnimation.main(
                spriteAvatar,
                direction,
                avatarId
            );
            return;
        }

        // Detener cualquier animación activa
        if (spriteAvatar.anims.isPlaying) {
            spriteAvatar.stop();
        }

        // Establecer frame por defecto
        UserIdleAnimation.main(
            spriteAvatar,
            direction,
            avatarId
        );
    }
}

export default UserMoveDeniedController;
