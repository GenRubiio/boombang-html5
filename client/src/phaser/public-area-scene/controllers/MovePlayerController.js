import UserWalkAnimation from "../animations/UserWalkAnimation.js";
import AnimationsTimerEnum from "../../enums/AnimationsTimerEnum.js";
import UserMoveDeniedController from "./UserMoveDeniedController.js";

class MovePlayerController {
    static main(gameScene, socketId, path, isLastStep) {
        if (!path || path.length === 0 || !gameScene.players[socketId]) return;

        const playerModel = gameScene.players[socketId];

        // Detener tweens existentes
        if (playerModel.currentTween) playerModel.currentTween.stop();
        gameScene.tweens.killTweensOf(playerModel.playerContainer);

        // Guardar el path y reiniciar el índice
        playerModel.path = path;
        playerModel.pathIndex = 0;

        // Iniciar movimiento al siguiente paso
        this.moveToNextStep(socketId, gameScene, isLastStep);
    }

    static moveToNextStep(socketId, gameScene, isLastStep) {
        const playerModel = gameScene.players[socketId];
        if (!playerModel || playerModel.pathIndex >= playerModel.path.length) return;

        const step = playerModel.path[playerModel.pathIndex];
        const tileWidth = 65;
        const tileHeight = 33;

        // Calcular posición en pantalla
        const centerX = (step.x - step.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const centerY = (step.x + step.y) * (tileHeight / 2);

        // Actualizar la posición del jugador
        playerModel.position = { x: step.x, y: step.y, z: step.z };

        // Mover el contenedor
        const playerTween = gameScene.tweens.add({
            targets: playerModel.playerContainer,
            x: centerX,
            y: centerY,
            duration: AnimationsTimerEnum.WALK,
            onUpdate: () => {
                if (!playerModel.playerContainer) return;
                
                // Actualizar profundidad en base a la posición Y
                playerModel.playerContainer.setDepth(playerModel.playerContainer.y);

                // Animar al personaje durante el movimiento
                UserWalkAnimation.main(
                    playerModel.sprite_player,
                    step.z,
                    playerModel.avatar_id
                );
            },
            onComplete: () => {
                if (!playerModel.playerContainer) return;

                // Detener animación actual
                playerModel.sprite_player.stop();

                if (isLastStep) {
                    UserMoveDeniedController.main(gameScene, socketId);
                } else {
                    playerModel.pathIndex++;
                    this.moveToNextStep(socketId, gameScene, isLastStep);
                }
            }
        });

        // Almacenar tween actual
        playerModel.currentTween = playerTween;
    }
}

export default MovePlayerController;
