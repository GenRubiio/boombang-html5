import Phaser from "phaser";
import socket from "../sockets/socket"; // Conexión Socket.io
import shadowImg from "../assets/images/shadow.png"; // Imagen de la sombra
import playerImg from "../assets/images/player.png"; // Imagen del personaje
import PublicAreaSceneResponseSockets from "./public-area-scene/sockets/PublicAreaSceneResponseSockets"; // Controladores de sockets
import PublicAreaSceneRequestSockets from "./public-area-scene/sockets/PublicAreaSceneRequestSockets"; // Controladores de sockets
import ResponseSocketsEnum from "../enums/ResponseSocketsEnum"; // Enumeración de eventos de sockets
import RequestSocketsEnum from "../enums/RequestSocketsEnum"; // Enumeración de eventos de sockets
import OverheadChatAnimation from "./public-area-scene/animations/OverheadChatAnimation"; // Animación de chat

export default class PublicAreaScene extends Phaser.Scene {
    constructor() {
        super("PublicAreaScene");
        this.players = {}; // Reiniciar al crear una nueva instancia
        this.avatarAnimations = {}; // Reiniciar al crear una nueva instancia
    }

    init(data) {
        this.areaId = data.areaId; // ID de la sala
        this.players = {}; // Objeto para almacenar jugadores en la sala
        this.avatarAnimations = {}; // Objeto para almacenar animaciones de avatares
        this.vueComponent = data.vueComponent;
    }

    preload() {
        //this.load.plugin('rexcolorreplacepipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcolorreplacepipelineplugin.min.js', true);
        this.load.image("background", "/assets/game/scenarios/" + this.areaId + "/background.png");
        this.load.image("tile", "/assets/game/scenarios/tile.png");

        this.load.image("shadow", shadowImg);
        this.load.image("player", playerImg);
        this.input.enabled = true;
        this.input.topOnly = false; // Permitir que objetos en capas más bajas reciban eventos
    }

    create() {
        PublicAreaSceneRequestSockets.main(this); // Solicitar datos iniciales de la sala
        PublicAreaSceneResponseSockets.main(this); // Inicializar controladores de sockets

        this.chatManager = new OverheadChatAnimation(this);

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('destroy', this.destroy, this);
        this.scene.pauseOnBlur = false;
        this.scene.pauseOnHide = false;
    }

    shutdown() {
        //console.log("Shutting down scene with exclusion lists.");

        // Listas de exclusión
        const excludedResponseEvents = [
            ResponseSocketsEnum.UPDATE_PUBLIC_AREAS,
            ResponseSocketsEnum.JOIN_PUBLIC_AREA
        ];

        const excludedRequestEvents = [
            RequestSocketsEnum.GET_PUBLIC_AREAS,
            RequestSocketsEnum.JOIN_PUBLIC_AREA
        ];

        // Remover solo eventos que no están en las listas de exclusión
        Object.values(ResponseSocketsEnum).forEach((event) => {
            if (!excludedResponseEvents.includes(event)) {
                //console.log(`Eliminando evento de respuesta de socket: ${event}`);
                socket.off(event);
            }
        });

        Object.values(RequestSocketsEnum).forEach((event) => {
            if (!excludedRequestEvents.includes(event)) {
                //console.log(`Eliminando evento de solicitud de socket: ${event}`);
                socket.off(event);
            }
        });

        if (this.chatManager) {
            this.chatManager.destroy();
            this.chatManager = null;
        }
    }

    destroy() {
        this.shutdown();
    }
}
