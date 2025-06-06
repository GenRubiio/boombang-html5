import Phaser from "phaser";
import socket from "../sockets/socket"; // Conexión Socket.io
import asset_shadow_image from "../assets/game/avatar/shadow.png"; // Imagen de la sombra
import asset_tile_image from "../assets/game/scene/tile.png"; // Imagen del suelo
import SceneRequestSockets from "./sockets/SceneRequestSockets"; // Controladores de sockets
import SceneResponseSockets from "./sockets/SceneResponseSockets"; // Controladores de sockets
import OverheadChatAnimation from "./animations/OverheadChatAnimation"; // Animación de chat
import PublicSceneLoader from "./loaders/PublicSceneLoader"; // Precargador de escena
import CreateSceneController from "./controllers/scene/CreateSceneController"; // Controlador de creación de escena
import RemovePhaserSocketsUtil from "../utils/RemovePhaserSocketsUtil"; // Utilidad para eliminar sockets
import TintManager from "./managers/TintManager"; // Gestor de tintes
import PublicSceneResponse from "./sockets/PublicSceneResponse"; // Respuesta de escena pública


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
        this.selectedShadow = null; // Sombra seleccionada
        this.activeItems = new Map();
    }

    preload() {
        PublicSceneLoader.main(this, this.sceneType, true); // Precargar imágenes específicas de la sala
        this.load.image("tile", asset_tile_image);
        this.load.image("shadow", asset_shadow_image);
    }

    create() {
        this.tintMgr = new TintManager(this);
        this.scene.pauseOnBlur = false;
        this.scene.pauseOnHide = false;
        this.input.enabled = true;
        this.input.topOnly = false;

        SceneRequestSockets.main(this); // Solicitar datos iniciales de la sala
        SceneResponseSockets.main(this); // Inicializar controladores de sockets
        PublicSceneResponse.main(this); // Respuesta de la escena pública

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
