import Phaser from "phaser";
import socket from "../sockets/socket";
import asset_shadow_image from "@/assets/game/avatar/shadow.webp";
import asset_shadow_selected_image from "@/assets/game/avatar/shadow_selected.webp";
import asset_tile_image from "@/assets/game/scene/tile.webp";
import asset_tile_small_image from "@/assets/game/scene/tile_small.png"; // Imagen del suelo pequeño
import SceneRequestSockets from "./sockets/SceneRequestSockets";
import SceneResponseSockets from "./sockets/SceneResponseSockets";
import OverheadChatAnimation from "./animations/OverheadChatAnimation";
import PrivateSceneLoader from "./loaders/PrivateSceneLoader";
import CreateSceneController from "./controllers/scene/CreateSceneController";
import RemovePhaserSocketsUtil from "../utils/RemovePhaserSocketsUtil";
import TintManager from "./managers/TintManager";
import AvatarSystemController from "./controllers/AvatarSystemController.js"; // Nuevo sistema de avatares
import PrivateSceneUpdateColorsService from "./services/PrivateScene/PrivateSceneUpdateColorsService";
import RequestSocketsEnum from "../enums/RequestSocketsEnum";
import ResponseSocketsEnum from "../enums/ResponseSocketsEnum";
import ButtonsPrivateSceneHtml from "@/phaser/html/private-scene/ButtonsPrivateSceneHtml";
import InventoryPrivateSceneHtml from "@/phaser/html/private-scene/InventoryPrivateSceneHtml";
import DetailPanelPrivateSceneHtml from "@/phaser/html/private-scene/DetailPanelPrivateSceneHtml";
import ColorPanelPrivateSceneHtml from "@/phaser/html/private-scene/ColorPanelPrivateSceneHtml";
import asset_interaction_background_image from "@/assets/game/scene/ui/interaction.png";
import asset_kiss_image from "@/assets/game/scene/interactions/kiss.webp";
import asset_drink_image from "@/assets/game/scene/interactions/drink.webp";
import asset_rose_image from "@/assets/game/scene/interactions/rose.webp";
import asset_accept_image from "@/assets/game/scene/interactions/accept.png";
import asset_reject_image from "@/assets/game/scene/interactions/reject.png";
import CatalogItemTypeOfBehaviorEnum from "../enums/CatalogItemTypeOfBehaviorEnum";
import earlyEventBuffer from "../utils/EarlyEventBuffer"; // Buffer de eventos tempranos
import AddUserController from "./controllers/scene/AddUserController"; // Para procesar usuarios del buffer

export default class PrivateScene extends Phaser.Scene {
    constructor() {
        super("PrivateScene");
        this.users = {};
        this.avatarAnimations = {};
        this.selectedSprite = null;
        /** Blitter for tile overlays */
        this.tileBlitter = null;

        // Estado del sistema de avatares
        this.avatarsEssentialReady = false;
        this.allAvatarsReady = false;
        this.avatarLoadingProgress = 0;

        // Sistema de buffer de eventos
        this.isSceneReady = false;
        this.eventBuffer = [];
    }

    init(data) {
        this.sceneType = data.sceneType;
        this.sceneData = data.sceneData;
        this.users = {};
        this.avatarAnimations = {};
        this.vueComponent = data.vueComponent;
        this.selectedShadow = null;
        if (import.meta.env.VITE_APP_ENV === "local") {
            //console.log("PrivateScene init", this.sceneType, this.sceneData);
        }

        // Factor de escala DPI aplicado en App.vue
        this.dpiScale = 2;

        // Datos dinámicos de inventario y objetos
        this.backpackUserItems = this.sceneData.userInventory;

        // Datos de objetos de escena
        this.sceneItems = this.sceneData.scenery.objects;

        this.moveModeActive = false;    // Modo mover activado/desactivado
        this.selectedObject = null;     // Objeto actualmente seleccionado
        this.detailPanel = null;        // Panel de detalles del objeto seleccionado
        this.originalPositions = {};    // Guarda posiciones originales
        // Inventario dinámico
        this.inventoryItemsList = [...this.backpackUserItems];
        this.inventoryPage = 0;
    }

    /**
     * Detectar si un archivo es un video por su extensión
     */
    isVideoFile(src) {
        if (!src) return false;
        const videoExtensions = ['.webm', '.mp4', '.ogg', '.mov'];
        const extension = src.toLowerCase().substring(src.lastIndexOf('.'));
        return videoExtensions.includes(extension);
    }

    preload() {
        this.load.setCORS('anonymous');
        PrivateSceneLoader.main(this, true);
        this.load.image("tile", asset_tile_image);
        this.load.image("tile_small", asset_tile_small_image);
        this.load.image("shadow", asset_shadow_image);
        this.load.image("shadow_selected", asset_shadow_selected_image);
        this.load.image("asset_interaction_background_image", asset_interaction_background_image);
        this.load.image("asset_kiss_image", asset_kiss_image);
        this.load.image("asset_drink_image", asset_drink_image);
        this.load.image("asset_rose_image", asset_rose_image);
        this.load.image("asset_accept_image", asset_accept_image);
        this.load.image("asset_reject_image", asset_reject_image);

        if (this.sceneData.myScene) {
            // Cargar dinámicamente los assets de inventario
            this.backpackUserItems.forEach(item => {
                let assetSrc = import.meta.env.VITE_APP_ENV == 'local' ? item.spreadsheet : item.spreadsheet_url;
                // Detectar si es un video por la extensión
                if (this.isVideoFile(assetSrc)) {
                    this.load.video(item.sprite_name, assetSrc);
                } else {
                    this.load.image(item.sprite_name, assetSrc);
                }
            });
        }

        // Cargar objetos de escena existentes
        this.sceneItems.forEach(item => {
            if (!this.textures.exists(item.sprite_name) && !this.cache.video.exists(item.sprite_name)) {
                let assetSrc = import.meta.env.VITE_APP_ENV == 'local' ? item.spreadsheet : item.spreadsheet_url;
                // Detectar si es un video por la extensión
                if (this.isVideoFile(assetSrc)) {
                    this.load.video(item.sprite_name, assetSrc);
                } else {
                    this.load.image(item.sprite_name, assetSrc);
                }
            }
        });
    }

    async create() {
        //console.log("🏠 Inicializando PrivateScene...");

        if (!this.plugins.get('rexColorReplacePipeline')) {
            this.plugins.start('rexColorReplacePipeline');
        }
        this.cameras.main.setBackgroundColor('#2ecc71');
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

        SceneRequestSockets.main(this);
        SceneResponseSockets.main(this);

        // Inicializar factor de escala para big_scene ANTES de cargar assets
        this.bigSceneMode = this.sceneData.sceneConfig.big_scene || false;
        this.sceneScaleFactor = this.bigSceneMode ? 0.5 : 1;

        PrivateSceneLoader.main(this, false);

        // Crear usuarios iniciales
        await CreateSceneController.main(this, this.sceneData);

        this.tileBlitter = this.add.blitter(0, 0, "tile");
        this.initializeTileGrid();

        // Marcar tiles ocupados
        this.markOccupiedTiles();

        // Renderizar objetos existentes en la escena
        this.renderSceneObjects();

        this.vueComponent.$emit("updateLoading", false);

        if (this.sceneData.myScene) {
            this.createHTMLInventory();
            this.createHTMLDetailPanel(); // Initialize the detail panel
            this.createHTMLColorPanel(); // Initialize the color panel
        }

        this.chatManager = new OverheadChatAnimation(this);

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('destroy', this.destroy, this);
        this.scene.pauseOnBlur = false;
        this.scene.pauseOnHide = false;

        // Crear botones HTML para todos (propietarios y visitantes)
        this.createHTMLButtons();

        // Solo crear inventario si es el propietario
        if (this.sceneData.myScene) {
            // El inventario ya se crea en la línea 173
        }

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

        this.handleSockets();

        // Notificar al VisibilityManager que la escena está completamente cargada
        if (window.visibilityManager) {
            window.visibilityManager.onSceneLoaded(this);
        }
        // Al recuperar el foco del navegador, refrescar overlays y eventos de mover
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.markOccupiedTiles();
                if (this.moveModeActive) {
                    this.prepareObjectsForMoving();
                }
            }
        });
        PrivateSceneUpdateColorsService.main(this);
    }

    /**
     * Configura listeners para eventos del sistema de avatares (igual que en PublicScene)
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
     * Inicializa el sistema de avatares como fallback si no está listo (igual que en PublicScene)
     */
    async initializeAvatarSystemFallback() {
        try {
            const avatarSystemReady = await AvatarSystemController.init(this);
            if (avatarSystemReady) {
                this.registry.set('avatarSystemReady', true);
            }
        } catch (error) {
            // Silenciar: la escena continuará sin cache persistente si falla
        }
    }

    handleSockets() {
        socket.on(ResponseSocketsEnum.ADD_ITEM_TO_INVENTORY, (data) => {
            if (import.meta.env.VITE_APP_ENV === "local") {
                //console.log('Socket event received:', ResponseSocketsEnum.ADD_ITEM_TO_INVENTORY);
            }
            if (data.item) {
                this.inventoryItemsList.push(data.item);
                this.updateHTMLInventoryUI();
            }
        });
        socket.on(ResponseSocketsEnum.SCENE_REMOVE_ITEM, (data) => {
            if (import.meta.env.VITE_APP_ENV === "local") {
                //console.log('Socket event received:', ResponseSocketsEnum.SCENE_REMOVE_ITEM);
            }
            const itemId = data.user_catalog_item_id;
            const itemToRemove = this.sceneItems.find(i => i.id === itemId);

            if (itemToRemove) {
                // Eliminar sprite y del array de objetos de escena
                if (itemToRemove.sprite) {
                    itemToRemove.sprite.destroy();
                }
                this.sceneItems = this.sceneItems.filter(i => i.id !== itemId);

                // Actualizar escena
                this.markOccupiedTiles();
                this.renderSceneObjects();
            }

            // Re-enable detail panel buttons after server response
            if (this.htmlDetailPanel) {
                this.htmlDetailPanel.enableButtons();
            }
        });
        socket.on(ResponseSocketsEnum.SCENE_PUT_ITEM, (data) => {
            //console.log('📦 SCENE_PUT_ITEM received:', data);
            if (data.item) {
                const existingItem = this.sceneItems.find(i => i.id === data.item.id);
                //console.log('  Existing item?', existingItem ? 'YES (moving)' : 'NO (new item)');

                if (existingItem) {
                    // It's a move, just update the tiles
                    //console.log('  Updating existing item tiles');
                    existingItem.occupied_tiles = data.item.occupied_tiles;
                    this.markOccupiedTiles();
                    this.renderSceneObjects();
                    if (this.moveModeActive) {
                        this.prepareObjectsForMoving();
                    }
                } else {
                    // It's a new item from inventory
                    const item = data.item;
                    const textureName = item.sprite_name;
                    const assetSrc = import.meta.env.VITE_APP_ENV == 'local' ? item.spreadsheet : item.spreadsheet_url;
                    const isVideo = this.isVideoFile(assetSrc);

                    // Check if asset already exists (image or video)
                    const assetExists = isVideo ? this.cache.video.exists(textureName) : this.textures.exists(textureName);

                    //console.log('  Item details:', {
                        textureName,
                        assetSrc,
                        isVideo,
                        assetExists
                    });

                    if (assetExists) {
                        //console.log('  ✅ Asset exists, adding item to scene');
                        this.sceneItems.push(item);
                        this.markOccupiedTiles();
                        this.renderSceneObjects();
                        if (this.moveModeActive) {
                            this.prepareObjectsForMoving();
                        }
                    } else {
                        //console.log('  ⏳ Asset does not exist, loading...');
                        // Asset doesn't exist, load it first
                        if (isVideo) {
                            this.load.video(textureName, assetSrc);
                            this.load.once(`filecomplete-video-${textureName}`, () => {
                                //console.log('  ✅ Video loaded, adding item to scene');
                                this.sceneItems.push(item);
                                this.markOccupiedTiles();
                                this.renderSceneObjects();
                                if (this.moveModeActive) {
                                    this.prepareObjectsForMoving();
                                }
                            });
                        } else {
                            this.load.image(textureName, assetSrc);
                            this.load.once(`filecomplete-image-${textureName}`, () => {
                                //console.log('  ✅ Image loaded, adding item to scene');
                                this.sceneItems.push(item);
                                this.markOccupiedTiles();
                                this.renderSceneObjects();
                                if (this.moveModeActive) {
                                    this.prepareObjectsForMoving();
                                }
                            });
                        }

                        this.load.start();
                    }
                }
            } else {
                //console.log('  ❌ No item in response data');
            }
        });
        socket.on(ResponseSocketsEnum.REMOVE_ITEM_FROM_INVENTORY, (data) => {
            if (import.meta.env.VITE_APP_ENV === "local") {
                //console.log('Socket event received:', ResponseSocketsEnum.REMOVE_ITEM_FROM_INVENTORY);
            }
            const itemId = data.user_catalog_item_id;
            const itemIndex = this.inventoryItemsList.findIndex(i => i.id === itemId);
            if (itemIndex !== -1) {
                this.inventoryItemsList.splice(itemIndex, 1);
                this.updateHTMLInventoryUI();
            }
        });
        socket.on(ResponseSocketsEnum.ROTATE_OBJECT, (data) => {
            if (import.meta.env.VITE_APP_ENV === "local") {
                //console.log('Socket event received:', ResponseSocketsEnum.ROTATE_OBJECT);
            }
            if (data.item) {
                const existingItem = this.sceneItems.find(i => i.id === data.item.id);
                if (existingItem && existingItem.sprite) {
                    // Rotate the sprite visually (flip horizontally)
                    existingItem.sprite.setFlipX(!existingItem.sprite.flipX);
                    // If move mode is active, refresh interactivity
                    if (this.moveModeActive) {
                        this.prepareObjectsForMoving();
                    }
                }
            }

            // Re-enable detail panel buttons after server response
            if (this.htmlDetailPanel) {
                this.htmlDetailPanel.enableButtons();
            }
        });

        socket.on(ResponseSocketsEnum.PRIVATE_SCENE_COLORS_UPDATED, (data) => {
            if (import.meta.env.VITE_APP_ENV === "local") {
                //console.log('Socket event received:', ResponseSocketsEnum.PRIVATE_SCENE_COLORS_UPDATED);
            }
            if (data.colors && data.sceneId === this.sceneData.scenery.id) {
                // Actualizar los colores en los datos de la escena
                this.sceneData.scenery.colors = data.colors;

                // Aplicar los nuevos colores a la escena
                PrivateSceneUpdateColorsService.main(this);
            }
        });
    }

    initializeTileGrid() {
        const rows = this.sceneData.scenery.map_rows;
        const cols = this.sceneData.scenery.map_cols;

        this.tileGrid = [];
        for (let row = 0; row < rows; row++) {
            this.tileGrid[row] = [];
            for (let col = 0; col < cols; col++) {
                this.tileGrid[row][col] = {
                    occupied: false,
                    objectId: null,
                    // Integrar clicabilidad del piso (CreateSceneController.createTile)
                    isClickable: this.tiles?.[row]?.[col]?.isClickable ?? true,
                    bob: null
                };
            }
        }
    }

    createHTMLButtons() {
        // Crear contenedor HTML para los botones
        const isOwner = this.sceneData.myScene || false;

        // Verificar si hay colores disponibles para mostrar el botón de colorear
        const assets = this.sceneData.sceneConfig.assets_data?.assets_data_repeatable || [];
        const hasColorableAssets = assets.some(asset => asset.color_item_key);

        const buttonsHTML = ButtonsPrivateSceneHtml.load(isOwner, hasColorableAssets);

        // Crear elemento DOM y añadirlo a la escena
        this.buttonsContainer = this.add.dom(0, 0).createFromHTML(buttonsHTML);
        this.buttonsContainer.setOrigin(0, 0);
        this.buttonsContainer.setScrollFactor(0);
        this.buttonsContainer.setDepth(10000);

        // Configurar event listeners para los botones
        this.setupButtonEvents();
    }

    setupButtonEvents() {
        const buttonsElement = this.buttonsContainer.node.querySelector('#scene-buttons');

        // Detener la propagación de eventos para que no interfieran con la escena de Phaser
        const stopPropagation = (event) => event.stopPropagation();
        buttonsElement.addEventListener('pointerdown', stopPropagation);
        buttonsElement.addEventListener('mousedown', stopPropagation);
        buttonsElement.addEventListener('touchstart', stopPropagation);

        // Event listeners para clicks de botones
        buttonsElement.addEventListener('click', (event) => {
            const button = event.target.closest('.scene-button');
            if (!button) return;

            event.stopPropagation();

            const action = button.getAttribute('data-action');
            this.handleButtonClick(action);
        });

        // Event listeners para tooltips
        const buttons = buttonsElement.querySelectorAll('.scene-button');
        buttons.forEach(button => {
            const tooltip = button.querySelector('.tooltip');

            button.addEventListener('mouseenter', () => {
                tooltip.style.opacity = '1';
            });

            button.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });
        });
    }

    /**
     * Cerrar todos los paneles HTML de Phaser
     */
    closeAllHTMLPanels() {
        if (this.htmlInventory && this.htmlInventory.isVisible) {
            this.htmlInventory.hide();
        }
        if (this.htmlDetailPanel && this.htmlDetailPanel.isVisible) {
            this.htmlDetailPanel.hide();
        }
        if (this.htmlColorPanel && this.htmlColorPanel.isVisible) {
            this.htmlColorPanel.hide();
        }
    }

    handleButtonClick(action) {
        switch (action) {
            case 'shop':
                if (import.meta.env.VITE_APP_ENV === "local") {
                    //console.log('Botón de tienda pulsado');
                }
                // Cerrar todos los paneles HTML antes de abrir la tienda
                this.closeAllHTMLPanels();
                if (this.vueComponent && this.vueComponent.showShop) {
                    this.vueComponent.showShop();
                }
                break;

            case 'avatars':
                if (import.meta.env.VITE_APP_ENV === "local") {
                    //console.log('Botón de avatares pulsado');
                }
                // Cerrar todos los paneles HTML antes de abrir avatares
                this.closeAllHTMLPanels();
                if (this.vueComponent && this.vueComponent.showAvatarSelection) {
                    this.vueComponent.showAvatarSelection();
                }
                break;

            case 'color':
                if (import.meta.env.VITE_APP_ENV === "local") {
                    //console.log('Boton de colorear pulsado');
                }
                if (this.htmlColorPanel) {
                    // Si está abierto, solo cerrarlo
                    if (this.htmlColorPanel.isVisible) {
                        this.htmlColorPanel.toggle();
                    } else {
                        // Si está cerrado, cerrar todos los paneles y abrirlo
                        if (this.vueComponent && this.vueComponent.closeAllPanels) {
                            this.vueComponent.closeAllPanels();
                        }
                        this.htmlColorPanel.toggle();
                    }
                }
                break;

            case 'move':
                this.toggleMoveMode();
                break;

            case 'inventory':
                if (import.meta.env.VITE_APP_ENV === "local") {
                    //console.log('Botón de inventario pulsado', this.htmlInventory);
                }
                if (this.htmlInventory) {
                    // Si está abierto, solo cerrarlo
                    if (this.htmlInventory.isVisible) {
                        this.htmlInventory.toggle();
                    } else {
                        // Si está cerrado, cerrar todos los paneles y abrirlo
                        if (this.vueComponent && this.vueComponent.closeAllPanels) {
                            this.vueComponent.closeAllPanels();
                        }
                        this.htmlInventory.toggle();
                    }
                } else {
                    //console.error('htmlInventory no está inicializado');
                }
                break;

            case 'rankings':
                if (import.meta.env.VITE_APP_ENV === "local") {
                    //console.log('Botón de rankings pulsado');
                }
                // Cerrar todos los paneles HTML antes de abrir rankings
                this.closeAllHTMLPanels();
                if (this.vueComponent && this.vueComponent.showRankings) {
                    this.vueComponent.showRankings();
                }
                break;
        }
    }


    /**
     * Marcar y renderizar overlays de tiles ocupados por objetos existentes
     */
    markOccupiedTiles() {
        // Limpiar overlays anteriores
        if (this.tileBlitter) {
            this.tileBlitter.clear();
        }

        // Restaurar clickable del piso según el mapa original
        const gameMap = this.sceneData.scenery.game_map;
        if (gameMap && this.tiles) {
            for (let row = 0; row < gameMap.length; row++) {
                for (let col = 0; col < gameMap[row].length; col++) {
                    const t = this.tiles[row]?.[col];
                    if (t) {
                        t.isClickable = (gameMap[row][col] === 0);
                    }
                }
            }
        }

        this.initializeTileGrid();

        const tileWidth = 65 * this.dpiScale;
        const tileHeight = 33 * this.dpiScale;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;
        const centerX = this.scale.width / 2;

        this.tileBlitter.setDepth(100);

        this.sceneItems.forEach(item => {
            item.occupied_tiles.forEach(([col, row]) => {
                const x = (col - row) * halfTileWidth + centerX - halfTileWidth;
                const y = (col + row) * halfTileHeight - halfTileHeight;

                const bob = this.tileBlitter.create(x, y);
                bob.alpha = import.meta.env.VITE_APP_ENV === "local" ? 1 : 0;
                if (this.sceneData.authUser?.admin_tools?.show_object_reserved_tiles) {
                    bob.alpha = 1;
                }

                if (row < this.tileGrid.length && col < this.tileGrid[row].length) {
                    this.tileGrid[row][col].occupied = true;
                    this.tileGrid[row][col].objectId = item.id;

                    // WALKABLE and WALKABLE_OVERLAY items don't block clicking or movement
                    if (item.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE ||
                        item.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE_OVERLAY) {
                        this.tileGrid[row][col].isClickable = true;
                        // Keep original tile clickability for WALKABLE items
                        const t = this.tiles[row]?.[col];
                        if (t && gameMap && gameMap[row] && gameMap[row][col] === 0) {
                            t.isClickable = true;
                        }
                    } else {
                        this.tileGrid[row][col].isClickable = false;
                        // Bloquear clic también en tiles visibles (si existen en this.tiles)
                        const t = this.tiles[row]?.[col];
                        if (t) {
                            t.isClickable = false;
                        }
                    }
                    this.tileGrid[row][col].bob = bob;
                }
            });
        });
    }

    toggleMoveMode() {
        this.moveModeActive = !this.moveModeActive;

        if (this.moveModeActive) {
            // Activar parpadeo
            this.makeButtonBlink();
            // Preparar objetos para ser movidos
            this.prepareObjectsForMoving();
        } else {
            // Desactivar parpadeo
            this.stopButtonBlink();
            // Deseleccionar cualquier objeto seleccionado
            this.deselectObject();
            // Quitar interactividad de los objetos
            this.removeObjectInteractivity();
        }
    }

    makeButtonBlink() {
        if (this.tween) {
            this.tween.stop();
            this.tween.remove();
        }

        const moveButton = this.buttonsContainer.node.querySelector('#move-button');
        if (moveButton) {
            // Crear animación CSS para el parpadeo
            moveButton.style.animation = 'blink 1s infinite';

            // Añadir keyframes CSS si no existen
            if (!document.querySelector('#blink-keyframes')) {
                const style = document.createElement('style');
                style.id = 'blink-keyframes';
                style.textContent = `
                    @keyframes blink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.3; }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }


    stopButtonBlink() {
        const moveButton = this.buttonsContainer.node.querySelector('#move-button');
        if (moveButton) {
            moveButton.style.animation = '';
            moveButton.style.opacity = '1';
        }

        if (this.tween) {
            this.tween.stop();
            this.tween.remove();
            this.tween = null;
        }
    }

    prepareObjectsForMoving() {
        this.sceneItems.forEach(item => {
            if (!item.sprite) return;

            // Solo añadir interactividad si no está añadida
            if (!item.sprite.input) {
                item.sprite.setInteractive();
            }

            // Limpiar eventos previos
            item.sprite.off('pointerdown');

            // Nuevo evento de selección
            item.sprite.on('pointerdown', () => {
                this.selectObject(item);
            });
        });
    }

    removeObjectInteractivity() {
        this.sceneItems.forEach(item => {
            if (item.sprite && item.sprite.input) {
                item.sprite.off('pointerdown');
            }
        });
    }


    selectObject(item) {
        if (this.selectedObject === item) return; // No re-seleccionar el mismo objeto

        if (this.selectedObject) {
            this.deselectObject();
        }

        this.selectedObject = item;

        // Mostrar el panel de detalles HTML
        if (this.htmlDetailPanel) {
            this.htmlDetailPanel.show(item);
        }

        // Si el modo mover está activo, hacer el objeto arrastrable
        if (this.moveModeActive) {
            this.originalPositions[item.id] = {
                x: item.sprite.x,
                y: item.sprite.y,
                occupied_tiles: [...item.occupied_tiles]
            };
            this.setObjectDraggable(item);
        }
    }

    setObjectDraggable(item) {
        const sprite = item.sprite;
        this.input.setDraggable(sprite, true);

        const tileWidth = 65 * this.dpiScale * this.sceneScaleFactor;
        const tileHeight = 33 * this.dpiScale * this.sceneScaleFactor;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;
        const centerX = this.scale.width / 2;

        // Limpiar listeners previos para evitar duplicados
        sprite.off('drag');
        sprite.off('dragend');

        sprite.on('drag', (pointer) => {
            sprite.x = pointer.worldX;
            sprite.y = pointer.worldY;
        });

        sprite.on('dragend', (pointer) => {
            const dropX = pointer.worldX;
            const dropY = pointer.worldY;
            const newTiles = this.calculateNewTiles(
                dropX,
                dropY,
                item.map_size,
                centerX,
                halfTileWidth,
                halfTileHeight
            );

            if (this.isPositionValid(newTiles, item.id)) {
                socket.emit(RequestSocketsEnum.SCENE_PUT_ITEM, {
                    user_catalog_item_id: item.id,
                    occupied_tiles: newTiles,
                    is_move: true
                });
            } else {
                this.returnObjectToOriginalPosition(item);
            }
        });
    }

    occupyTiles(tiles, objectId) {
        // No se necesita esta llamada directa: markOccupiedTiles reconstruye tileGrid completo
        // tiles.forEach(([col, row]) => {
        //     if (row < this.tileGrid.length && col < this.tileGrid[row].length) {
        //         this.tileGrid[row][col] = { occupied: true, objectId };
        //     }
        // });
    }

    isPositionValid(newTiles, currentObjectId) {
        // Verificar que todos los tiles estén dentro del grid
        const rows = this.sceneData.scenery.map_rows;
        const cols = this.sceneData.scenery.map_cols;
        const gameMap = this.sceneData.scenery.game_map;

        //console.log('🔍 Validating position:', { rows, cols, newTiles });

        for (const [col, row] of newTiles) {
            //console.log(`  Checking tile [${col}, ${row}]`);

            // Verificar límites
            if (row < 0 || row >= rows || col < 0 || col >= cols) {
                //console.log(`    ❌ Out of bounds (rows: ${rows}, cols: ${cols})`);
                return false;
            }

            // No se puede posicionar si el piso no es transitable según el mapa base
            if (gameMap && gameMap[row] && typeof gameMap[row][col] !== 'undefined' && gameMap[row][col] !== 0) {
                //console.log(`    ❌ Not walkable (gameMap value: ${gameMap[row][col]})`);
                return false;
            }

            // Check if tile is occupied by another object
            if (this.tileGrid[row][col].occupied && this.tileGrid[row][col].objectId !== currentObjectId) {
                //console.log(`    ⚠️ Occupied by object ${this.tileGrid[row][col].objectId}`);
                // Find the occupying object
                const occupyingObject = this.sceneItems.find(item => item.id === this.tileGrid[row][col].objectId);

                // Allow placing objects on WALKABLE/WALKABLE_OVERLAY items, but not WALKABLE on WALKABLE
                if (occupyingObject && (occupyingObject.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE ||
                    occupyingObject.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE_OVERLAY)) {
                    // Find the current object being placed/moved
                    const currentObject = this.sceneItems.find(item => item.id === currentObjectId);

                    // If placing a WALKABLE/WALKABLE_OVERLAY item on another WALKABLE/WALKABLE_OVERLAY item, reject
                    if (currentObject && (currentObject.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE ||
                        currentObject.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE_OVERLAY)) {
                        //console.log(`    ❌ Cannot place WALKABLE on WALKABLE`);
                        return false;
                    }
                    //console.log(`    ✅ Can place on WALKABLE item`);
                    // Otherwise allow placement on WALKABLE/WALKABLE_OVERLAY items
                } else {
                    //console.log(`    ❌ Occupied by non-WALKABLE object`);
                    return false; // Occupied by non-WALKABLE object
                }
            } else {
                //console.log(`    ✅ Tile is free`);
            }
        }

        //console.log('  ✅ All tiles valid');
        return true;
    }

    freeTiles(tiles) {
        // Se ignora: markOccupiedTiles resetea todo el tileGrid
        // tiles.forEach(([col, row]) => {
        //     if (row < this.tileGrid.length && col < this.tileGrid[row].length) {
        //         this.tileGrid[row][col] = { occupied: false, objectId: null };
        //     }
        // });
    }

    validateObjectPosition(item) {
        const tileWidth = 65 * this.dpiScale;
        const tileHeight = 33 * this.dpiScale;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;
        const centerX = this.scale.width / 2;

        // Convertir posición del sprite a coordenadas de grid
        const newTiles = this.calculateNewTiles(
            item.sprite.x,
            item.sprite.y,
            item.map_size,
            centerX,
            halfTileWidth,
            halfTileHeight
        );

        // Verificar colisiones con otros objetos
        for (const otherItem of this.sceneItems) {
            if (otherItem.id === item.id) continue;

            for (const newTile of newTiles) {
                for (const occupiedTile of otherItem.occupied_tiles) {
                    if (newTile[0] === occupiedTile[0] && newTile[1] === occupiedTile[1]) {
                        return false; // Colisión detectada
                    }
                }
            }
        }

        return true;
    }

    calculateNewTiles(spriteX, spriteY, mapSize, centerX, halfTileWidth, halfTileHeight) {
        // Calcular tile central
        const colFloat = ((spriteX - centerX) / halfTileWidth + spriteY / halfTileHeight) / 2;
        const rowFloat = (spriteY / halfTileHeight - (spriteX - centerX) / halfTileWidth) / 2;
        const centerCol = Math.round(colFloat);
        const centerRow = Math.round(rowFloat);

        // Calcular todos los tiles ocupados
        return mapSize.map(([rowOffset, colOffset]) => [
            centerCol + colOffset,
            centerRow + rowOffset
        ]);
    }

    returnObjectToOriginalPosition(item) {
        const original = this.originalPositions[item.id];

        item.sprite.x = original.x;
        item.sprite.y = original.y;
        item.occupied_tiles = original.occupied_tiles;
    }

    updateOccupiedTiles(item) {
        const tileWidth = 65 * this.dpiScale;
        const tileHeight = 33 * this.dpiScale;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;
        const centerX = this.scale.width / 2;

        item.occupied_tiles = this.calculateNewTiles(
            item.sprite.x,
            item.sprite.y,
            item.map_size,
            centerX,
            halfTileWidth,
            halfTileHeight
        );
    }

    deselectObject() {
        if (!this.selectedObject) return;

        const sprite = this.selectedObject.sprite;
        if (sprite && sprite.input && sprite.input.draggable) {
            this.input.setDraggable(sprite, false);
            sprite.off('drag');
            sprite.off('dragend');
        }

        this.selectedObject = null;

        if (this.htmlDetailPanel && this.htmlDetailPanel.isVisible) {
            this.htmlDetailPanel.hide();
        }
    }

    /**
     * Renderizar objetos existentes en la escena
     */
    // Dentro de la clase PrivateScene, modifica el método renderSceneObjects
    renderSceneObjects() {
        //console.log('🎨 renderSceneObjects called, items count:', this.sceneItems.length);

        // Aplicar sceneScaleFactor a las dimensiones de los tiles
        const tileWidth = 65 * this.dpiScale * this.sceneScaleFactor;
        const tileHeight = 33 * this.dpiScale * this.sceneScaleFactor;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;
        const centerX = this.scale.width / 2;

        this.sceneItems.forEach((item, index) => {
            //console.log(`  Rendering item ${index}:`, item.sprite_name, item.occupied_tiles);
            // Calcular la posición promedio
            let sumX = 0;
            let maxRowColSum = -Infinity;

            item.occupied_tiles.forEach(tilePos => {
                const [col, row] = tilePos;
                const tileX = (col - row) * halfTileWidth + centerX;
                sumX += tileX;

                const rowColSum = row + col;
                if (rowColSum > maxRowColSum) maxRowColSum = rowColSum;
            });

            const avgX = sumX / item.occupied_tiles.length;
            const y = maxRowColSum * halfTileHeight;

            // Crear o actualizar sprite
            if (!item.sprite) {
                // Determinar si es video o imagen
                const assetSrc = import.meta.env.VITE_APP_ENV == 'local' ? item.spreadsheet : item.spreadsheet_url;
                const isVideo = this.isVideoFile(assetSrc);

                if (isVideo && this.cache.video.exists(item.sprite_name)) {
                    // Crear video sprite
                    const baseScale = item.scale || this.dpiScale;
                    item.sprite = this.add.video(avgX, y, item.sprite_name)
                        .setOrigin(0.5, 0.90)
                        .setScale(baseScale * this.sceneScaleFactor);

                    // Configurar el video para que se reproduzca en bucle
                    item.sprite.setLoop(true);
                    item.sprite.play();

                    // Marcar como video para futuras referencias
                    item.isVideo = true;
                } else if (this.textures.exists(item.sprite_name)) {
                    // Crear imagen sprite
                    const baseScale = item.scale || this.dpiScale;
                    item.sprite = this.add.image(avgX, y, item.sprite_name)
                        .setOrigin(0.5, 0.90)
                        .setScale(baseScale * this.sceneScaleFactor);

                    item.isVideo = false;
                }

                // Set depth based on behavior type
                if (item.sprite) {
                    if (item.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE) {
                        // WALKABLE objects appear below users (lower depth but still visible)
                        item.sprite.setDepth(y - 100);
                    } else if (item.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE_OVERLAY) {
                        // WALKABLE_OVERLAY objects start below users but can switch to above
                        item.sprite.setDepth(y - 100);
                        item.baseDepth = y; // Store base depth for switching
                        item.belowUserDepth = y - 100;
                        item.aboveUserDepth = y + 100;
                    } else {
                        // Normal objects use standard depth
                        item.sprite.setDepth(y);
                    }
                }

                // Aplicar dimensiones personalizadas si están definidas (manteniendo aspect ratio)
                if (item.sprite && (item.width != null || item.height != null)) {
                    const originalWidth = item.sprite.width;
                    const originalHeight = item.sprite.height;

                    let targetWidth = (item.width || originalWidth) * (item.scale || this.dpiScale);
                    let targetHeight = (item.height || originalHeight) * (item.scale || this.dpiScale);

                    // Calcular escala para mantener aspect ratio (contain)
                    const scaleX = targetWidth / originalWidth;
                    const scaleY = targetHeight / originalHeight;
                    const scale = Math.min(scaleX, scaleY);

                    item.sprite.setScale(scale * this.sceneScaleFactor);
                } else if (item.sprite) {
                    // Si no hay dimensiones personalizadas, aplicar solo el escalado DPI
                    const baseScale = item.scale || this.dpiScale;
                    item.sprite.setScale(baseScale * this.sceneScaleFactor);
                }

                // Aplicar rotación si el atributo rotated es true
                if (item.sprite && item.rotated == true) {
                    item.sprite.setFlipX(true);
                }
            } else {
                item.sprite.setPosition(avgX, y);

                // Update depth based on behavior type
                if (item.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE) {
                    // WALKABLE objects appear below users (lower depth but still visible)
                    item.sprite.setDepth(y - 100);
                } else if (item.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE_OVERLAY) {
                    // Update depth values for WALKABLE_OVERLAY
                    item.baseDepth = y;
                    item.belowUserDepth = y - 100;
                    item.aboveUserDepth = y + 100;
                    // Keep current depth or set to below user if not set
                    if (!item.sprite.depth || item.sprite.depth === item.belowUserDepth || item.sprite.depth === item.aboveUserDepth) {
                        item.sprite.setDepth(item.belowUserDepth);
                    }
                } else {
                    // Normal objects use standard depth
                    item.sprite.setDepth(y);
                }

                // Si es un video y no está reproduciéndose, iniciarlo
                if (item.isVideo && item.sprite.isPaused) {
                    item.sprite.play();
                }
            }
        });

        // Update WALKABLE_OVERLAY depths based on user positions
        this.updateWalkableOverlayDepths();
    }

    updateWalkableOverlayDepths() {
        // Find all WALKABLE_OVERLAY items
        const walkableOverlayItems = this.sceneItems.filter(item =>
            item.type_of_behavior === CatalogItemTypeOfBehaviorEnum.WALKABLE_OVERLAY && item.sprite
        );

        walkableOverlayItems.forEach(item => {
            let shouldBeAbove = false;

            // Check if any user should make this item appear above
            Object.values(this.users).forEach(user => {
                if (user.currentAreaPosition) {
                    const userCol = user.currentAreaPosition.x;
                    const userRow = user.currentAreaPosition.y;
                    const halfTileHeight = (33 * this.dpiScale) / 2;
                    const userVisualY = (userCol + userRow) * halfTileHeight;

                    // Get the item's visual Y range (from top-most to bottom-most tile)
                    const itemMinRowColSum = Math.min(...item.occupied_tiles.map(([col, row]) => row + col));
                    const itemMaxRowColSum = Math.max(...item.occupied_tiles.map(([col, row]) => row + col));
                    const itemTopY = itemMinRowColSum * halfTileHeight;
                    const itemBottomY = itemMaxRowColSum * halfTileHeight;

                    // Check if user position overlaps with any of the item's occupied tiles
                    const isOnItem = item.occupied_tiles.some(([col, row]) =>
                        col === userCol && row === userRow
                    );

                    if (isOnItem) {
                        // User is on top of the item - object should appear above
                        shouldBeAbove = true;
                    } else {
                        // User is not on the item - check relative position
                        // If user is behind the object (smaller Y), object should appear above
                        // If user is in front of the object (larger Y), object should appear below
                        if (userVisualY <= itemTopY) {
                            // User is behind the object
                            shouldBeAbove = true;
                        }
                        // If userVisualY > itemBottomY, user is in front, object stays below (shouldBeAbove = false)
                    }
                }
            });

            // Switch depth based on calculation
            if (shouldBeAbove && item.sprite.depth !== item.aboveUserDepth) {
                item.sprite.setDepth(item.aboveUserDepth);
            } else if (!shouldBeAbove && item.sprite.depth !== item.belowUserDepth) {
                item.sprite.setDepth(item.belowUserDepth);
            }
        });
    }

    shutdown() {
        // Limpiar buffer de eventos
        this.eventBuffer = [];
        this.isSceneReady = false;

        // Limpiar el buffer global de eventos tempranos
        earlyEventBuffer.clear();

        RemovePhaserSocketsUtil.main(socket);
        if (this.chatManager) {
            this.chatManager.destroy();
            this.chatManager = null;
        }

        if (this.htmlInventory) {
            this.htmlInventory.destroy();
            this.htmlInventory = null;
        }

        if (this.htmlColorPanel) {
            this.htmlColorPanel.destroy();
            this.htmlColorPanel = null;
        }

        const p = this.plugins.get('rexColorReplacePipeline');
        if (p) {
            this.plugins.stop('rexColorReplacePipeline');
        }
    }

    destroy() {
        this.shutdown();
    }

    /**
     * Crear inventario HTML que reemplaza el sistema Phaser
     */
    createHTMLInventory() {
        this.htmlInventory = new InventoryPrivateSceneHtml(this);
        this.htmlInventory.create();
    }

    /**
     * Crear panel de detalles HTML
     */
    createHTMLDetailPanel() {
        this.htmlDetailPanel = new DetailPanelPrivateSceneHtml(this);
        this.htmlDetailPanel.create();
    }

    /**
     * Crear panel de coloración HTML
     */
    createHTMLColorPanel() {
        this.htmlColorPanel = new ColorPanelPrivateSceneHtml(this);
        this.htmlColorPanel.create();
    }

    /**
     * Actualizar UI del inventario HTML
     */
    updateHTMLInventoryUI() {
        if (this.htmlInventory) {
            this.htmlInventory.updateInventoryUI();
        }
    }

    updateInventoryUI() {
        if (!this.inventorySlots || !this.pageText) return;

        const TILE_WIDTH = 65 * this.dpiScale;
        const TILE_HEIGHT = 33 * this.dpiScale;
        const HALF_TILE_WIDTH = TILE_WIDTH / 2;
        const HALF_TILE_HEIGHT = TILE_HEIGHT / 2;
        const CENTER_X = this.scale.width / 2;
        const SLOT_SIZE = 60;

        const grouped = this.groupItems(this.inventoryItemsList);
        this.totalPages = Math.max(1, Math.ceil(grouped.length / 9));
        this.inventoryPage = Phaser.Math.Clamp(this.inventoryPage, 0, this.totalPages - 1);
        this.pageText.setText(`${this.inventoryPage + 1} / ${this.totalPages}`);
        this.totalItemsText.setText(`Total: ${this.inventoryItemsList.length}`);

        const pageItems = grouped.slice(this.inventoryPage * 9, this.inventoryPage * 9 + 9);

        this.inventorySlots.forEach((slot, idx) => {
            const group = pageItems[idx];
            if (group) {
                slot.group = group;
                slot.icon.setTexture(group.sprite_name);
                const maxSize = SLOT_SIZE - 10;
                const scale = Math.min(maxSize / slot.icon.width, maxSize / slot.icon.height);
                slot.icon.setScale(scale);

                slot.countText.setText(group.count > 1 ? `${group.count}` : '');
                slot.container.setVisible(true);

                this.input.setDraggable(slot.icon, true);

                slot.icon.off('dragstart').off('drag').off('dragend');

                slot.icon.on('dragstart', () => {
                    slot.icon.setScale(1);
                    slot.icon.setTint(0xaaaaaa);
                    slot.container.setVisible(false);
                    this.inventoryContainer.add(slot.icon);
                });

                slot.icon.on('drag', (pointer) => {
                    const localPoint = this.inventoryContainer.pointToContainer(pointer);
                    if (localPoint) {
                        const iconHeight = slot.icon.height;
                        const originOffsetY = iconHeight * (0.9 - 0.5);
                        slot.icon.x = localPoint.x;
                        slot.icon.y = localPoint.y - originOffsetY;
                    }
                });

                slot.icon.on('dragend', (pointer) => {
                    slot.icon.clearTint();
                    let dropX = pointer.worldX;
                    let dropY = pointer.worldY;

                    // Ajustar la posición para compensar el origen del sprite (0.5, 0.90)
                    // Esto es necesario porque el objeto se renderizará con origen en la base
                    if (slot.group && this.textures.exists(slot.group.sprite_name)) {
                        const texture = this.textures.get(slot.group.sprite_name);
                        const spriteHeight = texture.source[0].height * (slot.group.scale || this.dpiScale);

                        // Ajustar Y para que coincida con el origen (0.5, 0.90) del sprite final
                        dropY = dropY + (spriteHeight * 0.40); // 0.90 - 0.50 = 0.40
                    }

                    const newTiles = this.calculateNewTiles(
                        dropX, dropY, slot.group.map_size,
                        CENTER_X, HALF_TILE_WIDTH, HALF_TILE_HEIGHT
                    );

                    if (this.isPositionValid(newTiles, null)) {
                        const itemInstance = this.inventoryItemsList.find(i => i.sprite_name === slot.group.sprite_name);
                        if (itemInstance) {
                            socket.emit(RequestSocketsEnum.SCENE_PUT_ITEM, {
                                user_catalog_item_id: itemInstance.id,
                                occupied_tiles: newTiles
                            });
                        }
                    }
                    slot.container.add(slot.icon);
                    slot.icon.setPosition(SLOT_SIZE / 2, SLOT_SIZE / 2);
                    this.updateInventoryUI();
                });

            } else {
                slot.group = null;
                slot.container.setVisible(false);
                this.input.setDraggable(slot.icon, false);
            }
        });
    }

    /**
     * Agrupar elementos idénticos en el inventario.
     */
    groupItems(items) {
        const map = {};
        items.forEach(it => {
            if (!map[it.sprite_name]) {
                map[it.sprite_name] = { ...it, count: 0 };
                map[it.sprite_name].count = 0;
            }
            map[it.sprite_name].count++;
        });
        return Object.values(map);
    }

    /**
     * Calcular tiles ocupados por un item
     */
    getItemTiles(centerRow, centerCol, mapSize) {
        return mapSize.map(([rowOffset, colOffset]) => ({
            row: centerRow + rowOffset, // Fila = centro + offset fila
            col: centerCol + colOffset  // Columna = centro + offset columna
        }));
    }
}
