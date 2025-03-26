class RemoveUserController {
    static main(gameScene, socketId) {
        const user = gameScene.users[socketId];
        if (!user) return;

        // Detener y eliminar tweens activos
        if (user.currentTween) user.currentTween.stop();
        gameScene.tweens.killTweensOf(user.playerContainer);

        // Detener cualquier animación activa
        if (user.sprite_player?.anims) {
            user.sprite_player.anims.stop();
        }

        // Eliminar contenedor completo
        if (user.playerContainer && user.playerContainer.active) {
            user.playerContainer.destroy();
        }

        // Eliminar datos del jugador
        delete gameScene.users[socketId];
    }
}

export default RemoveUserController;
