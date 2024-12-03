class RemovePlayerController {
    static main(gameScene, id) {
        if (!gameScene.players[id]) return;

        // Eliminar sombra y personaje
        gameScene.players[id].shadow.destroy();
        gameScene.players[id].player.destroy();
        delete gameScene.players[id];
    }
}

export default RemovePlayerController;