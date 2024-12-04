import AddPlayerController from "../controllers/AddPlayerController.js";
import socket from "../../../sockets/socket"; // Conexión Socket.io

class CreateSceneController {
    static main(gameScene, players) {
        // Crear el fondo
        const background = gameScene.add.image(0, 0, "background").setOrigin(0);
        background.setDisplaySize(gameScene.scale.width, gameScene.scale.height);

        // Dimensiones de cada rombo
        const tileWidth = 65;
        const tileHeight = 33;

        // Crear una rejilla de rombos isométrica
        gameScene.tiles = [];
        const rows = 30; // Número de filas
        const cols = 30; // Número de columnas

        for (let row = 0; row < rows; row++) {
            gameScene.tiles[row] = [];
            for (let col = 0; col < cols; col++) {
                // Calcular posición de cada rombo en una cuadrícula isométrica
                const x = (col - row) * (tileWidth / 2) + gameScene.scale.width / 2;
                const y = (col + row) * (tileHeight / 2);

                // Crear el rombo
                const tile = gameScene.add.image(x, y, "tile").setInteractive();
                tile.setData("gridPos", { x: col, y: row });
                gameScene.tiles[row][col] = tile;

                // Evento de clic: enviar posición al servidor
                tile.on("pointerdown", () => {
                    const { x, y } = tile.getData("gridPos");
                    console.log(`Clicked tile at ${x}, ${y}`);
                    socket.emit('request:user_move', { x: x, y: y });
                });
            }
        }

        // Crear los jugadores iniciales
        players.forEach((player) => {
            AddPlayerController.main(gameScene, player.id, player.x, player.y);
        });

        // Ocultar la imagen de carga
        if (gameScene.loadingImage) {
            gameScene.loadingImage.destroy();
        }
    }
}

export default CreateSceneController;