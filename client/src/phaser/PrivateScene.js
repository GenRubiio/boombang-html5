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

        // Datos dinámicos de inventario y objetos
        this.backpackUserItems = [
            {
                id: 1,
                sprite_name: "500oroCatalog",
                path: "assets/game/objects/500oroCatalog.png",
                map_size: [[0, 0]],
                occupied_tiles: [],
                display_name: "500 Oro"
            },
            {
                id: 4,
                sprite_name: "500oroCatalog",
                path: "assets/game/objects/500oroCatalog.png",
                map_size: [[0, 0]],
                occupied_tiles: [],
                display_name: "500 Oro"
            },
            {
                id: 5,
                sprite_name: "well",
                path: "assets/game/objects/well.png",
                map_size: [[0, 1], [1, 2], [2, 1], [1, 0], [1, 1]],
                occupied_tiles: [],
                display_name: "Pozo"
            },
        ];

        this.sceneItems = [
            {
                id: 2,
                sprite_name: "well",
                path: "assets/game/objects/well.png",
                map_size: [[0, 1], [1, 2], [2, 1], [1, 0], [1, 1]],
                occupied_tiles: [[11, 10], [12, 11], [11, 12], [10, 11], [11, 11]],
                display_name: "Pozo"
            },
            {
                id: 3,
                sprite_name: "well",
                path: "assets/game/objects/well.png",
                map_size: [[0, 1], [1, 2], [2, 1], [1, 0], [1, 1]],
                occupied_tiles: [[12, 18], [13, 17], [14, 18], [13, 19], [13, 18]],
                display_name: "Pozo"
            },
            {
                id: 6,
                sprite_name: "wood_ball",
                path: "assets/game/objects/wood_ball.png",
                map_size: [[0, 1], [1, 2], [2, 1], [1, 0], [1, 1]],
                occupied_tiles: [[18, 14], [19, 13], [20, 14], [19, 15], [19, 14]],
                display_name: "Bola de Madera"
            }
        ];


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

        // Cargar dinámicamente los assets de inventario
        this.backpackUserItems.forEach(item => {
            this.load.image(item.sprite_name, item.path);
        });

        // Cargar objetos de escena existentes
        this.sceneItems.forEach(item => {
            if (!this.textures.exists(item.sprite_name)) {
                this.load.image(item.sprite_name, item.path);
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

        this.initializeTileGrid();

        // Marcar tiles ocupados
        this.markOccupiedTiles();

        // Renderizar objetos existentes en la escena
        this.renderSceneObjects();

        this.vueComponent.$emit("updateLoading", false);
        this.createInventory();

        this.chatManager = new OverheadChatAnimation(this);

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('destroy', this.destroy, this);
        this.scene.pauseOnBlur = false;
        this.scene.pauseOnHide = false;

        this.createMoveButton();
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
    createMoveButton() {
        // Crear botón cuadrado en la esquina superior derecha
        this.moveButton = this.add.rectangle(
            50, // Posición X (esquina derecha)
            100,
            40,  // ancho
            40,  // alto
            0x00ff00 // color verde
        )
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(10000)
            .setAlpha(0.7)
            .on('pointerdown', () => {
                this.toggleMoveMode();
            });

        // Texto dentro del botón
        this.add.text(
            this.moveButton.x,
            this.moveButton.y,
            'M', // Texto del botón
            {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(10001);

        // Texto indicativo debajo
        this.add.text(
            this.moveButton.x,
            this.moveButton.y + 30,
            'Mover',
            { fontSize: '12px', color: '#fff' }
        )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(10001);
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
        this.tileBlitter = this.add.blitter(0, 0, "tile");
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
            this.moveButton.alpha = 0.7;
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

        if (this.inventoryContainer) {
            this.inventoryContainer.setVisible(false);
        }

        const pad = 10;
        const iconSize = 100;
        const nameStyle = { fontSize: '14px', color: '#000000' };
        const btnStyle = { fontSize: '12px', color: '#ffffff' }; // White text on red button

        // Match inventory width
        const slotSize = 60;
        const slotPad = 5;
        const panelW = slotSize * 3 + slotPad * 4;
        const invNavH = 30; // Height of inventory navigation
        const panelH = slotSize * 3 + slotPad * 4 + invNavH + slotPad; // Match inventory height

        const x = this.scale.width - panelW - pad;
        const y = this.scale.height - panelH - 100; // 100px bottom margin

        this.detailPanel = this.add.container(x, y)
            .setDepth(10000)
            .setScrollFactor(0);

        const bg = this.add.graphics();
        bg.fillStyle(0xffffff, 0.8); // White, slightly transparent background
        bg.fillRoundedRect(0, 0, panelW, panelH, 5); // 5px border radius
        this.detailPanel.add(bg);

        const closeButton = this.add.text(panelW - pad, pad, 'X', { fontSize: '16px', color: '#000000', fontStyle: 'bold' })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true });
        this.detailPanel.add(closeButton);
        closeButton.on('pointerdown', () => this.deselectObject());

        // Name at the left
        const nameText = this.add.text(pad, pad, item.display_name, nameStyle)
            .setOrigin(0, 0);
        this.detailPanel.add(nameText);

        // Image 100x100 centered below name
        const icon = this.add.image(panelW / 2, nameText.y + nameText.height + pad + iconSize / 2, item.sprite_name)
            .setOrigin(0.5);
        // Scale to fit, don't stretch
        const scale = Math.min(iconSize / icon.width, iconSize / icon.height);
        icon.setScale(scale);
        this.detailPanel.add(icon);

        // Delete button aligned left below image
        const btnW = 60;
        const btnH = 25;
        const btnX = pad;
        const btnY = icon.y + icon.displayHeight / 2 + pad;
        const btnBg = this.add.rectangle(btnX, btnY, btnW, btnH, 0xff0000)
            .setOrigin(0)
            .setInteractive({ useHandCursor: true });
        const btnText = this.add.text(btnX + btnW / 2, btnY + btnH / 2, 'Borrar', btnStyle)
            .setOrigin(0.5);
        this.detailPanel.add(btnBg);
        this.detailPanel.add(btnText);

        btnBg.on('pointerdown', () => this.removeSelectedObject());
    }

    /**
     * Eliminar el objeto seleccionado y añadirlo al inventario.
     */
    removeSelectedObject() {
        if (!this.selectedObject) return;
        const removed = this.selectedObject;
        // Deseleccionar primero para evitar errores en setDraggable
        this.deselectObject();
        // Eliminar sprite y del array de objetos de escena
        const spriteToDestroy = removed.sprite;
        this.sceneItems = this.sceneItems.filter(i => i.id !== removed.id);
        spriteToDestroy.destroy();
        // Añadir de nuevo al inventario
        this.inventoryItemsList.push({
            id: removed.id,
            sprite_name: removed.sprite_name,
            path: removed.path,
            map_size: removed.map_size,
            display_name: removed.display_name
        });
        // Actualizar escena e inventario
        this.markOccupiedTiles();
        this.renderSceneObjects();
        this.updateInventoryUI();
    }

    setupDragEvents(item) {
        const sprite = item.sprite;
        const tileWidth = 65;
        const tileHeight = 33;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;
        const centerX = this.scale.width / 2;

        sprite.on('drag', (pointer, dragX, dragY) => {
            sprite.x = dragX;
            sprite.y = dragY;

        });

        sprite.off('dragend');
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
                item.occupied_tiles = newTiles;
                this.markOccupiedTiles();
                this.renderSceneObjects();
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

        for (const [col, row] of newTiles) {
            // Verificar límites
            if (row < 0 || row >= rows || col < 0 || col >= cols) {
                return false;
            }

            // No se puede posicionar si el piso no es clickeable (mapa) o está ocupado por otro objeto
            if (this.tiles?.[row]?.[col]?.isClickable === false) {
                return false;
            }
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

        // CORRECCIÓN: Desactivar el arrastre
        this.input.setDraggable(this.selectedObject.sprite, false);
        this.selectedObject = null;

        if (this.detailPanel) {
            this.detailPanel.destroy();
            this.detailPanel = null;
        }

        if (this.inventoryContainer) {
            this.inventoryContainer.setVisible(true);
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
     * Crear panel de inventario con grid 3×3 y paginación.
     */
    createInventory() {
        // Contenedor fijo en esquina inferior derecha
        const pad = 10;
        const slotSize = 60;
        const slotPad = 5;
        const navH = 30;
        const invW = slotSize * 3 + slotPad * 4;
        const invH = slotSize * 3 + slotPad * 4 + navH + slotPad;
        const x = this.scale.width - invW - pad;
        const y = this.scale.height - invH - 100; // 100px bottom margin

        if (this.inventoryContainer) this.inventoryContainer.destroy();
        this.inventoryContainer = this.add.container(x, y)
            .setDepth(10000)
            .setScrollFactor(0);

        const bg = this.add.graphics();
        bg.fillStyle(0xffffff, 0.8); // White, slightly transparent background
        bg.fillRoundedRect(0, 0, invW, invH, 5); // 5px border radius
        this.inventoryContainer.add(bg);

        // Contenedor para slots dinámicos
        this.slotsContainer = this.add.container(0, 0);
        this.inventoryContainer.add(this.slotsContainer);

        // Botones de paginación
        const btnStyle = { fontSize: '18px', color: '#000000' };
        const prevBtn = this.add.text(slotPad, slotSize * 3 + slotPad * 2, '<', btnStyle)
            .setInteractive({ useHandCursor: true });
        const nextBtn = this.add.text(invW - slotPad - 18, slotSize * 3 + slotPad * 2, '>', btnStyle)
            .setInteractive({ useHandCursor: true });
        this.pageText = this.add.text(invW / 2, slotSize * 3 + slotPad * 2 + 5, '', { fontSize: '14px', color: '#000000' })
            .setOrigin(0.5, 0);
        this.inventoryContainer.add([prevBtn, nextBtn, this.pageText]);

        prevBtn.on('pointerdown', () => { this.inventoryPage = Math.max(0, this.inventoryPage - 1); this.updateInventoryUI(); });
        nextBtn.on('pointerdown', () => { this.inventoryPage = Math.min(this.totalPages - 1, this.inventoryPage + 1); this.updateInventoryUI(); });

        this.updateInventoryUI();
    }

    /**
     * Actualizar visualización del inventario según la página actual.
     */
    updateInventoryUI() {
        const pad = 10;
        const slotSize = 60;
        const slotPad = 5;
        const tileWidth = 65;
        const tileHeight = 33;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;
        const centerX = this.scale.width / 2;

        const grouped = this.groupItems(this.inventoryItemsList);
        this.totalPages = Math.max(1, Math.ceil(grouped.length / 9));
        this.inventoryPage = Phaser.Math.Clamp(this.inventoryPage, 0, this.totalPages - 1);
        this.pageText.setText(`${this.inventoryPage + 1}/${this.totalPages}`);

        this.slotsContainer.removeAll(true);
        const pageItems = grouped.slice(this.inventoryPage * 9, this.inventoryPage * 9 + 9);
        pageItems.forEach((group, idx) => {
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            const x = slotPad + col * (slotSize + slotPad);
            const y = slotPad + row * (slotSize + slotPad);

            const slotBg = this.add.graphics({ x: x, y: y });
            slotBg.fillStyle(0xffffff, 1); // White, opaque background
            slotBg.fillRoundedRect(0, 0, slotSize, slotSize, 5); // 5px border radius
            this.slotsContainer.add(slotBg);

            const icon = this.add.image(x + slotSize / 2, y + slotSize / 2, group.sprite_name)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });
            const maxSize = slotSize - 10;
            const scale = Math.min(maxSize / icon.width, maxSize / icon.height);
            icon.setScale(scale);
            this.slotsContainer.add(icon);

            if (group.count > 1) {
                const countText = this.add.text(x + slotSize - 5, y + slotSize - 5, `${group.count}`, { fontSize: '14px', color: '#000000' })
                    .setOrigin(1);
                this.slotsContainer.add(countText);
            }

            // Permitir arrastrar desde inventario
            this.input.setDraggable(icon);
            icon.on('dragstart', () => {
                // Restaurar tamaño real al iniciar arrastre fuera del inventario
                icon.setScale(1);
                icon.setTint(0xaaaaaa);
            });
            icon.on('drag', (pointer, dragX, dragY) => { icon.x = dragX; icon.y = dragY; });
            icon.on('dragend', (pointer) => {
                icon.clearTint();
                const dropX = pointer.worldX;
                const dropY = pointer.worldY;
                const newTiles = this.calculateNewTiles(dropX, dropY, group.map_size, centerX, halfTileWidth, halfTileHeight);
                if (this.isPositionValid(newTiles, null)) {
                    // Tomar una instancia del inventario y asignar un ID único para evitar colisiones
                    const idxInv = this.inventoryItemsList.findIndex(i => i.sprite_name === group.sprite_name);
                    const used = this.inventoryItemsList.splice(idxInv, 1)[0];
                    used.occupied_tiles = newTiles;
                    // Generar un ID único para el objeto en escena
                    used.id = `dyn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                    this.sceneItems.push(used);
                    this.markOccupiedTiles();
                    this.renderSceneObjects();
                    if (this.moveModeActive) {
                        this.prepareObjectsForMoving();
                    }
                    this.updateInventoryUI();
                } else {
                    this.updateInventoryUI();
                }
            });
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
