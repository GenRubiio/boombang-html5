import UserIdleAnimation from "../../animations/UserIdleAnimation.js";

class UserUpdatePositionController {
    static main(gameScene, data) {
        const socketId = data.socket_id;
        const position = data.position;

        // Verificar que el jugador exista
        if (!gameScene.players[socketId]) return;

        const playerModel = gameScene.players[socketId];

        // Actualizar la posición lógica del jugador
        playerModel.position = position;

        // Detener tweens existentes para asegurar que no se esté moviendo mientras cambias la dirección
        if (playerModel.currentTween) {
            playerModel.currentTween.stop();
            playerModel.currentTween = null;
        }
        gameScene.tweens.killTweensOf(playerModel.playerContainer);

        // Si el jugador tiene un path definido, limpiarlo
        playerModel.path = [];
        playerModel.pathIndex = 0;

        // Forzar la posición en el mapa según la lógica isométrica
        const tileWidth = 65;
        const tileHeight = 33;
        const finalX = (playerModel.position.x - playerModel.position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const finalY = (playerModel.position.x + playerModel.position.y) * (tileHeight / 2);

        playerModel.playerContainer.setPosition(finalX, finalY);
        playerModel.playerContainer.setDepth(finalY);
        playerModel.sprite_shadow.setPosition(0, 0);
        playerModel.sprite_player.setPosition(
            0,
            -(playerModel.sprite_shadow.displayHeight / 2) - (playerModel.sprite_player.displayHeight / 2) + 15
        );

        //console.log(`Updating player ${socketId} position/direction to:`, position);

        // Ahora que el jugador está posicionado correctamente, cambiar el frame idle según la dirección
        UserIdleAnimation.main(
            playerModel.sprite_player,
            position.z,
            playerModel.avatar_id
        );
    }
}

export default UserUpdatePositionController;

