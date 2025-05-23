import UserWalkAnimation from "../../animations/UserWalkAnimation.js";
import AnimationsTimerEnum from "../../../enums/AnimationsTimerEnum.js";
import UserMoveDeniedController from "./UserMoveDeniedController.js";

class MoveUserController {
    /**
     * Llamada principal para iniciar el movimiento del jugador por un path.
     * @param {Phaser.Scene} gameScene - Escena de Phaser
     * @param {string} socketId - Identificador único del usuario
     * @param {Array} path - Lista de pasos (objetos con {x, y, z})
     * @param {boolean} isLastStep - Indica si al finalizar se aplica lógica de "moveDenied"
     */
    static main(gameScene, socketId, path, isLastStep) {
        if (!path || path.length === 0 || !gameScene.users[socketId]) return;

        // (Opcional) log de depuración, coméntalo en producción
        //console.log(`Moving player ${socketId} to path:`, path);

        const user = gameScene.users[socketId];

        // Detener tweens existentes
        if (user.currentTween) {
            user.currentTween.stop();
        }
        gameScene.tweens.killTweensOf(user.containerUser);

        // Guardar el path y reiniciar el índice
        user.path = path;
        user.pathIndex = 0;

        // Iniciar movimiento al siguiente paso
        this.moveToNextStep(gameScene, socketId, isLastStep);
    }

    /**
     * Mueve al jugador al siguiente paso del path
     */
    static moveToNextStep(gameScene, socketId, isLastStep) {
        const user = gameScene.users[socketId];
        if (!user) return;

        // Si ya hemos recorrido todo el path
        if (user.pathIndex >= user.path.length) {
            // Lógica adicional si es el último paso
            if (isLastStep) {
                UserMoveDeniedController.main(gameScene, socketId);
            }
            return;
        }

        const step = user.path[user.pathIndex];

        // Ajusta según tu grid isométrico
        const tileWidth = 65;
        const tileHeight = 33;

        // Calcula la posición en pantalla
        const centerX = (step.x - step.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const centerY = (step.x + step.y) * (tileHeight / 2);

        // Actualiza posición lógica del jugador
        user.position = { x: step.x, y: step.y, z: step.z };

        // Inicia la animación SOLO una vez (en lugar de cada frame).
        UserWalkAnimation.playWalk(
            user.spriteAvatar,
            step.z,
            user.avatarId
        );

        // Crea el tween de movimiento
        const tween = gameScene.tweens.add({
            targets: user.containerUser,
            x: centerX,
            y: centerY,
            duration: AnimationsTimerEnum.WALK,
            onUpdate: () => {
                if (!user.containerUser) return;
                // Actualiza la profundidad según la Y (opcional en cada frame).
                user.containerUser.setDepth(user.containerUser.y);
            },
            onComplete: () => {
                // Al terminar el movimiento, detenemos la animación
                user.spriteAvatar.stop();

                // Pasamos al siguiente paso del path
                user.pathIndex++;
                this.moveToNextStep(gameScene, socketId, isLastStep);
            }
        });

        // Almacena el tween actual para futuras referencias
        user.currentTween = tween;
    }
}

export default MoveUserController;
