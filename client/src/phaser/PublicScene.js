import Phaser from "phaser";
import socket from "../sockets/socket"; // Conexión Socket.io
import asset_shadow_image from "@/assets/game/avatar/shadow.webp"; // Imagen de la sombra
import asset_shadow_selected_image from "@/assets/game/avatar/shadow_selected.webp"; // Imagen de la sombra seleccionada
import asset_tile_image from "@/assets/game/scene/tile.webp"; // Imagen del suelo
import SceneRequestSockets from "./sockets/SceneRequestSockets"; // Controladores de sockets
import SceneResponseSockets from "./sockets/SceneResponseSockets"; // Controladores de sockets
import OverheadChatAnimation from "./animations/OverheadChatAnimation"; // Animación de chat
import PublicSceneLoader from "./loaders/PublicSceneLoader"; // Precargador de escena
import CreateSceneController from "./controllers/scene/CreateSceneController"; // Controlador de creación de escena
import RemovePhaserSocketsUtil from "../utils/RemovePhaserSocketsUtil"; // Utilidad para eliminar sockets
import TintManager from "./managers/TintManager"; // Gestor de tintes
import PublicSceneResponse from "./sockets/PublicSceneResponse"; // Respuesta de escena pública
import asset_ui_shop_image from "@/assets/game/scene/ui/shop.webp";
import asset_ui_avatars_image from "@/assets/game/scene/ui/avatars.webp";
import asset_interaction_background_image from "@/assets/game/scene/ui/interaction.png";
import asset_kiss_image from "@/assets/game/scene/interactions/kiss.webp";
import asset_drink_image from "@/assets/game/scene/interactions/drink.webp";
import asset_rose_image from "@/assets/game/scene/interactions/rose.webp";
import asset_accept_image from "@/assets/game/scene/interactions/accept.png";
import asset_reject_image from "@/assets/game/scene/interactions/reject.png";
import i18n from "../plugins/i18n";
import ButtonsPublicSceneHtml from "./html/public-scene/ButtonsPublicSceneHtml";


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
        PublicSceneLoader.main(this, true); // Precargar imágenes específicas de la sala
        this.load.image("tile", asset_tile_image);
        this.load.image("shadow", asset_shadow_image);
        this.load.image("shadow_selected", asset_shadow_selected_image);
        this.load.image("asset_ui_shop_image", asset_ui_shop_image);
        this.load.image("asset_ui_avatars_image", asset_ui_avatars_image);
        this.load.image("asset_interaction_background_image", asset_interaction_background_image);
        this.load.image("asset_kiss_image", asset_kiss_image);
        this.load.image("asset_drink_image", asset_drink_image);
        this.load.image("asset_rose_image", asset_rose_image);
        this.load.image("asset_accept_image", asset_accept_image);
        this.load.image("asset_reject_image", asset_reject_image);
    }

    create() {
        if (!this.plugins.get('rexColorReplacePipeline')) {
            this.plugins.start('rexColorReplacePipeline');
        }

        this.tintMgr = new TintManager(this);
        this.scene.pauseOnBlur = false;
        this.scene.pauseOnHide = false;
        this.input.enabled = true;
        this.input.topOnly = false;

        SceneRequestSockets.main(this); // Solicitar datos iniciales de la sala
        SceneResponseSockets.main(this); // Inicializar controladores de sockets
        PublicSceneResponse.main(this); // Respuesta de la escena pública

        PublicSceneLoader.main(this, false);
        CreateSceneController.main(this, this.sceneData); // Crear escena con jugadores
        this.vueComponent.$emit("updateLoading", false);

        this.chatManager = new OverheadChatAnimation(this);

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('destroy', this.destroy, this);
        this.scene.pauseOnBlur = false;
        this.scene.pauseOnHide = false;

        this.createHTMLButtons();
    }

    createHTMLButtons() {
        // Create HTML buttons using DOM
        const buttonsHtml = ButtonsPublicSceneHtml.load();
        
        this.buttonsContainer = this.add.dom(0, 0).createFromHTML(buttonsHtml);
        this.buttonsContainer.setOrigin(0, 0);
        this.buttonsContainer.setScrollFactor(0);
        this.buttonsContainer.setDepth(10000);

        // Add event listeners for buttons
        const buttonsElement = this.buttonsContainer.node;

        // Detener la propagación de eventos para que no interfieran con la escena de Phaser
        const stopPropagation = (event) => event.stopPropagation();
        buttonsElement.addEventListener('pointerdown', stopPropagation);
        buttonsElement.addEventListener('mousedown', stopPropagation);
        buttonsElement.addEventListener('touchstart', stopPropagation);
        
        // Shop button
        const shopButton = buttonsElement.querySelector('[data-action="shop"]');
        if (shopButton) {
            shopButton.addEventListener('click', (event) => {
                if (import.meta.env.VITE_APP_ENV === "local") {
                    console.log('Botón de tienda pulsado');
                }
            });
            
            // Tooltip functionality
            const shopTooltip = shopButton.querySelector('.tooltip');
            shopButton.addEventListener('mouseenter', () => {
                if (shopTooltip) shopTooltip.style.opacity = '1';
            });
            shopButton.addEventListener('mouseleave', () => {
                if (shopTooltip) shopTooltip.style.opacity = '0';
            });
        }

        // Avatars button
        const avatarsButton = buttonsElement.querySelector('[data-action="avatars"]');
        if (avatarsButton) {
            avatarsButton.addEventListener('click', (event) => {
                if (import.meta.env.VITE_APP_ENV === "local") {
                    console.log('Botón de avatares pulsado');
                }
                // Emit event to Vue component to show avatar selection popup
                if (this.vueComponent && this.vueComponent.showAvatarSelection) {
                    this.vueComponent.showAvatarSelection();
                }
            });
            
            // Tooltip functionality
            const avatarsTooltip = avatarsButton.querySelector('.tooltip');
            avatarsButton.addEventListener('mouseenter', () => {
                if (avatarsTooltip) avatarsTooltip.style.opacity = '1';
            });
            avatarsButton.addEventListener('mouseleave', () => {
                if (avatarsTooltip) avatarsTooltip.style.opacity = '0';
            });
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
