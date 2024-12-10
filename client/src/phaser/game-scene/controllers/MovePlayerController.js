import MovementUtil from "../utils/MovementUtil.js";
import DirectionEnum from "../enums/DirectionEnum.js";

class MovePlayerController {
    static main(gameScene, id, path, isLastStep) {
        if (!path || path.length === 0 || !gameScene.players[id]) return;

        const playerModel = gameScene.players[id];
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
        this.moveToNextStep(id, gameScene, isLastStep);
    }

    static moveToNextStep(id, gameScene, isLastStep) {
        const playerModel = gameScene.players[id];
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
                this.playAnimation(id, playerModel.sprite_player, step.z);
                playerModel.sprite_player.setDepth(playerModel.sprite_shadow.y);
            },
            onComplete: () => {
                if (!playerModel.sprite_player) return;
                // Al completar el movimiento, avanzar al siguiente paso
                playerModel.sprite_player.stop();
                if (isLastStep) {
                    this.stopAnimation(id, playerModel.sprite_player, step.z);
                }
                else {
                    playerModel.pathIndex++;
                    this.moveToNextStep(id, gameScene, isLastStep);
                }
            }
        });

        // Almacenar los tweens actuales
        playerModel.currentTween = playerTween;
        playerModel.currentShadowTween = shadowTween;
    }

    static playAnimation(id, spritePlayer, direction) {
        switch (direction) {
            case DirectionEnum.DOWN_LEFT:
                spritePlayer.play(id + "_" + "leftdown_walk", true);
                break;
            case DirectionEnum.DOWN:
                spritePlayer.play(id + "_" + "down_walk", true);
                break;
            case DirectionEnum.DOWN_RIGHT:
                spritePlayer.play(id + "_" + "rightdown_walk", true);
                break;
            case DirectionEnum.RIGHT:
                spritePlayer.play(id + "_" + "right_walk", true);
                break;
            case DirectionEnum.UP_RIGHT:
                spritePlayer.play(id + "_" + "rightup_walk", true);
                break;
            case DirectionEnum.UP:
                spritePlayer.play(id + "_" + "up_walk", true);
                break;
            case DirectionEnum.UP_LEFT:
                spritePlayer.play(id + "_" + "leftup_walk", true);
                break;
            case DirectionEnum.LEFT:
                spritePlayer.play(id + "_" + "left_walk", true);
                break;
        }
    }

    static stopAnimation(id, spritePlayer, direction) {
        if (!spritePlayer || !spritePlayer.anims) {
            console.error("Jugador no válido al detener animación.");
            return;
        }

        // Detener cualquier animación activa
        if (spritePlayer.anims.isPlaying) {
            spritePlayer.stop();
        }

        // Establecer frame por defecto
        MovementUtil.setDefaultFrame(id, spritePlayer, direction);
    }
}

export default MovePlayerController;