import i18n from "@/plugins/i18n";
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";

class InventoryPrivateSceneHtml {
    constructor(scene) {
        this.scene = scene;
        this.inventoryContainer = null;
        this.inventorySlots = [];
        this.draggedItem = null;
        this.dragShadow = null;
        this.isVisible = false;
    }

    load() {
        const PAD = 10;
        const SLOT_SIZE = 60;
        const SLOT_PAD = 5;
        const NAV_H = 30;
        const INV_W = SLOT_SIZE * 3 + SLOT_PAD * 4;
        const INV_H = SLOT_SIZE * 3 + SLOT_PAD * 4 + NAV_H + SLOT_PAD;

        return `
            <div id="html-inventory" style="
                position: fixed;
                right: -497px;
                bottom: -258px;
                width: ${INV_W}px;
                height: auto;
                background: rgba(255, 255, 255, 0.9);
                border: 2px solid #cccccc;
                border-radius: 8px;
                z-index: 10000;
                display: none;
                font-family: Arial, sans-serif;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            ">
                <!-- Header with close button -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: ${SLOT_PAD}px;
                    border-bottom: 1px solid #ddd;
                ">
                    <span style="font-weight: bold; font-size: 14px;">Inventory</span>
                    <button id="inventory-close" style="
                        background: none;
                        border: none;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        color: #666;
                        padding: 0;
                        width: 20px;
                        height: 20px;
                    ">×</button>
                </div>

                <!-- Navigation -->
                <div id="inventory-nav" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: ${SLOT_PAD}px;
                    height: ${NAV_H}px;
                    box-sizing: border-box;
                ">
                    <button id="inventory-prev" style="
                        background: #f0f0f0;
                        border: 1px solid #ccc;
                        border-radius: 3px;
                        cursor: pointer;
                        padding: 2px 8px;
                        font-size: 18px;
                    ">&lt;</button>
                    <span id="inventory-page" style="font-size: 14px; color: #333;"></span>
                    <button id="inventory-next" style="
                        background: #f0f0f0;
                        border: 1px solid #ccc;
                        border-radius: 3px;
                        cursor: pointer;
                        padding: 2px 8px;
                        font-size: 18px;
                    ">&gt;</button>
                </div>

                <!-- Inventory Grid -->
                <div id="inventory-grid" style="
                    display: grid;
                    grid-template-columns: repeat(3, ${SLOT_SIZE}px);
                    grid-template-rows: repeat(3, ${SLOT_SIZE}px);
                    gap: ${SLOT_PAD}px;
                    padding: ${SLOT_PAD}px;
                    justify-content: center;
                ">
                    ${this.generateSlots(SLOT_SIZE)}
                </div>

                <!-- Total items counter -->
                <div id="inventory-total" style="
                    text-align: center;
                    padding: ${SLOT_PAD}px;
                    font-size: 12px;
                    color: #666;
                    border-top: 1px solid #ddd;
                "></div>
            </div>

        `;
    }

    generateSlots(slotSize) {
        let slotsHTML = '';
        for (let i = 0; i < 9; i++) {
            slotsHTML += `
                <div class="inventory-slot" data-slot="${i}" style="
                    width: ${slotSize}px;
                    height: ${slotSize}px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background: #f9f9f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    cursor: pointer;
                ">
                    <img class="slot-icon" style="
                        max-width: ${slotSize - 10}px;
                        max-height: ${slotSize - 10}px;
                        object-fit: contain;
                        display: none;
                    ">
                    <span class="slot-count" style="
                        position: absolute;
                        bottom: 2px;
                        right: 2px;
                        background: rgba(0, 0, 0, 0.7);
                        color: white;
                        font-size: 12px;
                        padding: 1px 4px;
                        border-radius: 2px;
                        display: none;
                    "></span>
                </div>
            `;
        }
        return slotsHTML;
    }

    create() {
        // Create HTML inventory and add to scene
        const inventoryHTML = this.load();
        this.inventoryContainer = this.scene.add.dom(this.scene.scale.width / 2, this.scene.scale.height / 2).createFromHTML(inventoryHTML);
        this.inventoryContainer.setOrigin(0.5, 0.5);
        this.inventoryContainer.setScrollFactor(0);
        this.inventoryContainer.setDepth(10000);

        this.createDragShadowElement();

        this.setupEventListeners();
        this.updateInventoryUI();
    }

    setupEventListeners() {
        const container = this.inventoryContainer.node;

        // Close button
        const closeBtn = container.querySelector('#inventory-close');
        closeBtn.addEventListener('click', () => this.hide());

        // Navigation buttons
        const prevBtn = container.querySelector('#inventory-prev');
        const nextBtn = container.querySelector('#inventory-next');

        prevBtn.addEventListener('click', () => {
            this.scene.inventoryPage = Math.max(0, this.scene.inventoryPage - 1);
            this.updateInventoryUI();
        });

        nextBtn.addEventListener('click', () => {
            const totalPages = Math.max(1, Math.ceil(this.getGroupedItems().length / 9));
            this.scene.inventoryPage = Math.min(totalPages - 1, this.scene.inventoryPage + 1);
            this.updateInventoryUI();
        });

        // Setup drag and drop for slots
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const container = this.inventoryContainer.node;
        const slots = container.querySelectorAll('.inventory-slot');
        const dragShadow = document.getElementById('drag-shadow');
        const dragShadowImg = document.getElementById('drag-shadow-img');

        slots.forEach((slot, index) => {
            const icon = slot.querySelector('.slot-icon');

            // Make slot draggable when it has an item
            slot.addEventListener('mousedown', (e) => {
                if (!icon.style.display || icon.style.display === 'none') return;

                const slotData = this.inventorySlots[index];
                if (!slotData || !slotData.group) return;

                this.startDrag(e, slotData, slot, dragShadow, dragShadowImg);
            });
        });

        // Global mouse events for dragging
        document.addEventListener('mousemove', (e) => this.handleDragMove(e, dragShadow));
        document.addEventListener('mouseup', (e) => this.handleDragEnd(e, dragShadow, dragShadowImg));
    }

    startDrag(e, slotData, slot, dragShadow, dragShadowImg) {
        e.preventDefault();

        this.draggedItem = slotData;

        // Setup shadow image
        let imageSrc = import.meta.env.VITE_APP_ENV == 'local' ? slotData.group.spreadsheet : slotData.group.spreadsheet_url;
        dragShadowImg.src = imageSrc;
        dragShadow.style.display = 'block';
        dragShadow.style.left = e.clientX + 'px';
        dragShadow.style.top = e.clientY + 'px';

        // Hide original slot temporarily
        slot.style.opacity = '0.3';

        // Add visual feedback
        document.body.style.cursor = 'grabbing';
    }

    handleDragMove(e, dragShadow) {
        if (!this.draggedItem || !dragShadow.style.display || dragShadow.style.display === 'none') return;

        dragShadow.style.left = e.clientX + 'px';
        dragShadow.style.top = e.clientY + 'px';

        // Create visual shadow on Phaser scene
        this.updatePhaserShadow(e.clientX, e.clientY);
    }

    updatePhaserShadow(clientX, clientY) {
        if (!this.draggedItem) return;

        // Convert screen coordinates to Phaser world coordinates
        const phaserCanvas = this.scene.sys.canvas;
        const rect = phaserCanvas.getBoundingClientRect();
        const scaleX = this.scene.scale.width / rect.width;
        const scaleY = this.scene.scale.height / rect.height;
        const worldX = (clientX - rect.left) * scaleX;
        let worldY = (clientY - rect.top) * scaleY;

        // Get the dragged image element to calculate the offset dynamically
        const dragImage = document.getElementById('drag-shadow-img');
        if (dragImage && dragImage.offsetHeight > 0) {
            // Offset to position the shadow at the bottom of the dragged image.
            // The offset is based on the image's screen height.
            const yOffset = dragImage.offsetHeight / 2;
            worldY += yOffset;
        }

        // Calculate tile position
        const TILE_WIDTH = 65;
        const TILE_HEIGHT = 33;
        const HALF_TILE_WIDTH = TILE_WIDTH / 2;
        const HALF_TILE_HEIGHT = TILE_HEIGHT / 2;
        const CENTER_X = this.scene.scale.width / 2;

        const newTiles = this.scene.calculateNewTiles(
            worldX, worldY, this.draggedItem.group.map_size,
            CENTER_X, HALF_TILE_WIDTH, HALF_TILE_HEIGHT
        );

        // Show/hide shadow tiles based on validity
        // this.showShadowTiles(newTiles);
    }

    showShadowTiles(tiles) {
        // Clear previous shadow tiles
        if (this.shadowTiles) {
            this.shadowTiles.forEach(tile => tile.destroy());
        }
        this.shadowTiles = [];

        const isValid = this.scene.isPositionValid(tiles, null);
        const color = isValid ? 0x00ff00 : 0xff0000;
        const alpha = 0.5;

        const TILE_WIDTH = 65;
        const TILE_HEIGHT = 33;
        const HALF_TILE_WIDTH = TILE_WIDTH / 2;
        const HALF_TILE_HEIGHT = TILE_HEIGHT / 2;
        const CENTER_X = this.scene.scale.width / 2;

        tiles.forEach(([col, row]) => {
            const x = (col - row) * HALF_TILE_WIDTH + CENTER_X - HALF_TILE_WIDTH;
            const y = (col + row) * HALF_TILE_HEIGHT - HALF_TILE_HEIGHT;

            const shadowTile = this.scene.add.graphics();
            shadowTile.fillStyle(color, alpha);
            shadowTile.fillRect(0, 0, TILE_WIDTH, TILE_HEIGHT);
            shadowTile.setPosition(x, y);
            shadowTile.setDepth(1000);

            this.shadowTiles.push(shadowTile);
        });
    }

    handleDragEnd(e, dragShadow, dragShadowImg) {
        if (!this.draggedItem) return;

        // Hide drag shadow
        dragShadow.style.display = 'none';
        document.body.style.cursor = 'default';

        // Clear shadow tiles (disabled)
        /* if (this.shadowTiles) {
            this.shadowTiles.forEach(tile => tile.destroy());
            this.shadowTiles = [];
        } */

        // Check if dropped on Phaser scene
        const phaserCanvas = this.scene.sys.canvas;
        const rect = phaserCanvas.getBoundingClientRect();

        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {

            this.handleDropOnScene(e, rect);
        }

        // Reset slot opacity
        const container = this.inventoryContainer.node;
        const slots = container.querySelectorAll('.inventory-slot');
        slots.forEach(slot => slot.style.opacity = '1');

        this.draggedItem = null;
    }

    handleDropOnScene(e, rect) {
        const scaleX = this.scene.scale.width / rect.width;
        const scaleY = this.scene.scale.height / rect.height;
        const worldX = (e.clientX - rect.left) * scaleX;
        const worldY = (e.clientY - rect.top) * scaleY;

        const TILE_WIDTH = 65;
        const TILE_HEIGHT = 33;
        const HALF_TILE_WIDTH = TILE_WIDTH / 2;
        const HALF_TILE_HEIGHT = TILE_HEIGHT / 2;
        const CENTER_X = this.scene.scale.width / 2;

        const newTiles = this.scene.calculateNewTiles(
            worldX, worldY, this.draggedItem.group.map_size,
            CENTER_X, HALF_TILE_WIDTH, HALF_TILE_HEIGHT
        );

        if (this.scene.isPositionValid(newTiles, null)) {
            // Find item instance and emit socket event
            const itemInstance = this.scene.inventoryItemsList.find(
                i => i.sprite_name === this.draggedItem.group.sprite_name
            );

            if (itemInstance) {
                socket.emit(RequestSocketsEnum.SCENE_PUT_ITEM, {
                    user_catalog_item_id: itemInstance.id,
                    occupied_tiles: newTiles
                });
            }
        }
    }

    show() {
        if (this.scene.htmlDetailPanel && this.scene.htmlDetailPanel.isVisible) {
            this.scene.htmlDetailPanel.hide();
        }
        console.log('Show inventory called');
        const container = this.inventoryContainer.node.querySelector('#html-inventory');
        console.log('Container found:', container);
        if (container) {
            container.style.display = 'block';
            this.isVisible = true;
            this.updateInventoryUI();
            console.log('Inventory should now be visible');
        } else {
            console.error('HTML inventory container not found');
        }
    }

    hide() {
        console.log('Hide inventory called');
        const container = this.inventoryContainer.node.querySelector('#html-inventory');
        if (container) {
            container.style.display = 'none';
            this.isVisible = false;
        }
    }

    toggle() {
        console.log('Toggle inventory called, isVisible:', this.isVisible);
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    updateInventoryUI() {
        if (!this.inventoryContainer) return;

        const container = this.inventoryContainer.node;
        const grouped = this.getGroupedItems();
        const totalPages = Math.max(1, Math.ceil(grouped.length / 9));

        this.scene.inventoryPage = Phaser.Math.Clamp(this.scene.inventoryPage, 0, totalPages - 1);

        // Update navigation
        const pageText = container.querySelector('#inventory-page');
        const totalText = container.querySelector('#inventory-total');

        pageText.textContent = `${this.scene.inventoryPage + 1} / ${totalPages}`;
        totalText.textContent = `Total: ${this.scene.inventoryItemsList.length}`;

        // Update slots
        const pageItems = grouped.slice(this.scene.inventoryPage * 9, this.scene.inventoryPage * 9 + 9);
        const slots = container.querySelectorAll('.inventory-slot');

        this.inventorySlots = [];

        slots.forEach((slot, index) => {
            const icon = slot.querySelector('.slot-icon');
            const count = slot.querySelector('.slot-count');
            const group = pageItems[index];

            if (group) {
                this.inventorySlots[index] = { group };
                let imageSrc = import.meta.env.VITE_APP_ENV == 'local' ? group.spreadsheet : group.spreadsheet_url;
                icon.src = imageSrc;
                icon.style.display = 'block';

                if (group.count > 1) {
                    count.textContent = group.count;
                    count.style.display = 'block';
                } else {
                    count.style.display = 'none';
                }

                slot.style.cursor = 'grab';
            } else {
                this.inventorySlots[index] = null;
                icon.style.display = 'none';
                count.style.display = 'none';
                slot.style.cursor = 'default';
            }
        });
    }

    getGroupedItems() {
        const map = {};
        this.scene.inventoryItemsList.forEach(item => {
            if (!map[item.sprite_name]) {
                map[item.sprite_name] = { ...item, count: 0 };
            }
            map[item.sprite_name].count++;
        });
        return Object.values(map);
    }

    createDragShadowElement() {
        if (document.getElementById('drag-shadow')) return;

        const dragShadowDiv = document.createElement('div');
        dragShadowDiv.id = 'drag-shadow';
        dragShadowDiv.style.position = 'fixed';
        dragShadowDiv.style.pointerEvents = 'none';
        dragShadowDiv.style.zIndex = '10001';
        dragShadowDiv.style.display = 'none';
        dragShadowDiv.style.opacity = '0.7';
        dragShadowDiv.style.transform = 'translate(-50%, -50%)';

        const dragShadowImg = document.createElement('img');
        dragShadowImg.id = 'drag-shadow-img';
        dragShadowImg.style.objectFit = 'contain';

        dragShadowDiv.appendChild(dragShadowImg);
        document.body.appendChild(dragShadowDiv);
    }

    destroy() {
        // if (this.shadowTiles) {
        //     this.shadowTiles.forEach(tile => tile.destroy());
        // }
        if (this.inventoryContainer) {
            this.inventoryContainer.destroy();
        }

        const dragShadow = document.getElementById('drag-shadow');
        if (dragShadow) {
            dragShadow.remove();
        }
    }
}

export default InventoryPrivateSceneHtml;
