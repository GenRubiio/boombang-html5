import AddUserController from "./AddUserController.js";
import socket from "../../../sockets/socket.js"; // Conexión Socket.io
import FloorPulseAnimation from "../../animations/FloorPulseAnimation.js";
import SetUserCardController from "../scene/SetUserCardController.js";
import EventLimiter from "../../../utils/EventLimiter.js";

class CreateSceneController {
    static async main(gameScene, data) {
        const usersData = data.players;
        const sceneryData = data.scenery;

        this.createTile(gameScene, sceneryData.game_map, sceneryData.map_rows, sceneryData.map_cols);
        this.createUsers(gameScene, usersData);
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
                const isClickable = map[row][col] == 0;
                const bob = blitter.create(x, y);

                if (import.meta.env.VITE_MAP_MAKER === "true") {
                    if (!isClickable) {
                        bob.tint = 0x808080; // Color gris, por ejemplo
                    }
                    bob.alpha = 0.5; // Transparencia 0.5
                }
                else {
                    bob.alpha = 0;
                }
                // Opcionalmente, si deseas diferenciar los tiles no clickeables visualmente:

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
                    console.log(`Tile at ${col}, ${row} is not clickable.`);
                    if (import.meta.env.VITE_MAP_MAKER === "true") {
                        gameScene.tiles[row][col - 1].bob.setTint(0xffffff);
                        gameScene.tiles[row][col].isClickable = 0;
                        map[row][col] = 0;
                        gameScene.tiles[row][col].bob.tint = 0x808080; // Color gris, por ejemplo
                        console.log(map);
                    }
                    return;
                }

                console.log(`Clicked tile at ${col}, ${row}`);
                socket.emit("request:user_move", { x: col, y: row });
                FloorPulseAnimation.main(gameScene, mx, my);
            }
        });
    }

    static createUsers(gameScene, usersData) {
        // Crear los jugadores iniciales
        (async () => {
            for (const userData of usersData) {
                await AddUserController.main(gameScene, userData);
            }
            //console.log("Players loaded", gameScene.users);
            SetUserCardController.main(gameScene, socket.user, socket.user);
        })();
    }
}

export default CreateSceneController;
