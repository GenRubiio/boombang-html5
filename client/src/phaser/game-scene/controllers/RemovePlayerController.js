class RemovePlayerController {
    static main(gameScene, id) {
        const playerModel = gameScene.players[id];
        if (!playerModel) return;
        // Detener y eliminar tweens activos
        if (playerModel.currentTween) {
            playerModel.currentTween.stop();
            gameScene.tweens.killTweensOf(playerModel.sprite_player);
        }

        if (playerModel.currentShadowTween) {
            playerModel.currentShadowTween.stop();
            gameScene.tweens.killTweensOf(playerModel.sprite_shadow);
        }

        // Detener cualquier animación activa
        if (playerModel.sprite_player?.anims) {
            playerModel.sprite_player.anims.stop();
        }

        // Eliminar sombra y jugador del juego
        if (playerModel.sprite_shadow && playerModel.sprite_shadow.active) playerModel.sprite_shadow.destroy();
        if (playerModel.sprite_player && playerModel.sprite_player.active) playerModel.sprite_player.destroy();

        // Eliminar datos del jugador
        delete gameScene.players[id];
    }
}

export default RemovePlayerController;
