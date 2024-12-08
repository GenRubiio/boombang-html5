import MovePlayerToTileController from "./MovePlayerToTileController.js";
import MovementUtil from "../utils/MovementUtil.js";
import AnimationsController from "./AnimationsController.js";

class AddPlayerController {
    static async main(gameScene, playerData) {
        const id = playerData.id;
        const x = playerData.x;
        const y = playerData.y;
        const z = playerData.z;
        const animations = playerData.animations;

        if (gameScene.players[id]) return;
        await AnimationsController.main(gameScene, animations); // Inicializar animaciones

        // Crear sombra
        const shadow = gameScene.add.image(0, 0, "shadow").setDisplaySize(54, 20);
        shadow.setDepth(0);
        shadow.playerId = id;

        // Configurar evento de clic en la sombra
        shadow.setInteractive(); // Hacer interactiva la sombra
        shadow.on('pointerdown', () => {
            const clickedPlayer = gameScene.players[shadow.playerId];
            if (clickedPlayer) {
                console.log(`Jugador clickeado: ID=${shadow.playerId}`);
                // Aquí puedes hacer algo con el jugador, como mostrar su nombre
            }
        });

        // Crear personaje
        //const player = gameScene.add.sprite(0, 0, "player_spritesheet");
        const player = gameScene.add.sprite(0, 0, "player_" + id);
        MovementUtil.setDefaultFrame(id, player, z);
        player.setDepth(1);

        // Posicionar sombra y personaje
        MovePlayerToTileController.main(gameScene, { x, y }, player, shadow);

        // Almacenar jugador
        gameScene.players[id] = { player, shadow, position: { x, y, z } };
    }
}

export default AddPlayerController;