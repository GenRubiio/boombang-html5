class RemovePlayerController {
    static main(gameScene, id) {
        const playerData = gameScene.players[id];
        if (!playerData) return;

        const { player, shadow, currentTween, currentShadowTween } = playerData;

        // Detener y eliminar tweens activos
        if (currentTween) {
            currentTween.stop();
            gameScene.tweens.killTweensOf(player);
        }

        if (currentShadowTween) {
            currentShadowTween.stop();
            gameScene.tweens.killTweensOf(shadow);
        }

        // Detener cualquier animación activa
        if (player?.anims) {
            player.anims.stop();
        }

        // Eliminar sombra y jugador del juego
        if (shadow && shadow.active) shadow.destroy();
        if (player && player.active) player.destroy();

        // Eliminar datos del jugador
        delete gameScene.players[id];
    }
}

export default RemovePlayerController;
