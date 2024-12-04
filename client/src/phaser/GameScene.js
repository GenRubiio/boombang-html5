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
        this.vueComponent = data.vueComponent;
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

        GameSceneSockets.main(this); // Inicializar controladores de sockets

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('destroy', this.destroy, this);
    }

    shutdown() {
        console.log("Shutting down scene and removing socket listeners");
        socket.off("response:get_public_area_data");
        socket.off("response:new_user_join_public_area");
        socket.off("response:user_move");
        socket.off("response:user_left_public_area");
    }

    destroy() {
        this.shutdown();
    }
}
