import Phaser from "phaser";
import socket from "../sockets/socket"; // Conexión Socket.io
import backgroundImg from "../assets/images/background.png"; // Imagen de fondo
import tileImg from "../assets/images/tile.png"; // Imagen del rombo
import shadowImg from "../assets/images/shadow.png"; // Imagen de la sombra
import playerImg from "../assets/images/player.png"; // Imagen del personaje
import loadingImage from "../assets/images/loading_image.png"; // Imagen de carga
import GameSceneSockets from "./game-scene/sockets/GameSceneSockets"; // Controladores de sockets

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
        this.players = {}; // Reiniciar al crear una nueva instancia
    }

    init(data) {
        this.roomId = data.roomId; // ID de la sala
        this.players = {}; // Objeto para almacenar jugadores en la sala
    }

    preload() {
        // Cargar las imágenes necesarias
        this.load.image("background", backgroundImg);
        this.load.image("tile", tileImg);
        this.load.image("shadow", shadowImg);
        this.load.image("player", playerImg);
        this.load.image("loading", loadingImage);
    }

    create() {
        // Mostrar la imagen de carga
        this.loadingImage = this.add.image(this.scale.width / 2, this.scale.height / 2, "loading");
        this.loadingImage.setOrigin(0.5);
        this.loadingImage.setDepth(9999); // Asegúrate de que esté al frente

        // Solicitar datos iniciales de la sala
        socket.emit("request:get_public_area_data", { roomId: this.roomId });

        // Escuchar respuesta con datos de la sala
        socket.on("response:get_public_area_data", (data) => {
            this.createScene(data.players); // Crear escena con jugadores
        });

        // Escuchar cuando un nuevo jugador entra
        socket.on("userJoin", (player) => {
            this.addPlayer(player.id, player.x, player.y);
        });

        // Escuchar cuando un jugador se mueve

        // Escuchar cuando un jugador sale
        socket.on("userLeave", (id) => {
            this.removePlayer(id);
        });

        GameSceneSockets.main(this); // Inicializar controladores de sockets

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('destroy', this.destroy, this); // 
    }

    createScene(players) {
        // Crear el fondo
        const background = this.add.image(0, 0, "background").setOrigin(0);
        background.setDisplaySize(this.scale.width, this.scale.height);

        // Dimensiones de cada rombo
        const tileWidth = 65;
        const tileHeight = 33;

        // Crear una rejilla de rombos isométrica
        this.tiles = [];
        const rows = 30; // Número de filas
        const cols = 30; // Número de columnas

        for (let row = 0; row < rows; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < cols; col++) {
                // Calcular posición de cada rombo en una cuadrícula isométrica
                const x = (col - row) * (tileWidth / 2) + this.scale.width / 2;
                const y = (col + row) * (tileHeight / 2);

                // Crear el rombo
                const tile = this.add.image(x, y, "tile").setInteractive();
                tile.setData("gridPos", { x: col, y: row });
                this.tiles[row][col] = tile;

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
            this.addPlayer(player.id, player.x, player.y);
        });

        // Ocultar la imagen de carga
        if (this.loadingImage) {
            this.loadingImage.destroy();
        }
    }

    addPlayer(id, x, y) {
        if (this.players[id]) return;

        // Crear sombra
        const shadow = this.add.image(0, 0, "shadow").setDisplaySize(54, 20);
        shadow.setDepth(0);

        // Crear personaje
        const player = this.add.image(0, 0, "player").setDisplaySize(83, 120);
        player.setDepth(1);

        // Posicionar sombra y personaje
        this.movePlayerToTile({ x, y }, player, shadow);

        // Almacenar jugador
        this.players[id] = { player, shadow, position: { x, y } };
    }

    movePlayerToTile(position, player, shadow) {
        const tileWidth = 65;
        const tileHeight = 33;

        // Calcular posición en pantalla del tile en la cuadrícula isométrica
        const centerX = (position.x - position.y) * (tileWidth / 2) + this.scale.width / 2;
        const centerY = (position.x + position.y) * (tileHeight / 2);

        // Posicionar sombra
        shadow.setPosition(centerX, centerY);
        shadow.setDepth(centerY);

        // Posicionar personaje encima de la sombra
        const playerX = centerX;
        const playerY = centerY - (shadow.displayHeight / 2) - (player.displayHeight / 2);
        player.setPosition(playerX, playerY);
        player.setDepth(centerY);
    }

    removePlayer(id) {
        if (!this.players[id]) return;

        // Eliminar sombra y personaje
        this.players[id].shadow.destroy();
        this.players[id].player.destroy();
        delete this.players[id];
    }

    // Función para convertir coordenadas de pantalla a coordenadas de la cuadrícula
    screenToGrid(x, y) {
        const tileWidth = 65;
        const tileHeight = 33;

        const gridX = ((x - this.scale.width / 2) / (tileWidth / 2) + y / (tileHeight / 2)) / 2;
        const gridY = (y / (tileHeight / 2) - (x - this.scale.width / 2) / (tileWidth / 2)) / 2;

        return { x: Math.floor(gridX), y: Math.floor(gridY) };
    }

    // Evento de clic en cualquier parte de la escena
    registerGlobalClick() {
        this.input.on('pointerdown', (pointer) => {
            const { x, y } = this.screenToGrid(pointer.x, pointer.y);
            console.log(`Clicked at grid position ${x}, ${y}`);
            // Aquí puedes enviar la posición al servidor o mover al jugador
        });
    }

    shutdown() {
        console.log("Shutting down scene and removing socket listeners");
        socket.off("response:get_public_area_data");
        socket.off("userJoin");
        socket.off("response:user_move");
        socket.off("userLeave");
    }

    destroy() {
        this.shutdown();
    }
}
