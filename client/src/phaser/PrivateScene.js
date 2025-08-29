import Phaser from "phaser";
import socket from "../sockets/socket";
import asset_shadow_image from "@/assets/game/avatar/shadow.webp";
import asset_shadow_selected_image from "@/assets/game/avatar/shadow_selected.webp";
import asset_tile_image from "@/assets/game/scene/tile.webp";
import SceneRequestSockets from "./sockets/SceneRequestSockets";
import SceneResponseSockets from "./sockets/SceneResponseSockets";
import OverheadChatAnimation from "./animations/OverheadChatAnimation";
import PrivateSceneLoader from "./loaders/PrivateSceneLoader";
import CreateSceneController from "./controllers/scene/CreateSceneController";
import RemovePhaserSocketsUtil from "../utils/RemovePhaserSocketsUtil";
import TintManager from "./managers/TintManager";
import PrivateSceneUpdateColorsService from "./services/PrivateScene/PrivateSceneUpdateColorsService";
import RequestSocketsEnum from "../enums/RequestSocketsEnum";
import ResponseSocketsEnum from "../enums/ResponseSocketsEnum";
import ButtonsPrivateSceneHtml from "@/phaser/html/private-scene/ButtonsPrivateSceneHtml";
import InventoryPrivateSceneHtml from "@/phaser/html/private-scene/InventoryPrivateSceneHtml";
import DetailPanelPrivateSceneHtml from "@/phaser/html/private-scene/DetailPanelPrivateSceneHtml";
import i18n from "../plugins/i18n";

export default class PrivateScene extends Phaser.Scene {
    constructor() {
        super("PrivateScene");
        this.users = {};
        this.avatarAnimations = {};
        this.selectedSprite = null;
        /** Blitter for tile overlays */
        this.tileBlitter = null;
    }

    init(data) {
        this.sceneType = data.sceneType;
        this.sceneData = data.sceneData;
        this.users = {};
        this.avatarAnimations = {};
        this.vueComponent = data.vueComponent;
        this.selectedShadow = null;
        if (import.meta.env.VITE_APP_ENV === "local") {
            console.log("PrivateScene init", this.sceneType, this.sceneData);
        }

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
        PrivateSceneLoader.main(this, this.sceneType, true);
        this.load.image("tile", asset_tile_image);
        this.load.image("shadow", asset_shadow_image);
        this.load.image("shadow_selected", asset_shadow_selected_image);

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

    create() {
        if (!this.plugins.get('rexColorReplacePipeline')) {
            this.plugins.start('rexColorReplacePipeline');
        }
        this.cameras.main.setBackgroundColor('#2ecc71');
        this.tintMgr = new TintManager(this);
        this.scene.pauseOnBlur = false;
        this.scene.pauseOnHide = false;
        this.input.enabled = true;
        this.input.topOnly = false;

        SceneRequestSockets.main(this);
        SceneResponseSockets.main(this);

        PrivateSceneLoader.main(this, this.sceneData.scenery.type, false);
        CreateSceneController.main(this, this.sceneData);

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
        }

        this.chatManager = new OverheadChatAnimation(this);

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('destroy', this.destroy, this);
        this.scene.pauseOnBlur = false;
        this.scene.pauseOnHide = false;

        if (this.sceneData.myScene) {
            this.createHTMLButtons();
        }

        this.handleSockets();
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

    handleSockets() {
        socket.on(ResponseSocketsEnum.ADD_ITEM_TO_INVENTORY, (data) => {
            if (import.meta.env.VITE_APP_ENV === "local") {
                console.log('Socket event received:', ResponseSocketsEnum.ADD_ITEM_TO_INVENTORY);
            }
            if (data.item) {
                this.inventoryItemsList.push(data.item);
                this.updateHTMLInventoryUI();
            }
        });
        socket.on(ResponseSocketsEnum.SCENE_REMOVE_ITEM, (data) => {
            if (import.meta.env.VITE_APP_ENV === "local") {
                console.log('Socket event received:', ResponseSocketsEnum.SCENE_REMOVE_ITEM);
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
        });
        socket.on(ResponseSocketsEnum.SCENE_PUT_ITEM, (data) => {
            if (import.meta.env.VITE_APP_ENV === "local") {
                console.log('Socket event received:', ResponseSocketsEnum.SCENE_PUT_ITEM);
            }
            if (data.item) {
                const existingItem = this.sceneItems.find(i => i.id === data.item.id);
                if (existingItem) {
                    // It's a move, just update the tiles
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

                    if (assetExists) {
                        this.sceneItems.push(item);
                        this.markOccupiedTiles();
                        this.renderSceneObjects();
                        if (this.moveModeActive) {
                            this.prepareObjectsForMoving();
                        }
                    } else {
                        // Asset doesn't exist, load it first
                        if (isVideo) {
                            this.load.video(textureName, assetSrc);
                            this.load.once(`filecomplete-video-${textureName}`, () => {
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
            }
        });
        socket.on(ResponseSocketsEnum.REMOVE_ITEM_FROM_INVENTORY, (data) => {
            if (import.meta.env.VITE_APP_ENV === "local") {
                console.log('Socket event received:', ResponseSocketsEnum.REMOVE_ITEM_FROM_INVENTORY);
            }
            const itemId = data.user_catalog_item_id;
            const itemIndex = this.inventoryItemsList.findIndex(i => i.id === itemId);
            if (itemIndex !== -1) {
                this.inventoryItemsList.splice(itemIndex, 1);
                this.updateHTMLInventoryUI();
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
        const buttonsHTML = ButtonsPrivateSceneHtml.load();

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

    handleButtonClick(action) {
        switch (action) {
            case 'shop':
                if (import.meta.env.VITE_APP_ENV === "local") {
                    console.log('Botón de tienda pulsado');
                }
                break;

            case 'avatars':
                if (import.meta.env.VITE_APP_ENV === "local") {
                    console.log('Botón de avatares pulsado');
                }
                break;

            case 'color':
                if (import.meta.env.VITE_APP_ENV === "local") {
                    console.log('Boton de colorear pulsado');
                }
                break;

            case 'move':
                this.toggleMoveMode();
                break;

            case 'inventory':
                if (import.meta.env.VITE_APP_ENV === "local") {
                    console.log('Botón de inventario pulsado', this.htmlInventory);
                }
                if (this.htmlInventory) {
                    this.htmlInventory.toggle();
                } else {
                    console.error('htmlInventory no está inicializado');
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

        const tileWidth = 65;
        const tileHeight = 33;
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

                if (row < this.tileGrid.length && col < this.tileGrid[row].length) {
                    this.tileGrid[row][col].occupied = true;
                    this.tileGrid[row][col].objectId = item.id;
                    this.tileGrid[row][col].isClickable = false;
                    this.tileGrid[row][col].bob = bob;

                    // Bloquear clic también en tiles visibles (si existen en this.tiles)
                    const t = this.tiles[row]?.[col];
                    if (t) {
                        t.isClickable = false;
                    }
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

        const tileWidth = 65;
        const tileHeight = 33;
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

        for (const [col, row] of newTiles) {
            // Verificar límites
            if (row < 0 || row >= rows || col < 0 || col >= cols) {
                return false;
            }

            // No se puede posicionar si el piso no es transitable según el mapa base
            if (gameMap && gameMap[row] && typeof gameMap[row][col] !== 'undefined' && gameMap[row][col] !== 0) {
                return false;
            }

            // No se puede posicionar si el tile está ocupado por OTRO objeto
            if (this.tileGrid[row][col].occupied && this.tileGrid[row][col].objectId !== currentObjectId) {
                return false;
            }
        }

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
        const tileWidth = 65;
        const tileHeight = 33;
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
        const tileWidth = 65;
        const tileHeight = 33;
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

        if (this.moveModeActive) {
            this.input.setDraggable(this.selectedObject.sprite, false);
        }
        this.selectedObject = null;

        if (this.htmlDetailPanel && this.htmlDetailPanel.isVisible) {
            this.htmlDetailPanel.hide();
        }

        // HTML inventory remains visible when deselecting objects
    }

    /**
     * Renderizar objetos existentes en la escena
     */
    // Dentro de la clase PrivateScene, modifica el método renderSceneObjects
    renderSceneObjects() {
        const tileWidth = 65;
        const tileHeight = 33;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;
        const centerX = this.scale.width / 2;

        this.sceneItems.forEach(item => {
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
                    item.sprite = this.add.video(avgX, y, item.sprite_name)
                        .setOrigin(0.5, 0.90)
                        .setDepth(y);
                    
                    // Configurar el video para que se reproduzca en bucle
                    item.sprite.setLoop(true);
                    item.sprite.play();
                    
                    // Marcar como video para futuras referencias
                    item.isVideo = true;
                } else if (this.textures.exists(item.sprite_name)) {
                    // Crear imagen sprite
                    item.sprite = this.add.image(avgX, y, item.sprite_name)
                        .setOrigin(0.5, 0.90)
                        .setDepth(y);
                    
                    item.isVideo = false;
                }

                // Aplicar dimensiones personalizadas si están definidas (manteniendo aspect ratio)
                if (item.sprite && (item.width != null || item.height != null)) {
                    const originalWidth = item.sprite.width;
                    const originalHeight = item.sprite.height;
                    
                    let targetWidth = item.width || originalWidth;
                    let targetHeight = item.height || originalHeight;
                    
                    // Calcular escala para mantener aspect ratio (contain)
                    const scaleX = targetWidth / originalWidth;
                    const scaleY = targetHeight / originalHeight;
                    const scale = Math.min(scaleX, scaleY);
                    
                    item.sprite.setScale(scale);
                }
            } else {
                item.sprite.setPosition(avgX, y);
                item.sprite.setDepth(y);
                
                // Si es un video y no está reproduciéndose, iniciarlo
                if (item.isVideo && item.sprite.isPaused) {
                    item.sprite.play();
                }
            }
        });
    }

    shutdown() {
        RemovePhaserSocketsUtil.main(socket);
        if (this.chatManager) {
            this.chatManager.destroy();
            this.chatManager = null;
        }

        if (this.htmlInventory) {
            this.htmlInventory.destroy();
            this.htmlInventory = null;
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
     * Actualizar UI del inventario HTML
     */
    updateHTMLInventoryUI() {
        if (this.htmlInventory) {
            this.htmlInventory.updateInventoryUI();
        }
    }

    updateInventoryUI() {
        if (!this.inventorySlots || !this.pageText) return;

        const TILE_WIDTH = 65;
        const TILE_HEIGHT = 33;
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
                    const dropX = pointer.worldX;
                    const dropY = pointer.worldY;

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
