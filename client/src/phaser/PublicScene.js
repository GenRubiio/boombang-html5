import Phaser from "phaser";
import socket from "../sockets/socket"; // Conexión Socket.io
import asset_shadowImage from "../assets/game/avatar/shadow.png"; // Imagen de la sombra
import asset_tileImage from "../assets/game/scene/tile.png"; // Imagen del suelo
import PublicSceneResponseSockets from "./sockets/PublicSceneResponseSockets"; // Controladores de sockets
import PublicSceneRequestSockets from "./sockets/PublicSceneRequestSockets"; // Controladores de sockets
import SceneRequestSockets from "./sockets/SceneRequestSockets"; // Controladores de sockets
import SceneResponseSockets from "./sockets/SceneResponseSockets"; // Controladores de sockets
import OverheadChatAnimation from "./animations/OverheadChatAnimation"; // Animación de chat
import PublicSceneLoader from "./loaders/PublicSceneLoader"; // Precargador de escena
import CreateSceneController from "./controllers/public-scene/CreateSceneController"; // Controlador de creación de escena
import RemovePhaserSocketsUtil from "../utils/RemovePhaserSocketsUtil"; // Utilidad para eliminar sockets

export default class PublicScene extends Phaser.Scene {
    constructor() {
        super("PublicScene");
        this.users = {}; // Reiniciar al crear una nueva instancia
        this.avatarAnimations = {}; // Reiniciar al crear una nueva instancia
    }

    init(data) {
        this.sceneType = data.sceneType; // ID de la sala
        this.sceneData = data.sceneData; // Datos de la escena
        this.users = {}; // Objeto para almacenar jugadores en la sala
        this.avatarAnimations = {}; // Objeto para almacenar animaciones de avatares
        this.vueComponent = data.vueComponent;
    }

    preload() {
        //this.load.plugin('rexcolorreplacepipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcolorreplacepipelineplugin.min.js', true);
        PublicSceneLoader.main(this, this.sceneType, true); // Precargar imágenes específicas de la sala
        this.load.image("tile", asset_tileImage);
        this.load.image("shadow", asset_shadowImage);

        this.input.enabled = true;
        this.input.topOnly = false; // Permitir que objetos en capas más bajas reciban eventos
    }

    create() {
        SceneRequestSockets.main(this); // Solicitar datos iniciales de la sala
        SceneResponseSockets.main(this); // Inicializar controladores de sockets
        PublicSceneRequestSockets.main(this); // Solicitar datos iniciales de la sala
        PublicSceneResponseSockets.main(this); // Inicializar controladores de sockets

        PublicSceneLoader.main(this, this.sceneData.scenery.type, false);
        CreateSceneController.main(this, this.sceneData); // Crear escena con jugadores
        this.vueComponent.$emit("updateLoading", false);

        this.chatManager = new OverheadChatAnimation(this);

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('destroy', this.destroy, this);
        this.scene.pauseOnBlur = false;
        this.scene.pauseOnHide = false;
    }

    shutdown() {
        //console.log("Shutting down scene with exclusion lists.");

        RemovePhaserSocketsUtil.main(socket); // Eliminar eventos de socket

        if (this.chatManager) {
            this.chatManager.destroy();
            this.chatManager = null;
        }
    }

    destroy() {
        this.shutdown();
    }
}
