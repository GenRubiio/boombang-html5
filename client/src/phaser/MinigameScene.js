import Phaser from "phaser";
import socket from "../sockets/socket"; // Conexión Socket.io
import asset_shadow_image from "@/assets/game/avatar/shadow.webp"; // Imagen de la sombra
import asset_tile_image from "@/assets/game/scene/tile.webp"; // Imagen del suelo
import SceneRequestSockets from "./sockets/SceneRequestSockets"; // Controladores de sockets
import SceneResponseSockets from "./sockets/SceneResponseSockets"; // Controladores de sockets
import OverheadChatAnimation from "./animations/OverheadChatAnimation"; // Animación de chat
import MinigameSceneLoader from "./loaders/MinigameSceneLoader"; // Precargador de escena
import CreateSceneController from "./controllers/scene/CreateSceneController"; // Controlador de creación de escena
import RemovePhaserSocketsUtil from "../utils/RemovePhaserSocketsUtil"; // Utilidad para eliminar sockets
import TintManager from "./managers/TintManager"; // Gestor de tintes
import AvatarSystemController from "./controllers/AvatarSystemController.js"; // Sistema de avatares

export default class MinigameScene extends Phaser.Scene {
    constructor() {
        super("MinigameScene");
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
        MinigameSceneLoader.main(this, this.sceneType, true); // Precargar imágenes específicas de la sala
        this.load.image("tile", asset_tile_image);
        this.load.image("shadow", asset_shadow_image);
    }

    create() {
        if (!this.plugins.get('rexColorReplacePipeline')) {
            this.plugins.start('rexColorReplacePipeline');
        }
        this.tintMgr = new TintManager(this);
        this.input.enabled = true;
        this.input.topOnly = false; // Permitir que objetos en capas más bajas reciban eventos

        // Verificar si el sistema de avatares está inicializado (igual que en PublicScene)
        const avatarSystemReady = this.registry.get('avatarSystemReady');
        if (!avatarSystemReady) {
            this.initializeAvatarSystemFallback();
        }

        // Configurar listeners para eventos del sistema de avatares
        this.setupAvatarSystemListeners();

        SceneRequestSockets.main(this); // Solicitar datos iniciales de la sala
        SceneResponseSockets.main(this); // Inicializar controladores de sockets

        MinigameSceneLoader.main(this, this.sceneData.scenery.type, false);
        CreateSceneController.main(this, this.sceneData); // Crear escena con jugadores
        this.vueComponent.$emit("updateLoading", false);

        this.chatManager = new OverheadChatAnimation(this);

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('destroy', this.destroy, this);
        this.scene.pauseOnBlur = false;
        this.scene.pauseOnHide = false;
    }

    /**
     * Configura listeners para eventos del sistema de avatares
     */
    setupAvatarSystemListeners() {
        // Cuando los avatares esenciales estén listos
        this.events.on('avatarsEssentialReady', () => {
            this.avatarsEssentialReady = true;
        });

        // Cuando todos los avatares estén cargados
        this.events.on('allAvatarsReady', (stats) => {
            this.allAvatarsReady = true;
        });

        // Progreso de carga individual
        this.events.on('avatarLoaded', (data) => {
            this.avatarLoadingProgress = data.loadedCount / data.totalCount;
        });
    }

    /**
     * Inicializa el sistema de avatares como fallback si no está listo
     */
    async initializeAvatarSystemFallback() {
        try {
            const ready = await AvatarSystemController.init(this);
            if (ready) {
                this.registry.set('avatarSystemReady', true);
            }
        } catch (error) {
            // Silencioso: si falla, la escena seguirá funcionando sin caché persistente
        }
    }

    shutdown() {
        //console.log("Shutting down scene with exclusion lists.");
        RemovePhaserSocketsUtil.main(socket); // Eliminar eventos de socket

        if (this.chatManager) {
            this.chatManager.destroy();
            this.chatManager = null;
        }
        const p = this.plugins.get('rexColorReplacePipeline');
        if (p) {
            this.plugins.stop('rexColorReplacePipeline');
        }
    }

    destroy() {
        this.shutdown();
    }
}
