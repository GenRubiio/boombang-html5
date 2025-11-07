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
import AvatarSystemController from "./controllers/AvatarSystemController.js"; // Nuevo sistema de avatares
import DarkeningUtils from "../utils/DarkeningUtils.js"; // Utilidad de oscurecimiento
import asset_ui_shop_image from "@/assets/game/scene/ui/shop.webp";
import asset_ui_avatars_image from "@/assets/game/scene/ui/avatars.webp";
import asset_interaction_background_image from "@/assets/game/scene/ui/interaction.png";
import asset_kiss_image from "@/assets/game/scene/interactions/kiss.webp";
import asset_drink_image from "@/assets/game/scene/interactions/drink.webp";
import asset_rose_image from "@/assets/game/scene/interactions/rose.webp";
import asset_accept_image from "@/assets/game/scene/interactions/accept.png";
import asset_reject_image from "@/assets/game/scene/interactions/reject.png";
import ButtonsPublicSceneHtml from "./html/public-scene/ButtonsPublicSceneHtml";
import SceneUtils from "../utils/SceneUtils";
import earlyEventBuffer from "../utils/EarlyEventBuffer"; // Buffer de eventos tempranos
import AddUserController from "./controllers/scene/AddUserController"; // Para procesar usuarios del buffer


export default class PublicScene extends Phaser.Scene {
    constructor() {
        super("PublicScene");
        this.users = {}; // Reiniciar al crear una nueva instancia
        this.avatarAnimations = {}; // Reiniciar al crear una nueva instancia
        
        // Estado del sistema de avatares
        this.avatarsEssentialReady = false;
        this.allAvatarsReady = false;
        this.avatarLoadingProgress = 0;
        
        // Sistema de buffer de eventos
        this.isSceneReady = false;
        this.eventBuffer = [];
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

    async create() {
        //console.log("🎮 Inicializando PublicScene...");
        
        if (!this.plugins.get('rexColorReplacePipeline')) {
            this.plugins.start('rexColorReplacePipeline');
        }

        this.tintMgr = new TintManager(this);
        this.scene.pauseOnBlur = false;
        this.scene.pauseOnHide = false;
        this.input.enabled = true;
        this.input.topOnly = false;

        // Verificar si el sistema de avatares está inicializado
        const avatarSystemReady = this.registry.get('avatarSystemReady');
        if (!avatarSystemReady) {
            //console.warn("⚠️ Sistema de avatares no está listo, inicializando en escena...");
            this.initializeAvatarSystemFallback();
        } else {
            //console.log("✅ Sistema de avatares ya inicializado");
        }

        // Configurar listeners para eventos del sistema de avatares
        this.setupAvatarSystemListeners();

        // Configurar sockets PRIMERO para no perder eventos
        SceneRequestSockets.main(this); // Solicitar datos iniciales de la sala
        SceneResponseSockets.main(this); // Inicializar controladores de sockets
        PublicSceneResponse.main(this); // Respuesta de la escena pública

        // Inicializar darkeningData ANTES de cargar el background
        if (this.sceneData.scenery.darkening && this.sceneData.scenery.game_time) {
            this.darkeningData = {
                initialGameTime: this.sceneData.scenery.game_time,
                initialTimestamp: Date.now(),
                backgrounds: [],
                arrows: [],
                items: []
            };
            //console.log('🌙 [PublicScene] darkeningData pre-inicializado:', this.darkeningData);
        }

        PublicSceneLoader.main(this, false);
        
        // Crear usuarios iniciales
        await CreateSceneController.main(this, this.sceneData);
        
        this.vueComponent.$emit("updateLoading", false);

        this.chatManager = new OverheadChatAnimation(this);

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('destroy', this.destroy, this);
        this.scene.pauseOnBlur = false;
        this.scene.pauseOnHide = false;

        this.createHTMLButtons();

        // Configurar controlador unificado para mover/ajustar sprites con show_controller
        // Solo si existen elementos registrados por el loader
        SceneUtils.setupPublicMoveController(this);
        
        // Marcar escena como lista
        this.isSceneReady = true;
        
        // Obtener eventos capturados por el EarlyEventBuffer
        const earlyEvents = earlyEventBuffer.deactivateAndFlush();
        
        // Agregar eventos tempranos al buffer de la escena
        earlyEvents.forEach(event => {
            this.eventBuffer.push({
                type: 'NEW_USER_JOIN_SCENE',
                data: event.data,
                callback: () => AddUserController.processUser(this, event.data.user)
            });
        });
        
        // Procesar todos los eventos en buffer con un pequeño delay entre cada uno
        const totalEvents = this.eventBuffer.length;
        if (totalEvents > 0) {
            this.eventBuffer.forEach((bufferedEvent, index) => {
                setTimeout(() => {
                    bufferedEvent.callback();
                }, index * 100); // 100ms de delay entre cada evento
            });
            
            // Limpiar buffer
            this.eventBuffer = [];
        }
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
                    //console.log('Botón de tienda pulsado');
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
                    //console.log('Botón de avatares pulsado');
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

        // Rankings button
        const rankingsButton = buttonsElement.querySelector('[data-action="rankings"]');
        if (rankingsButton) {
            rankingsButton.addEventListener('click', (event) => {
                // Emit event to Vue component to show rankings popup
                if (this.vueComponent && this.vueComponent.showRankings) {
                    this.vueComponent.showRankings();
                }
            });

            // Tooltip functionality
            const rankingsTooltip = rankingsButton.querySelector('.tooltip');
            rankingsButton.addEventListener('mouseenter', () => {
                if (rankingsTooltip) rankingsTooltip.style.opacity = '1';
            });
            rankingsButton.addEventListener('mouseleave', () => {
                if (rankingsTooltip) rankingsTooltip.style.opacity = '0';
            });
        }

        // Inventory button
        const inventoryButton = buttonsElement.querySelector('[data-action="inventory"]');
        if (inventoryButton) {
            inventoryButton.addEventListener('click', (event) => {
                // Emit event to Vue component to show inventory popup
                if (this.vueComponent && this.vueComponent.showInventory) {
                    this.vueComponent.showInventory();
                }
            });

            // Tooltip functionality
            const inventoryTooltip = inventoryButton.querySelector('.tooltip');
            inventoryButton.addEventListener('mouseenter', () => {
                if (inventoryTooltip) inventoryTooltip.style.opacity = '1';
            });
            inventoryButton.addEventListener('mouseleave', () => {
                if (inventoryTooltip) inventoryTooltip.style.opacity = '0';
            });
        }
    }

    /**
     * Configura listeners para eventos del sistema de avatares
     */
    setupAvatarSystemListeners() {
        // Cuando los avatares esenciales estén listos
        this.events.on('avatarsEssentialReady', () => {
            //console.log("⚡ Avatares esenciales listos en PublicScene");
            this.avatarsEssentialReady = true;
        });

        // Cuando todos los avatares estén cargados
        this.events.on('allAvatarsReady', (stats) => {
            //console.log("🎉 Todos los avatares disponibles en PublicScene:", stats);
            this.allAvatarsReady = true;
        });

        // Progreso de carga individual
        this.events.on('avatarLoaded', (data) => {
            this.avatarLoadingProgress = data.loadedCount / data.totalCount;
            // Opcional: actualizar UI de progreso
        });
    }

    /**
     * Inicializa el sistema de avatares como fallback si no está listo
     */
    async initializeAvatarSystemFallback() {
        try {
            const avatarSystemReady = await AvatarSystemController.init(this);
            if (avatarSystemReady) {
                //console.log("✅ Sistema de avatares inicializado como fallback en PublicScene");
                this.registry.set('avatarSystemReady', true);
            }
        } catch (error) {
            //console.error("❌ Error inicializando sistema de avatares en PublicScene:", error);
        }
    }

    /**
     * Método llamado cuando un usuario entra a la sala
     */
    onUserJoinRoom(userData) {
        // AddUserController ya está actualizado para usar el nuevo sistema
        // No necesitas modificar nada aquí
        
        // Opcional: priorizar avatares de usuarios recién entrados
        AvatarSystemController.prioritizeActiveUsers(this);
    }

    /**
     * Método llamado cuando un usuario se desconecta
     */
    onUserDisconnect(userId) {
        // Limpiar del sistema de avatares
        AvatarSystemController.removeUser(userId);
        
        // Lógica existente de limpieza
        if (this.users[userId]) {
            // Ejecutar callbacks de limpieza si existen
            if (this.users[userId].cleanupCallbacks) {
                this.users[userId].cleanupCallbacks.forEach(callback => callback());
            }
            
            delete this.users[userId];
        }
    }

    /**
     * Obtiene estadísticas del sistema de avatares para debugging
     */
    getAvatarStats() {
        return AvatarSystemController.diagnose();
    }

    shutdown() {
        //console.log("🧹 Shutting down PublicScene...");

        // Limpiar buffer de eventos
        this.eventBuffer = [];
        this.isSceneReady = false;
        
        // Limpiar el buffer global de eventos tempranos
        earlyEventBuffer.clear();

        // Detener música de fondo de la escena si existe
        if (this.sceneBackgroundMusic) {
            this.sceneBackgroundMusic.stop();
            this.sceneBackgroundMusic.destroy();
            this.sceneBackgroundMusic = null;
        }

        // Limpiar del sistema de avatares
        Object.keys(this.users).forEach(userId => {
            AvatarSystemController.removeUser(userId);
        });

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

    update() {
        // Aplicar oscurecimiento global si la sala lo requiere
        const roomHasDarkening = this.sceneData?.scenery?.darkening;
        
        if (roomHasDarkening && this.darkeningData) {
            // Calcular la hora actual del juego dinámicamente
            const currentGameTime = DarkeningUtils.calculateCurrentGameTime(
                this.darkeningData.initialGameTime,
                this.darkeningData.initialTimestamp
            );
            
            // Actualizar sceneData con la hora actual
            if (this.sceneData?.scenery) {
                this.sceneData.scenery.game_time = currentGameTime;
            }
            
            DarkeningUtils.applySceneDarkening(this, currentGameTime);
        } else {
            // Limpiar overlay cuando no haya darkening
            if (DarkeningUtils._overlay && !DarkeningUtils._overlay.destroyed) {
                DarkeningUtils._overlay.clear();
            }
        }
    }
}
