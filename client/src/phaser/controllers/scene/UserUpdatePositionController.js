import UserIdleAnimation from "../../animations/UserIdleAnimation.js";
import gameConfig from "@/config/gameConfig.js";

class UserUpdatePositionController {
    static main(gameScene, data) {
        const socketId = data.socket_id;
        const position = data.position;

        // Verificar que el jugador exista
        if (!gameScene.users[socketId]) return;

        const user = gameScene.users[socketId];

        // Actualizar la posición lógica del jugador
        user.position = position;

        // Detener tweens existentes para asegurar que no se esté moviendo mientras cambias la dirección
        if (user.currentTween) {
            user.currentTween.stop();
            user.currentTween = null;
        }
        gameScene.tweens.killTweensOf(user.containerUser);

        // Si el jugador tiene un path definido, limpiarlo
        user.path = [];
        user.pathIndex = 0;

        // Forzar la posición en el mapa según la lógica isométrica
        const tileWidth = 65 * gameConfig.DPI;
        const tileHeight = 33 * gameConfig.DPI;
        const halfTileWidth = tileWidth / gameConfig.DPI;
        const halfTileHeight = tileHeight / gameConfig.DPI;
        const finalX = (user.position.x - user.position.y) * halfTileWidth + gameScene.scale.width / gameConfig.DPI;
        const finalY = (user.position.x + user.position.y) * halfTileHeight;

        user.containerUser.setPosition(finalX, finalY);
        user.containerUser.setDepth(finalY);
        //user.spriteShadow.setPosition(0, 0);
        //user.spriteAvatar.setPosition(
        //    0,
        //    -(user.spriteShadow.displayHeight / 2) - (user.spriteAvatar.displayHeight / 2) + 15 * 2
        //);

        //console.log(`Updating player ${socketId} position/direction to:`, position);

        // Ahora que el jugador está posicionado correctamente, cambiar el frame idle según la dirección
        // Usar el avatar realmente disponible (fallback) para la animación mientras carga el solicitado
        const effectiveAvatarId = user.currentAvatarId || user.avatarId;
        UserIdleAnimation.main(
            user.spriteAvatar,
            position.z,
            effectiveAvatarId
        );
    }
}

export default UserUpdatePositionController;

