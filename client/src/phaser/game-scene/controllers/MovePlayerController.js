import MovementUtil from "../utils/MovementUtil.js";
import DirectionEnum from "../enums/DirectionEnum.js";

class MovePlayerController {
    static main(gameScene, id, path, isLastStep) {
        if (!path || path.length === 0 || !gameScene.players[id]) return;

        const playerData = gameScene.players[id];
        const { player, shadow } = playerData;
        const tileWidth = 65;
        const tileHeight = 33;

        // Detener y eliminar correctamente los tweens existentes
        if (playerData.currentTween) {
            playerData.currentTween.stop();
            playerData.currentTween = null;
        }
        if (playerData.currentShadowTween) {
            playerData.currentShadowTween.stop();
            playerData.currentShadowTween = null;
        }
        gameScene.tweens.killTweensOf(player);
        gameScene.tweens.killTweensOf(shadow);

        // Guardar el path y reiniciar el índice
        playerData.path = path;
        playerData.pathIndex = 0;

        // Iniciar movimiento al siguiente paso
        this.moveToNextStep(id, gameScene, isLastStep);
    }

    static moveToNextStep(id, gameScene, isLastStep) {
        const playerData = gameScene.players[id];
        if (!playerData) return;

        const { player, shadow, path, pathIndex } = playerData;

        if (pathIndex >= path.length) {
            // Ha llegado al destino
            playerData.currentTween = null;
            playerData.currentShadowTween = null;
            return;
        }

        const step = path[pathIndex];
        const tileWidth = 65;
        const tileHeight = 33;

        // Calcular posición en pantalla
        const centerX = (step.x - step.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const centerY = (step.x + step.y) * (tileHeight / 2);

        // Actualizar la posición del jugador
        playerData.position = { x: step.x, y: step.y, z: step.z };

        // Tween para la sombra
        const shadowTween = gameScene.tweens.add({
            targets: shadow,
            x: centerX,
            y: centerY,
            duration: 750,
            onUpdate: () => {
                shadow.setDepth(shadow.y);
            }
        });

        // Tween para el personaje
        const playerTween = gameScene.tweens.add({
            targets: player,
            x: centerX,
            y: centerY - (shadow.displayHeight / 2) - (player.displayHeight / 2) + 15,
            duration: 750,
            onUpdate: () => {
                //if player exists, update its depth
                if (!player) return;
                this.playAnimation(id, player, step.z);
                player.setDepth(shadow.y);
            },
            onComplete: () => {
                if (!player) return;
                // Al completar el movimiento, avanzar al siguiente paso
                player.stop();
                if (isLastStep) {
                    this.stopAnimation(id, player, step.z);
                }
                else {
                    playerData.pathIndex++;
                    this.moveToNextStep(id, gameScene, isLastStep);
                }
            }
        });

        // Almacenar los tweens actuales
        playerData.currentTween = playerTween;
        playerData.currentShadowTween = shadowTween;
    }

    static playAnimation(id, player, direction) {
        switch (direction) {
            case DirectionEnum.DOWN_LEFT:
                player.play(id + "_" + "leftdown_walk", true);
                break;
            case DirectionEnum.DOWN:
                player.play(id + "_" + "down_walk", true);
                break;
            case DirectionEnum.DOWN_RIGHT:
                player.play(id + "_" + "rightdown_walk", true);
                break;
            case DirectionEnum.RIGHT:
                player.play(id + "_" + "right_walk", true);
                break;
            case DirectionEnum.UP_RIGHT:
                player.play(id + "_" + "rightup_walk", true);
                break;
            case DirectionEnum.UP:
                player.play(id + "_" + "up_walk", true);
                break;
            case DirectionEnum.UP_LEFT:
                player.play(id + "_" + "leftup_walk", true);
                break;
            case DirectionEnum.LEFT:
                player.play(id + "_" + "left_walk", true);
                break;
        }
    }

    static stopAnimation(id, player, direction) {
        if (!player || !player.anims) {
            console.error("Jugador no válido al detener animación.");
            return;
        }

        // Detener cualquier animación activa
        if (player.anims.isPlaying) {
            player.stop();
        }

        // Establecer frame por defecto
        MovementUtil.setDefaultFrame(id, player, direction);
    }
}

export default MovePlayerController;