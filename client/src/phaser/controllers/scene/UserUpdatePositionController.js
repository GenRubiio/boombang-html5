import UserIdleAnimation from "../../animations/UserIdleAnimation.js";

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
        const tileWidth = 65;
        const tileHeight = 33;
        const finalX = (user.position.x - user.position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const finalY = (user.position.x + user.position.y) * (tileHeight / 2);

        user.containerUser.setPosition(finalX, finalY);
        user.containerUser.setDepth(finalY);
        user.spriteShadow.setPosition(0, 0);
        user.spriteAvatar.setPosition(
            0,
            -(user.spriteShadow.displayHeight / 2) - (user.spriteAvatar.displayHeight / 2) + 15
        );

        //console.log(`Updating player ${socketId} position/direction to:`, position);

        // Ahora que el jugador está posicionado correctamente, cambiar el frame idle según la dirección
        UserIdleAnimation.main(
            user.spriteAvatar,
            position.z,
            user.avatarId
        );
    }
}

export default UserUpdatePositionController;

