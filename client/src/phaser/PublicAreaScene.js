import Phaser from "phaser";
import socket from "../sockets/socket"; // Conexión Socket.io
import backgroundImg from "../assets/images/background.png"; // Imagen de fondo
import tileImg from "../assets/images/tile.png"; // Imagen del rombo
import shadowImg from "../assets/images/shadow.png"; // Imagen de la sombra
import playerImg from "../assets/images/player.png"; // Imagen del personaje
import loadingImage from "../assets/images/loading_image.png"; // Imagen de carga
import PublicAreaSceneResponseSockets from "./public-area-scene/sockets/PublicAreaSceneResponseSockets"; // Controladores de sockets
import PublicAreaSceneRequestSockets from "./public-area-scene/sockets/PublicAreaSceneRequestSockets"; // Controladores de sockets
import ResponseSocketsEnum from "./enums/ResponseSocketsEnum"; // Enumeración de eventos de sockets
import RequestSocketsEnum from "./enums/RequestSocketsEnum"; // Enumeración de eventos de sockets

export default class PublicAreaScene extends Phaser.Scene {
    constructor() {
        super("PublicAreaScene");
        this.players = {}; // Reiniciar al crear una nueva instancia
    }

    init(data) {
        this.areaId = data.areaId; // ID de la sala
        this.players = {}; // Objeto para almacenar jugadores en la sala
        this.vueComponent = data.vueComponent;
    }

    preload() {
        this.load.image("background", backgroundImg);
        this.load.image("tile", tileImg);
        this.load.image("shadow", shadowImg);
        this.load.image("player", playerImg);
        this.load.image("loading", loadingImage);
    }

    create() {
        PublicAreaSceneRequestSockets.main(this); // Solicitar datos iniciales de la sala
        PublicAreaSceneResponseSockets.main(this); // Inicializar controladores de sockets

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('destroy', this.destroy, this);
    }

    shutdown() {
        console.log("Shutting down scene and removing socket listeners");
        Object.values(ResponseSocketsEnum).forEach(event => {
            socket.off(event);
        });
        Object.values(RequestSocketsEnum).forEach(event => {
            socket.off(event);
        });
    }

    destroy() {
        this.shutdown();
    }
}
