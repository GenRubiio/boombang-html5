import UserIdleAnimation from "../animations/UserIdleAnimation.js";
import UserWalkAnimation from "../animations/UserWalkAnimation.js";

class MovePlayerController {
    static main(gameScene, socketId, path, isLastStep) {
        if (!path || path.length === 0 || !gameScene.players[socketId]) return;

        const playerModel = gameScene.players[socketId];
        const tileWidth = 65;
        const tileHeight = 33;

        // Detener y eliminar correctamente los tweens existentes
        if (playerModel.currentTween) {
            playerModel.currentTween.stop();
            playerModel.currentTween = null;
        }
        if (playerModel.currentShadowTween) {
            playerModel.currentShadowTween.stop();
            playerModel.currentShadowTween = null;
        }
        gameScene.tweens.killTweensOf(playerModel.sprite_player);
        gameScene.tweens.killTweensOf(playerModel.sprite_shadow);

        // Guardar el path y reiniciar el índice
        playerModel.path = path;
        playerModel.pathIndex = 0;

        // Iniciar movimiento al siguiente paso
        this.moveToNextStep(socketId, gameScene, isLastStep);
    }

    static moveToNextStep(socketId, gameScene, isLastStep) {
        const playerModel = gameScene.players[socketId];
        if (!playerModel) return;

        if (playerModel.pathIndex >= playerModel.path.length) {
            // Ha llegado al destino
            playerModel.currentTween = null;
            playerModel.currentShadowTween = null;
            return;
        }

        const step = playerModel.path[playerModel.pathIndex];
        const tileWidth = 65;
        const tileHeight = 33;

        // Calcular posición en pantalla
        const centerX = (step.x - step.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const centerY = (step.x + step.y) * (tileHeight / 2);

        // Actualizar la posición del jugador
        playerModel.position = { x: step.x, y: step.y, z: step.z };

        // Tween para la sombra
        const shadowTween = gameScene.tweens.add({
            targets: playerModel.sprite_shadow,
            x: centerX,
            y: centerY,
            duration: 750,
            onUpdate: () => {
                playerModel.sprite_shadow.setDepth(playerModel.sprite_shadow.y);
            }
        });

        // Tween para el personaje
        const playerTween = gameScene.tweens.add({
            targets: playerModel.sprite_player,
            x: centerX,
            y: centerY - (playerModel.sprite_shadow.displayHeight / 2) - (playerModel.sprite_player.displayHeight / 2) + 15,
            duration: 750,
            onUpdate: () => {
                //if player exists, update its depth
                if (!playerModel.sprite_player) return;
                UserWalkAnimation.main(
                    gameScene,
                    socketId,
                    playerModel.sprite_player,
                    step.z,
                    playerModel.avatar_id
                );
                playerModel.sprite_player.setDepth(playerModel.sprite_shadow.y);
            },
            onComplete: () => {
                if (!playerModel.sprite_player) return;
                // Al completar el movimiento, avanzar al siguiente paso
                playerModel.sprite_player.stop();
                if (isLastStep) {
                    this.stopAnimation(
                        gameScene,
                        socketId,
                        playerModel.sprite_player,
                        step.z,
                        playerModel.avatar_id
                    );
                }
                else {
                    playerModel.pathIndex++;
                    this.moveToNextStep(socketId, gameScene, isLastStep);
                }
            }
        });

        // Almacenar los tweens actuales
        playerModel.currentTween = playerTween;
        playerModel.currentShadowTween = shadowTween;
    }

    static stopAnimation(gameScene, socketId, spritePlayer, direction, avatarId) {
        if (!spritePlayer || !spritePlayer.anims) {
            console.error("Jugador no válido al detener animación.");
            UserIdleAnimation.setDefaultFrame(
                gameScene,
                socketId,
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
        UserIdleAnimation.setDefaultFrame(
            gameScene,
            socketId,
            spritePlayer,
            direction,
            avatarId
        );
    }
}

export default MovePlayerController;