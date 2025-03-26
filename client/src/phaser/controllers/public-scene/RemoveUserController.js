class RemoveUserController {
    static main(gameScene, socketId) {
        const playerModel = gameScene.players[socketId];
        if (!playerModel) return;

        // Detener y eliminar tweens activos
        if (playerModel.currentTween) playerModel.currentTween.stop();
        gameScene.tweens.killTweensOf(playerModel.playerContainer);

        // Detener cualquier animación activa
        if (playerModel.sprite_player?.anims) {
            playerModel.sprite_player.anims.stop();
        }

        // Eliminar contenedor completo
        if (playerModel.playerContainer && playerModel.playerContainer.active) {
            playerModel.playerContainer.destroy();
        }

        // Eliminar datos del jugador
        delete gameScene.players[socketId];
    }
}

export default RemoveUserController;
