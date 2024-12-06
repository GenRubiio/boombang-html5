import MovePlayerToTileController from "./MovePlayerToTileController.js";

class AddPlayerController {
    static main(gameScene, id, x, y, z) {
        if (gameScene.players[id]) return;

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
        const player = gameScene.add.sprite(75, 104, "player_spritesheet");
        this.setDefaultFrame(player, z);
        player.setDepth(1);

        // Posicionar sombra y personaje
        MovePlayerToTileController.main(gameScene, { x, y }, player, shadow);

        // Almacenar jugador
        gameScene.players[id] = { player, shadow, position: { x, y, z } };
    }

    static setDefaultFrame(player, direction) {
        switch (direction) {
            case 1:
                player.setFrame(15);
                break;
            case 2:
                player.setFrame(63);
                break;
            case 3:
                player.setFrame(109);
                break;
            case 4:
                player.setFrame(125);
                break;
            case 5:
                player.setFrame(93);
                break;
            case 6:
                player.setFrame(47);
                break;
            case 7:
                player.setFrame(78);
                break;
            case 8:
                player.setFrame(31);
                break;
        }
    }
}

export default AddPlayerController;