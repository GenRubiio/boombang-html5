import Phaser from "phaser";
import socket from "../sockets/socket";
import asset_shadow_image from "../assets/game/avatar/shadow.png";
import asset_shadow_selected_image from "../assets/game/avatar/shadow_selected.webp";
import asset_tile_image from "../assets/game/scene/tile.png";
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
import asset_ui_backpack_image from "../assets/game/scene/ui/backpack.png";
import asset_ui_move_item_image from "../assets/game/scene/ui/move_item.png";
import asset_ui_shop_image from "../assets/game/scene/ui/shop.png";
import asset_ui_avatars_image from "../assets/game/scene/ui/avatars.png";
import asset_ui_color_scene_image from "../assets/game/scene/ui/color_scene.png";

export default class PrivateScene extends Phaser.Scene {
    constructor() {
        super("PrivateScene");
        this.users = {};
        this.avatarAnimations = {};
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
        console.log("PrivateScene init", this.sceneType, this.sceneData);

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

    preload() {
        PrivateSceneLoader.main(this, this.sceneType, true);
        this.load.image("tile", asset_tile_image);
        this.load.image("shadow", asset_shadow_image);
        this.load.image("shadow_selected", asset_shadow_selected_image);

        if (this.sceneData.myScene) {
            // Cargar assets de UI
            this.load.image("asset_ui_backpack_image", asset_ui_backpack_image);
            this.load.image("asset_ui_move_item_image", asset_ui_move_item_image);
            this.load.image("asset_ui_color_scene_image", asset_ui_color_scene_image);
            this.load.image("asset_ui_shop_image", asset_ui_shop_image);
            this.load.image("asset_ui_avatars_image", asset_ui_avatars_image);

            // Cargar dinámicamente los assets de inventario
            this.backpackUserItems.forEach(item => {
                this.load.image(item.sprite_name, 'assets/game/objects/' + item.sprite_name + '.png');
            });
        }

        // Cargar objetos de escena existentes
        this.sceneItems.forEach(item => {
            if (!this.textures.exists(item.sprite_name)) {
                this.load.image(item.sprite_name, 'assets/game/objects/' + item.sprite_name + '.png');
            }
        });
    }

    create() {
        //this.cameras.main.setBackgroundColor('#2ecc71');
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
            this.createInventory();
        }

        this.chatManager = new OverheadChatAnimation(this);

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('destroy', this.destroy, this);
        this.scene.pauseOnBlur = false;
        this.scene.pauseOnHide = false;
        
        if (this.sceneData.myScene) {
            this.createButtons();
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
            console.log('Socket event received:', ResponseSocketsEnum.ADD_ITEM_TO_INVENTORY);
            if (data.item) {
                this.inventoryItemsList.push(data.item);
                this.updateInventoryUI();
            }
        });
        socket.on(ResponseSocketsEnum.SCENE_REMOVE_ITEM, (data) => {
            console.log('Socket event received:', ResponseSocketsEnum.SCENE_REMOVE_ITEM);
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
            console.log('Socket event received:', ResponseSocketsEnum.SCENE_PUT_ITEM);
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

                    if (this.textures.exists(textureName)) {
                        this.sceneItems.push(item);
                        this.markOccupiedTiles();
                        this.renderSceneObjects();
                        if (this.moveModeActive) {
                            this.prepareObjectsForMoving();
                        }
                    } else {
                        // Texture doesn't exist, load it first
                        this.load.image(textureName, 'assets/game/objects/' + textureName + '.png');

                        this.load.once(`filecomplete-image-${textureName}`, () => {
                            this.sceneItems.push(item);
                            this.markOccupiedTiles();
                            this.renderSceneObjects();
                            if (this.moveModeActive) {
                                this.prepareObjectsForMoving();
                            }
                        });

                        this.load.start();
                    }
                }
            }
        });
        socket.on(ResponseSocketsEnum.REMOVE_ITEM_FROM_INVENTORY, (data) => {
            console.log('Socket event received:', ResponseSocketsEnum.REMOVE_ITEM_FROM_INVENTORY);
            const itemId = data.user_catalog_item_id;
            const itemIndex = this.inventoryItemsList.findIndex(i => i.id === itemId);
            if (itemIndex !== -1) {
                this.inventoryItemsList.splice(itemIndex, 1);
                this.updateInventoryUI();
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

    // ================ NUEVOS MÉTODOS ================ //
    createButtons() {
        const BUTTON_SIZE = 50;
        const BUTTON_SPACING = 15;
        const START_X = 30;
        const Y = 10;

        /* ---------- TEXTURAS COMPARTIDAS (una sola vez) ---------- */
        if (!this.textures.exists('btn_bg')) {
            const g = this.add.graphics();
            g.fillStyle(0xffffff, 0.8)
                .fillRoundedRect(0, 0, BUTTON_SIZE, BUTTON_SIZE, 5)
                .lineStyle(1, 0xcccccc, 1)
                .strokeRoundedRect(0, 0, BUTTON_SIZE, BUTTON_SIZE, 5);
            g.generateTexture('btn_bg', BUTTON_SIZE, BUTTON_SIZE);
            g.destroy();
        }

        if (!this.textures.exists('tooltip_bg')) {
            const W = 100, H = 25, A = 8;
            const g = this.add.graphics();
            g.fillStyle(0x000000, 0.8);
            g.fillRoundedRect(0, A, W, H, 5);
            g.beginPath();
            g.moveTo(W / 2, 0);
            g.lineTo(W / 2 - 8, A);
            g.lineTo(W / 2 + 8, A);
            g.closePath();
            g.fill();
            g.generateTexture('tooltip_bg', W, H + A);
            g.destroy();
        }

        /* ------------------ TOOLTIP REUTILIZABLE ------------------ */
        const tooltip = this.add.container(0, 0)
            .setDepth(10002)
            .setScrollFactor(0)
            .setVisible(false);

        const tooltipBg = this.add.image(0, 0, 'tooltip_bg').setOrigin(0);
        const tooltipText = this.add.text(50, 20.5, '', {
            fontSize: '12px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 90, useAdvancedWrap: true }
        }).setOrigin(0.5, 0.5);

        tooltip.add([tooltipBg, tooltipText]);

        const showTooltip = (btn, txt) => {
            tooltipText.setText(txt);
            tooltip.setPosition(btn.x + BUTTON_SIZE / 2 - 50, btn.y + BUTTON_SIZE + 5);
            tooltip.setVisible(true);
        };
        const hideTooltip = () => tooltip.setVisible(false);

        /* ------------------ FÁBRICA DE BOTONES ------------------- */
        const makeButton = (x, iconKey, cb, tip, isMiddle = false) => {
            const cont = this.add.container(x, Y)
                .setScrollFactor(0)
                .setDepth(10000);

            /* fondo visible */
            const bg = this.add.image(0, 0, 'btn_bg').setOrigin(0);

            /* zona invisible de input que cubre TODO el cuadrado */
            const zone = this.add.zone(0, 0, BUTTON_SIZE, BUTTON_SIZE)
                .setOrigin(0)
                .setInteractive();

            /* icono */
            const icon = this.add.image(BUTTON_SIZE / 2, BUTTON_SIZE / 2, iconKey);
            const padding = isMiddle ? 10 : 20;
            icon.setScale(Math.min((BUTTON_SIZE - padding) / icon.width,
                (BUTTON_SIZE - padding) / icon.height));

            cont.add([bg, icon, zone]);

            zone.on('pointerdown', cb)
                .on('pointerover', () => {
                    this.input.setDefaultCursor('pointer');
                    showTooltip(cont, tip);
                })
                .on('pointerout', () => {
                    this.input.setDefaultCursor('default');
                    hideTooltip();
                });

            return cont;
        };

        /* --------------------- BOTÓN “TIENDA” --------------------- */
        this.shopButton = makeButton(
            START_X,
            'asset_ui_shop_image',
            () => {
                console.log('Botón de tienda pulsado');
            },
            'Tienda'
        );

        /* --------------------- BOTÓN “AVATARES” --------------------- */
        this.avatarsButton = makeButton(
            START_X + BUTTON_SIZE + BUTTON_SPACING,
            'asset_ui_avatars_image',
            () => {
                console.log('Botón de avatares pulsado');
            },
            'Avatares'
        );

        /* --------------------- BOTÓN “COLOREAR” --------------------- */
        this.colorButton = makeButton(
            START_X + (BUTTON_SIZE + BUTTON_SPACING) * 2,
            'asset_ui_color_scene_image',
            () => {
                console.log('Boton de colorear pulsado');
            },
            'Colorear',
            true
        );

        /* --------------------- BOTÓN “MOVER” --------------------- */
        this.moveButton = makeButton(
            START_X + (BUTTON_SIZE + BUTTON_SPACING) * 3,
            'asset_ui_move_item_image',
            () => this.toggleMoveMode(),
            'Mover'
        );

        /* ------------------ BOTÓN “INVENTARIO” ------------------ */
        this.inventoryButton = makeButton(
            START_X + (BUTTON_SIZE + BUTTON_SPACING) * 4,
            'asset_ui_backpack_image',
            () => {
                if (this.inventoryContainer) {
                    this.inventoryContainer.setVisible(!this.inventoryContainer.visible);
                }
            },
            'Inventario'
        );
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
                    this.tiles[row][col].isClickable = (gameMap[row][col] === 0);
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
                bob.alpha = 1;
                if (row < this.tileGrid.length && col < this.tileGrid[row].length) {
                    this.tileGrid[row][col].occupied = true;
                    this.tileGrid[row][col].objectId = item.id;
                    this.tileGrid[row][col].isClickable = false;
                    this.tileGrid[row][col].bob = bob;
                    // Bloquear clic en el suelo para los tiles ocupados por objetos
                    if (this.tiles[row] && this.tiles[row][col]) {
                        this.tiles[row][col].isClickable = false;
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
        this.tween = this.tweens.add({
            targets: this.moveButton,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    stopButtonBlink() {
        if (this.tween) {
            this.tween.stop();
            this.tween.remove();
            this.tween = null;
            this.moveButton.alpha = 1;
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
                if (this.moveModeActive) {
                    this.selectObject(item);
                }
            });
        });
    }


    selectObject(item) {
        if (this.selectedObject) {
            this.deselectObject();
        }

        this.selectedObject = item;
        this.originalPositions[item.id] = {
            x: item.sprite.x,
            y: item.sprite.y,
            occupied_tiles: [...item.occupied_tiles]
        };

        // Mostrar panel de detalles en esquina fija
        this.createDetailPanel(item);

        // CORRECCIÓN: Marcar como draggable correctamente
        this.input.setDraggable(item.sprite);

        this.setupDragEvents(item);
    }

    /**
     * Mostrar panel de detalles del objeto seleccionado en esquina fija.
     */
    createDetailPanel(item) {
        if (this.detailPanel) this.detailPanel.destroy();
        if (this.inventoryContainer) this.inventoryContainer.setVisible(false);

        /* ---------- CONSTANTES ---------- */
        const PAD = 10;
        const ICON_SIZE = 100;
        const SLOT_SIZE = 60;
        const SLOT_PAD = 5;
        const INV_NAV_H = 30;
        const PANEL_W = SLOT_SIZE * 3 + SLOT_PAD * 4;
        const PANEL_H = SLOT_SIZE * 3 + SLOT_PAD * 4 + INV_NAV_H + SLOT_PAD;
        const BTN_W = 60;
        const BTN_H = 25;

        const nameStyle = { fontSize: '14px', color: '#000000' };
        const btnTextStyle = { fontSize: '12px', color: '#ffffff' };

        /* ---------- POSICIÓN PANEL ---------- */
        const x = this.scale.width - PANEL_W - PAD;
        const y = this.scale.height - PANEL_H - 100;

        /* ---------- CONTENEDOR PRINCIPAL ---------- */
        this.detailPanel = this.add.container(x, y)
            .setDepth(10000)
            .setScrollFactor(0);

        /* ---------- TEXTURA DE FONDO (solo se crea 1ª vez) ---------- */
        if (!this.textures.exists('detail_panel_bg')) {
            const g = this.add.graphics();
            g.fillStyle(0xffffff, 0.8)
                .fillRoundedRect(0, 0, PANEL_W, PANEL_H, 5);
            g.generateTexture('detail_panel_bg', PANEL_W, PANEL_H);
            g.destroy();
        }
        this.detailPanel.add(this.add.image(0, 0, 'detail_panel_bg').setOrigin(0));

        /* ---------- BOTÓN CERRAR ---------- */
        const closeZone = this.add.zone(PANEL_W - PAD - 16, PAD, 16, 16)
            .setOrigin(0)
            .setInteractive({ useHandCursor: true });
        closeZone.on('pointerdown', () => this.deselectObject());

        const closeText = this.add.text(
            closeZone.x + 8, closeZone.y, 'X',
            { fontSize: '16px', color: '#000000', fontStyle: 'bold' }
        ).setOrigin(0.5, 0);

        this.detailPanel.add([closeText, closeZone]);

        /* ---------- NOMBRE DEL OBJETO ---------- */
        const nameText = this.add.text(PAD, PAD, item.display_name, nameStyle)
            .setOrigin(0, 0);
        this.detailPanel.add(nameText);

        /* ---------- ICONO DEL OBJETO ---------- */
        const icon = this.add.image(
            PANEL_W / 2,
            nameText.y + nameText.height + PAD + ICON_SIZE / 2,
            item.sprite_name
        ).setOrigin(0.5);
        icon.setScale(Math.min(ICON_SIZE / icon.width, ICON_SIZE / icon.height));
        this.detailPanel.add(icon);

        /* ---------- BOTÓN “BORRAR” ---------- */

        /* textura roja compartida */
        if (!this.textures.exists('btn_red_bg')) {
            const g = this.add.graphics();
            g.fillStyle(0xff0000, 1)
                .fillRoundedRect(0, 0, BTN_W, BTN_H, 4);
            g.generateTexture('btn_red_bg', BTN_W, BTN_H);
            g.destroy();
        }

        const btnX = PAD;
        const btnY = icon.y + ICON_SIZE / 2 + PAD;

        const deleteBg = this.add.image(btnX, btnY, 'btn_red_bg').setOrigin(0);
        const deleteText = this.add.text(
            btnX + BTN_W / 2,
            btnY + BTN_H / 2,
            'Borrar',
            btnTextStyle
        ).setOrigin(0.5);

        const deleteZone = this.add.zone(btnX, btnY, BTN_W, BTN_H)
            .setOrigin(0)
            .setInteractive({ useHandCursor: true });
        deleteZone.on('pointerdown', () => this.removeSelectedObject());

        this.detailPanel.add([deleteBg, deleteText, deleteZone]);
    }


    /**
     * Eliminar el objeto seleccionado y añadirlo al inventario.
     */
    removeSelectedObject() {
        if (!this.selectedObject) return;

        // Emitir el evento por socket para que el servidor gestione la eliminación
        socket.emit(RequestSocketsEnum.SCENE_REMOVE_ITEM, {
            user_catalog_item_id: this.selectedObject.id
        });

        // Deseleccionar el objeto en la UI para dar feedback inmediato
        this.deselectObject();
    }

    setupDragEvents(item) {
        const sprite = item.sprite;
        const tileWidth = 65;
        const tileHeight = 33;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;
        const centerX = this.scale.width / 2;

        // Limpiar listeners previos para evitar duplicados
        sprite.off('drag');
        sprite.off('dragend');

        sprite.on('drag', (pointer) => {
            // Forzar el origen del sprite (su base) a seguir la posición del cursor.
            // Esto anula el desfase del clic inicial y centra el arrastre en la base.
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
                // Emit socket event instead of updating locally
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

        this.selectedObject.isDragging = false;
        // CORRECCIÓN: Desactivar el arrastre
        this.input.setDraggable(this.selectedObject.sprite, false);
        this.selectedObject = null;

        if (this.detailPanel) {
            this.detailPanel.destroy();
            this.detailPanel = null;
        }

        if (this.inventoryContainer) {

        }
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
                item.sprite = this.add.image(avgX, y, item.sprite_name)
                    .setOrigin(0.5, 0.90)
                    .setDepth(y);
            } else {
                item.sprite.setPosition(avgX, y);
                item.sprite.setDepth(y);
            }
        });
    }

    shutdown() {
        RemovePhaserSocketsUtil.main(socket);
        if (this.chatManager) {
            this.chatManager.destroy();
            this.chatManager = null;
        }
    }

    destroy() {
        this.shutdown();
    }

    /**
     * Crear panel de inventario reutilizable para optimizar rendimiento.
     * Los slots se crean una vez y solo se actualiza su contenido.
     */
    createInventory() {
        const PAD = 10;
        const SLOT_SIZE = 60;
        const SLOT_PAD = 5;
        const NAV_H = 30;
        const INV_W = SLOT_SIZE * 3 + SLOT_PAD * 4;
        const INV_H = SLOT_SIZE * 3 + SLOT_PAD * 4 + NAV_H + SLOT_PAD;
        const x = this.scale.width - INV_W - PAD;
        const y = this.scale.height - INV_H - 100;

        if (this.inventoryContainer) this.inventoryContainer.destroy();

        this.inventoryContainer = this.add.container(x, y)
            .setDepth(10000)
            .setScrollFactor(0)
            .setVisible(false);

        if (!this.textures.exists('inv_bg')) {
            const g = this.add.graphics();
            g.fillStyle(0xffffff, 0.8);
            g.fillRoundedRect(0, 0, INV_W, INV_H, 5);
            g.generateTexture('inv_bg', INV_W, INV_H);
            g.destroy();
        }
        this.inventoryContainer.add(this.add.image(0, 0, 'inv_bg').setOrigin(0));

        const closeButton = this.add.text(INV_W - SLOT_PAD, SLOT_PAD, 'X', {
            fontSize: '16px', color: '#000000', fontStyle: 'bold'
        })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true });
        closeButton.on('pointerdown', () => this.inventoryContainer.setVisible(false));
        this.inventoryContainer.add(closeButton);

        /* ---------- PAGINACIÓN (ARRIBA) ---------- */
        const btnStyle = { fontSize: '18px', color: '#000000' };
        const navY = SLOT_PAD + 5;
        const prevBtn = this.add.text(SLOT_PAD + 10, navY, '<', btnStyle)
            .setInteractive({ useHandCursor: true });
        const nextBtn = this.add.text(INV_W - SLOT_PAD - 28, navY, '>', btnStyle)
            .setInteractive({ useHandCursor: true });
        this.pageText = this.add.text(INV_W / 2, navY, '', {
            fontSize: '14px', color: '#000000'
        }).setOrigin(0.5, 0);

        prevBtn.on('pointerdown', () => {
            this.inventoryPage = Math.max(0, this.inventoryPage - 1);
            this.updateInventoryUI();
        });
        nextBtn.on('pointerdown', () => {
            this.inventoryPage = Math.min(this.totalPages - 1, this.inventoryPage + 1);
            this.updateInventoryUI();
        });
        this.inventoryContainer.add([prevBtn, nextBtn, this.pageText]);

        /* ---------- TOTAL DE OBJETOS ---------- */
        this.totalItemsText = this.add.text(INV_W / 2, INV_H - NAV_H + 5, '', {
            fontSize: '12px', color: '#000000'
        }).setOrigin(0.5, 0);
        this.inventoryContainer.add(this.totalItemsText);

        /* ---------- CREACIÓN DE SLOTS Y REJILLA DE FONDO ---------- */
        this.inventorySlots = [];
        const slotsY = navY + NAV_H;

        if (!this.textures.exists('slot_grid_bg')) {
            const gridGraphics = this.add.graphics();
            gridGraphics.lineStyle(1, 0x000000, 0.2);
            for (let i = 0; i < 9; i++) {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const slotX = SLOT_PAD + col * (SLOT_SIZE + SLOT_PAD);
                const slotY = slotsY + row * (SLOT_SIZE + SLOT_PAD);
                gridGraphics.strokeRect(slotX, slotY, SLOT_SIZE, SLOT_SIZE);
            }
            gridGraphics.generateTexture('slot_grid_bg', INV_W, INV_H);
            gridGraphics.destroy();
        }
        this.inventoryContainer.add(this.add.image(0, 0, 'slot_grid_bg').setOrigin(0));


        for (let i = 0; i < 9; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const slotX = SLOT_PAD + col * (SLOT_SIZE + SLOT_PAD);
            const slotY = slotsY + row * (SLOT_SIZE + SLOT_PAD);

            const slotContainer = this.add.container(slotX, slotY).setVisible(false);

            const icon = this.add.image(SLOT_SIZE / 2, SLOT_SIZE / 2, '__DEFAULT')
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            const countText = this.add.text(SLOT_SIZE - 5, SLOT_SIZE - 5, '', {
                fontSize: '14px', color: '#000000'
            }).setOrigin(1);

            slotContainer.add([icon, countText]);
            this.inventoryContainer.add(slotContainer);

            this.inventorySlots.push({ container: slotContainer, icon, countText, group: null });
        }

        this.updateInventoryUI();
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
