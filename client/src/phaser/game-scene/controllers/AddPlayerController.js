import MovePlayerToTileController from "./MovePlayerToTileController.js";

class AddPlayerController {
    static main(gameScene, id, x, y) {
        if (gameScene.players[id]) return;

        // Crear sombra
        const shadow = gameScene.add.image(0, 0, "shadow").setDisplaySize(54, 20);
        shadow.setDepth(0);

        // Crear personaje
        const player = gameScene.add.image(0, 0, "player").setDisplaySize(83, 120);
        player.setDepth(1);

        // Posicionar sombra y personaje
        MovePlayerToTileController.main(gameScene, { x, y }, player, shadow);

        // Almacenar jugador
        gameScene.players[id] = { player, shadow, position: { x, y } };
    }
}

export default AddPlayerController;