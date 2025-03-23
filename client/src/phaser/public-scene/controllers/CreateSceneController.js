import AddPlayerController from "../controllers/AddPlayerController.js";
import socket from "../../../sockets/socket"; // Conexión Socket.io
import FloorPulseAnimation from "../../animations/FloorPulseAnimation.js";
import SetUserCardController from "../../controllers/SetUserCardController.js";
import EventLimiter from "../utils/EventLimiter.js";
import PublicSceneLoad from "../../load/PublicSceneLoad.js";

class CreateSceneController {
    static async main(gameScene, data) {
        const playersData = data.players;
        const sceneryData = data.scenery;

        PublicSceneLoad.main(gameScene, sceneryData.id);
        this.createTile(gameScene, sceneryData.game_map, sceneryData.map_rows, sceneryData.map_cols);
        this.createPlayers(gameScene, playersData);
    }

    static createTile(gameScene, map, rows, cols) {
        // Dimensiones de cada rombo
        const tileWidth = 65;
        const tileHeight = 33;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;

        // Centro en X para alinear la rejilla
        const centerX = gameScene.scale.width / 2;

        // Crear un Blitter
        const blitter = gameScene.add.blitter(0, 0, "tile");

        // Guardamos la información de posición de cada celda si fuera necesario
        gameScene.tiles = [];

        for (let row = 0; row < rows; row++) {
            gameScene.tiles[row] = [];
            for (let col = 0; col < cols; col++) {
                const x = (col - row) * halfTileWidth + centerX;
                const y = (col + row) * halfTileHeight;

                // Creamos un "bob" solo si el mapa en esta posición es clickeable (0)
                const isClickable = map[row][col] === 0;
                const bob = blitter.create(x, y);

                // Opcionalmente, si deseas diferenciar los tiles no clickeables visualmente:
                if (!isClickable) {
                    bob.tint = 0x808080; // Color gris, por ejemplo
                }
                bob.alpha = 0.5; // Transparencia

                // Guarda la información del tile
                gameScene.tiles[row][col] = {
                    bob,
                    gridPos: { x: col, y: row },
                    isClickable
                };
            }
        }

        // Definir la forma "rombo" en coordenadas locales alrededor de (0,0).
        const diamondPolygon = new Phaser.Geom.Polygon([
            { x: -halfTileWidth, y: 0 },
            { x: 0, y: -halfTileHeight },
            { x: halfTileWidth, y: 0 },
            { x: 0, y: halfTileHeight }
        ]);

        // Crear UNA zona interactiva que cubra toda la escena.
        const zone = gameScene.add.zone(0, 0, gameScene.scale.width, gameScene.scale.height)
            .setOrigin(0)
            .setInteractive();

        // Al hacer clic, invertimos la fórmula isométrica
        zone.on("pointerdown", (pointer) => {
            if (!EventLimiter.canClick()) return;

            const mx = pointer.worldX;
            const my = pointer.worldY;

            // Fórmula isométrica invertida
            const colFloat = ((mx - centerX) / halfTileWidth + my / halfTileHeight) / 2;
            const rowFloat = (my / halfTileHeight - (mx - centerX) / halfTileWidth) / 2;

            const col = Math.round(colFloat);
            const row = Math.round(rowFloat);

            // Chequeo de límites
            if (col < 0 || col >= cols || row < 0 || row >= rows) {
                return;
            }

            // Calculamos la posición exacta del centro de ese tile
            const tileCenterX = (col - row) * halfTileWidth + centerX;
            const tileCenterY = (col + row) * halfTileHeight;

            // Coordenadas locales del clic respecto al centro del tile
            const localX = mx - tileCenterX;
            const localY = my - tileCenterY;

            // Verificamos si realmente cae dentro del rombo
            if (Phaser.Geom.Polygon.Contains(diamondPolygon, localX, localY)) {
                const tile = gameScene.tiles[row][col];

                // Si el tile no es clickeable, ignoramos el clic
                if (!tile.isClickable) {
                    //console.log(`Tile at ${col}, ${row} is not clickable.`);
                    return;
                }

                //console.log(`Clicked tile at ${col}, ${row}`);
                socket.emit("request:user_move", { x: col, y: row });
                FloorPulseAnimation.main(gameScene, mx, my);
            }
        });
    }

    static createPlayers(gameScene, playersData) {
        // Crear los jugadores iniciales
        (async () => {
            for (const playerData of playersData) {
                await AddPlayerController.main(gameScene, playerData);
            }
            //console.log("Players loaded", gameScene.players);
            SetUserCardController.main(gameScene, socket.user);
        })();
    }
}

export default CreateSceneController;
