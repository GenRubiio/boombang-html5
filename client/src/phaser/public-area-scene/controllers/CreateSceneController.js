import AddPlayerController from "../controllers/AddPlayerController.js";
import socket from "../../../sockets/socket"; // Conexión Socket.io

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
            this.createPulseAnimation(tile.scene, pointer.worldX, pointer.worldY);
        });
    }

    static createPulseAnimation(scene, x, y) {
        // Crear un gráfico de óvalo negro transparente
        const pulse = scene.add.graphics();
        pulse.fillStyle(0x000000, 0.3); // Negro transparente con menos opacidad
        pulse.fillEllipse(0, 0, 20, 10); // Tamaño inicial pequeño

        // Configurar la posición
        pulse.setPosition(x, y);
        pulse.setDepth(100); // Asegurarse de que esté encima de otros elementos

        // Crear la animación de expansión y desvanecimiento
        scene.tweens.add({
            targets: pulse,
            scaleX: 1.5,  // Expansión moderada
            scaleY: 1.2,  // Expansión moderada
            alpha: 0,    // Desvanece
            duration: 300, // Duración rápida
            ease: "Cubic.easeOut",
            onComplete: () => {
                pulse.destroy(); // Eliminar después de la animación
            },
        });
    }

    static createPlayers(gameScene, players) {
        // Crear los jugadores iniciales
        (async () => {
            for (const player of players) {
                await AddPlayerController.main(gameScene, player);
            }

            if (gameScene.vueComponent) {
                console.log("Setting loading to false");
                gameScene.vueComponent.loading = false; // Cambiar el estado de 'loading'
            }
        })();
    }
}

export default CreateSceneController;
