import UserWalkAnimation from "../animations/UserWalkAnimation.js";
import AnimationsTimerEnum from "../../../enums/AnimationsTimerEnum.js";
import UserMoveDeniedController from "./UserMoveDeniedController.js";

class MovePlayerController {
    /**
     * Llamada principal para iniciar el movimiento del jugador por un path.
     * @param {Phaser.Scene} gameScene - Escena de Phaser
     * @param {string} socketId - Identificador único del usuario
     * @param {Array} path - Lista de pasos (objetos con {x, y, z})
     * @param {boolean} isLastStep - Indica si al finalizar se aplica lógica de "moveDenied"
     */
    static main(gameScene, socketId, path, isLastStep) {
        if (!path || path.length === 0 || !gameScene.players[socketId]) return;

        // (Opcional) log de depuración, coméntalo en producción
        // console.log(`Moving player ${socketId} to path:`, path);

        const playerModel = gameScene.players[socketId];

        // Detener tweens existentes
        if (playerModel.currentTween) {
            playerModel.currentTween.stop();
        }
        gameScene.tweens.killTweensOf(playerModel.playerContainer);

        // Guardar el path y reiniciar el índice
        playerModel.path = path;
        playerModel.pathIndex = 0;

        // Iniciar movimiento al siguiente paso
        this.moveToNextStep(gameScene, socketId, isLastStep);
    }

    /**
     * Mueve al jugador al siguiente paso del path
     */
    static moveToNextStep(gameScene, socketId, isLastStep) {
        const playerModel = gameScene.players[socketId];
        if (!playerModel) return;

        // Si ya hemos recorrido todo el path
        if (playerModel.pathIndex >= playerModel.path.length) {
            // Lógica adicional si es el último paso
            if (isLastStep) {
                UserMoveDeniedController.main(gameScene, socketId);
            }
            return;
        }

        const step = playerModel.path[playerModel.pathIndex];

        // Ajusta según tu grid isométrico
        const tileWidth = 65;
        const tileHeight = 33;

        // Calcula la posición en pantalla
        const centerX = (step.x - step.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const centerY = (step.x + step.y) * (tileHeight / 2);

        // Actualiza posición lógica del jugador
        playerModel.position = { x: step.x, y: step.y, z: step.z };

        // Inicia la animación SOLO una vez (en lugar de cada frame).
        UserWalkAnimation.playWalk(
            playerModel.sprite_player,
            step.z,
            playerModel.avatar_id
        );

        // Crea el tween de movimiento
        const tween = gameScene.tweens.add({
            targets: playerModel.playerContainer,
            x: centerX,
            y: centerY,
            duration: AnimationsTimerEnum.WALK,
            onUpdate: () => {
                if (!playerModel.playerContainer) return;
                // Actualiza la profundidad según la Y (opcional en cada frame).
                playerModel.playerContainer.setDepth(playerModel.playerContainer.y);
            },
            onComplete: () => {
                // Al terminar el movimiento, detenemos la animación
                playerModel.sprite_player.stop();

                // Pasamos al siguiente paso del path
                playerModel.pathIndex++;
                this.moveToNextStep(gameScene, socketId, isLastStep);
            }
        });

        // Almacena el tween actual para futuras referencias
        playerModel.currentTween = tween;
    }
}

export default MovePlayerController;
