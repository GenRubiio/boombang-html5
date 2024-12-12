import AddPlayerController from "../controllers/AddPlayerController.js";
import socket from "../../../sockets/socket"; // Conexión Socket.io
import FloorPulseAnimation from "../animations/FloorPulseAnimation.js";
import SetUserCardController from "../controllers/SetUserCardController.js";

class CreateSceneController {
    static main(gameScene, players) {
        this.createBackground(gameScene);
        this.createTile(gameScene);
        this.createPlayers(gameScene, players);
    }

    static createBackground(gameScene) {
        // Crear el fondo
        const background = gameScene.add.image(0, 0, "background").setOrigin(0);
        background.setDisplaySize(gameScene.scale.width, gameScene.scale.height);
    }

    static createTile(gameScene) {
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

                // Ajustar el área interactiva al rombo
                tile.input.hitArea = new Phaser.Geom.Polygon([
                    { x: 0, y: tileHeight / 2 },                // Vértice superior
                    { x: tileWidth / 2, y: 0 },                // Vértice derecho
                    { x: tileWidth, y: tileHeight / 2 },       // Vértice inferior
                    { x: tileWidth / 2, y: tileHeight },       // Vértice izquierdo
                ]);
                tile.input.hitAreaCallback = Phaser.Geom.Polygon.Contains;

                this.eventTileClick(tile);
            }
        }
    }

    static eventTileClick(tile) {
        // Evento de clic: enviar posición al servidor
        tile.removeListener("pointerdown");
        tile.on("pointerdown", (pointer) => {
            const { x, y } = tile.getData("gridPos");
            console.log(`Clicked tile at ${x}, ${y}`);
            socket.emit("request:user_move", { x: x, y: y });

            // Crear la animación de pulsación
            FloorPulseAnimation.main(tile.scene, pointer.worldX, pointer.worldY);
        });
    }

    static createPlayers(gameScene, players) {
        // Crear los jugadores iniciales
        (async () => {
            for (const player of players) {
                await AddPlayerController.main(gameScene, player);
            }

            SetUserCardController.main(gameScene, {
                username: socket.user.username,
                is_admin: socket.user.is_admin,
                is_vip: socket.user.is_vip,
                is_selected: false,
                gender: socket.user.gender,
            });

            if (gameScene.vueComponent) {
                console.log("Setting loading to false");
                gameScene.vueComponent.loading = false; // Cambiar el estado de 'loading'
            }
        })();
    }
}

export default CreateSceneController;
