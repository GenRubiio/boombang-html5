

import UserIdleAnimation from "../../animations/UserIdleAnimation.js";

class UserMoveDeniedController {
    static main(gameScene, socketId) {
        const playerModel = gameScene.players[socketId];
        
        if (playerModel) {
            const spritePlayer = playerModel.sprite_player;
            const spriteShadow = playerModel.sprite_shadow;
            const direction = playerModel.position.z;
            const avatarId = playerModel.avatar_id;

            // Detener Tweens activos del playerContainer
            if (playerModel.currentTween) {
                playerModel.currentTween.stop();
                playerModel.currentTween = null;
            }
            if (playerModel.currentShadowTween) {
                playerModel.currentShadowTween.stop();
                playerModel.currentShadowTween = null;
            }
            // Matar cualquier otro tween de sprites
            gameScene.tweens.killTweensOf(playerModel.playerContainer);
            gameScene.tweens.killTweensOf(spritePlayer);
            gameScene.tweens.killTweensOf(spriteShadow);

            // Forzar la posición del jugador en el mapa según (x, y)
            const tileWidth = 65;
            const tileHeight = 33;
            const finalX = (playerModel.position.x - playerModel.position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
            const finalY = (playerModel.position.x + playerModel.position.y) * (tileHeight / 2);

            // Establecer posición y profundidad
            playerModel.playerContainer.setPosition(finalX, finalY);
            playerModel.playerContainer.setDepth(finalY);

            // Ajustar posiciones internas del sprite
            spriteShadow.setPosition(0, 0);
            spritePlayer.setPosition(
                0,
                -(spriteShadow.displayHeight / 2) - (spritePlayer.displayHeight / 2) + 15
            );

            // Detener animación actual y asegurar el frame idle
            this.stopAnimation(spritePlayer, direction, avatarId);
        }
    }

    static stopAnimation(spritePlayer, direction, avatarId) {
        if (!spritePlayer || !spritePlayer.anims) {
            //console.error("Jugador no válido al detener animación.");
            UserIdleAnimation.main(
                spritePlayer,
                direction,
                avatarId
            );
            return;
        }

        // Detener cualquier animación activa
        if (spritePlayer.anims.isPlaying) {
            spritePlayer.stop();
        }

        // Establecer frame por defecto
        UserIdleAnimation.main(
            spritePlayer,
            direction,
            avatarId
        );
    }
}

export default UserMoveDeniedController;
