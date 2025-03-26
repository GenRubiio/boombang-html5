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
        gameScene.tweens.killTweensOf(user.playerContainer);

        // Si el jugador tiene un path definido, limpiarlo
        user.path = [];
        user.pathIndex = 0;

        // Forzar la posición en el mapa según la lógica isométrica
        const tileWidth = 65;
        const tileHeight = 33;
        const finalX = (user.position.x - user.position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const finalY = (user.position.x + user.position.y) * (tileHeight / 2);

        user.playerContainer.setPosition(finalX, finalY);
        user.playerContainer.setDepth(finalY);
        user.sprite_shadow.setPosition(0, 0);
        user.sprite_player.setPosition(
            0,
            -(user.sprite_shadow.displayHeight / 2) - (user.sprite_player.displayHeight / 2) + 15
        );

        //console.log(`Updating player ${socketId} position/direction to:`, position);

        // Ahora que el jugador está posicionado correctamente, cambiar el frame idle según la dirección
        UserIdleAnimation.main(
            user.sprite_player,
            position.z,
            user.avatarId
        );
    }
}

export default UserUpdatePositionController;

