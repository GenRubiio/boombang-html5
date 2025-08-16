import AddUserController from "./AddUserController.js";
import socket from "../../../sockets/socket.js"; // Conexión Socket.io
import RequestSocketsEnum from "../../../enums/RequestSocketsEnum.js";
import FloorPulseAnimation from "../../animations/FloorPulseAnimation.js";
import SetUserCardController from "../scene/SetUserCardController.js";
import EventLimiter from "../../../utils/EventLimiter.js";

class CreateSceneController {
    //TODO: El bob y blitter esta consumiendo 5% de CPU hay que condicionarlo para que no aparezca si no es necesario. Ya lo he comprobado y solo hay que quitarlo
    static async main(gameScene, data) {
        const usersData = data.players;
        const sceneryData = data.scenery;

        this.createTile(gameScene, sceneryData.game_map, sceneryData.map_rows, sceneryData.map_cols);
        this.createUsers(gameScene, usersData);
    }

    static createTile(gameScene, map, rows, cols) {
        const tileWidth = 65;
        const tileHeight = 33;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;

        const W = gameScene.scale.width;
        const H = gameScene.scale.height;
        const centerX = W / 2;

        const blitter = gameScene.add.blitter(0, 0, "tile");
        blitter.setDepth(100);

        // Si quieres seguir guardando referencias solo para los tiles visibles:
        gameScene.tiles = Array.from({ length: rows }, () => Array(cols).fill(null));

        // --------- Cálculo de límites de visibilidad ----------
        // s = row + col controla la "diagonal" (afecta a Y)
        // y = s * halfTileHeight debe caer dentro de pantalla (con pequeño margen)
        const marginY = halfTileHeight; // margen para bordes
        const sMaxByHeight = Math.floor((H + marginY) / halfTileHeight);
        const sMax = Math.min(sMaxByHeight, (rows - 1) + (cols - 1)); // tope real del mapa

        // Para X: x = (col - row) * halfTileWidth + centerX debe entrar en [-margenX, W + margenX]
        const marginX = halfTileWidth;
        const diffMin = Math.ceil((-marginX - centerX) / halfTileWidth);           // (col - row) mínimo
        const diffMax = Math.floor((W + marginX - centerX) / halfTileWidth);       // (col - row) máximo

        // Recorremos por diagonales s = row + col, solo hasta sMax (parte superior del rombo)
        for (let s = 0; s <= sMax; s++) {
            // col está en [max(0, s-(rows-1)), min(cols-1, s)] para mantener row y col dentro de la matriz
            const colStart = Math.max(0, s - (rows - 1));
            const colEnd = Math.min(cols - 1, s);

            for (let col = colStart; col <= colEnd; col++) {
                const row = s - col;

                // Filtro por X: (col - row) debe caer en [diffMin, diffMax]
                const diff = col - row;
                if (diff < diffMin || diff > diffMax) continue;

                // Coordenadas proyectadas
                const x = (col - row) * halfTileWidth + centerX;
                const y = (col + row) * halfTileHeight;

                // Doble verificación por seguridad (clipping de pantalla)
                if (x < -marginX || x > W + marginX) continue;
                if (y < -marginY || y > H + marginY) continue;

                // Crear bob solo si se quiere mostrar algo sobre el tile
                const isClickable = map[row][col] === 0;
                const bob = blitter.create(x - halfTileWidth, y - halfTileHeight);

                if (import.meta.env.VITE_MAP_MAKER == "true" || import.meta.env.VITE_SHOW_ISOMAP == "true") {
                    if (!isClickable) bob.tint = 0x808080;
                    bob.alpha = 0.5;
                } else {
                    bob.alpha = 0;
                }

                // Guarda referencia SOLO para los visibles
                gameScene.tiles[row][col] = { bob, gridPos: { x: col, y: row }, isClickable };
            }
        }

        // Rombo local para test de click fino
        const diamondPolygon = new Phaser.Geom.Polygon([
            { x: -halfTileWidth, y: 0 },
            { x: 0, y: -halfTileHeight },
            { x: halfTileWidth, y: 0 },
            { x: 0, y: halfTileHeight }
        ]);

        const zone = gameScene.add.zone(0, 0, W, H).setOrigin(0).setInteractive();

        zone.on("pointerdown", (pointer) => {
            if (!EventLimiter.canClick()) return;

            const mx = pointer.worldX;
            const my = pointer.worldY;

            // Inversión iso
            const colFloat = ((mx - centerX) / halfTileWidth + my / halfTileHeight) / 2;
            const rowFloat = (my / halfTileHeight - (mx - centerX) / halfTileWidth) / 2;

            const col = Math.round(colFloat);
            const row = Math.round(rowFloat);

            if (col < 0 || col >= cols || row < 0 || row >= rows) return;

            // Centro del tile
            const tileCenterX = (col - row) * halfTileWidth + centerX;
            const tileCenterY = (col + row) * halfTileHeight;
            const localX = mx - tileCenterX;
            const localY = my - tileCenterY;

            if (!Phaser.Geom.Polygon.Contains(diamondPolygon, localX, localY)) return;

            // Determina clickeable desde el mapa (no dependas de gameScene.tiles)
            const isClickable = map[row][col] === 0;

            if (!isClickable) {
                if (import.meta.env.VITE_APP_ENV === "local") {
                    console.log(`Tile at ${col}, ${row} is not clickable.`);
                }
                socket.emit(RequestSocketsEnum.CHANGE_LOOK, { x: col, y: row });

                if (import.meta.env.VITE_MAP_MAKER === "true") {
                    // Actualiza el mapa (aunque no exista bob)
                    map[row][col] = 0;

                    // Si existe un bob visible, actualiza aspecto
                    const t = gameScene.tiles[row][col];
                    if (t?.bob) {
                        t.isClickable = true;
                        t.bob.clearTint?.();
                        t.bob.alpha = 0.5;
                    }
                    if (import.meta.env.VITE_APP_ENV === "local") console.log(map);
                }
                return;
            }

            if (import.meta.env.VITE_APP_ENV === "local") {
                console.log(`Clicked tile at ${col}, ${row}`);
            }
            socket.emit(RequestSocketsEnum.USER_MOVE, { x: col, y: row });
            FloorPulseAnimation.main(gameScene, mx, my);
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
