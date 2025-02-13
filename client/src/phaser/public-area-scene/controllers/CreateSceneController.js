import AddPlayerController from "../controllers/AddPlayerController.js";
import socket from "../../../sockets/socket"; // Conexión Socket.io
import FloorPulseAnimation from "../animations/FloorPulseAnimation.js";
import SetUserCardController from "../controllers/SetUserCardController.js";
import EventLimiter from "../utils/EventLimiter.js";

class CreateSceneController {
    static async main(gameScene, data) {
        const playersData = data.players;
        await this.loadBackground(gameScene);
        this.createTile(gameScene);
        this.createPlayers(gameScene, playersData);
    }

    static async loadBackground(gameScene) {
        const background = gameScene.add.image(0, 0, "background").setOrigin(0);
        background.setDisplaySize(gameScene.scale.width, gameScene.scale.height);
    }

    static createTile(gameScene) {
        // Dimensiones de cada rombo
        const tileWidth = 65;
        const tileHeight = 33;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;

        // Centro en X para alinear la rejilla
        const centerX = gameScene.scale.width / 2;

        // Cantidad de filas/columnas
        const rows = 30;
        const cols = 30;

        // 1. Crear un Blitter en lugar de 900 sprites.
        //    El Blitter pone la imagen "tile" en muchas posiciones de forma muy eficiente.
        const blitter = gameScene.add.blitter(0, 0, "tile");

        // Guardamos la información de posición de cada celda si fuera necesario
        // (no es imprescindible, pero te permite acceder a x,y de cada tile).
        gameScene.tiles = [];

        for (let row = 0; row < rows; row++) {
            gameScene.tiles[row] = [];
            for (let col = 0; col < cols; col++) {
                const x = (col - row) * halfTileWidth + centerX;
                const y = (col + row) * halfTileHeight;

                // "bob" es la instancia del Blitter
                const bob = blitter.create(x, y);

                // Guarda lo que necesites, por ejemplo, su posición real de dibujo
                gameScene.tiles[row][col] = { bob, gridPos: { x: col, y: row } };
            }
        }

        // 2. Definir la forma "rombo" en coordenadas locales alrededor de (0,0).
        //    Centramos la figura en (0,0) para que podamos hacer el test con coords locales:
        const diamondPolygon = new Phaser.Geom.Polygon([
            { x: -halfTileWidth, y: 0 },
            { x: 0, y: -halfTileHeight },
            { x: halfTileWidth, y: 0 },
            { x: 0, y: halfTileHeight }
        ]);

        // 3. Crear UNA zona interactiva que cubra toda la escena.
        //    Así no tenemos 900 sprites interactivos.
        const zone = gameScene.add.zone(0, 0, gameScene.scale.width, gameScene.scale.height)
            .setOrigin(0)
            .setInteractive();

        // 4. Al hacer clic, invertimos la fórmula isométrica para averiguar col, row.
        zone.on("pointerdown", (pointer) => {
            if (!EventLimiter.canClick()) return;

            const mx = pointer.worldX;
            const my = pointer.worldY;

            // Fórmula isométrica invertida, pero usando 'round' para evitar que se pierdan bordes.
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

            // Verificamos si realmente cae dentro del rombo (evita clics en las esquinas adyacentes)
            if (Phaser.Geom.Polygon.Contains(diamondPolygon, localX, localY)) {
                console.log(`Clicked tile at ${col}, ${row}`);
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

            console.log("Players loaded", gameScene.players);

            SetUserCardController.main(gameScene, {
                username: socket.user.username,
                is_admin: socket.user.is_admin,
                is_vip: socket.user.is_vip,
                is_selected: false,
                gender: socket.user.gender,
            });
        })();
    }
}

export default CreateSceneController;
