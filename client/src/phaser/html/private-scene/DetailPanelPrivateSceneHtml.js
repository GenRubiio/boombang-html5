import i18n from "@/plugins/i18n";
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";

class DetailPanelPrivateSceneHtml {
    constructor(scene) {
        this.scene = scene;
        this.detailContainer = null;
        this.currentItem = null;
        this.isVisible = false;
    }

    load() {
        const PAD = 10;
        const ICON_SIZE = 100;
        const SLOT_SIZE = 60;
        const SLOT_PAD = 5;
        const INV_NAV_H = 30;
        const PANEL_W = SLOT_SIZE * 3 + SLOT_PAD * 4;
        const PANEL_H = SLOT_SIZE * 3 + SLOT_PAD * 4 + INV_NAV_H + SLOT_PAD;
        const BTN_W = 60;
        const BTN_H = 25;

        return `
            <div id="html-detail-panel" style="
                position: absolute;
                right: 10px;
                bottom: 72px;
                width: 179px;
                height: 272px;
                background: rgba(255, 255, 255, 0.9);
                border: 2px solid #cccccc;
                border-radius: 8px;
                z-index: 10000;
                display: none;
                font-family: Arial, sans-serif;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                padding: ${PAD}px;
            ">
                <!-- Header with close button -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: ${PAD}px;
                ">
                    <span id="detail-item-name" style="
                        font-weight: bold; 
                        font-size: 14px;
                        color: #000;
                    "></span>
                    <button id="detail-close" style="
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

                <!-- Item icon -->
                <div style="
                    display: flex;
                    justify-content: center;
                    margin-bottom: ${PAD}px;
                    width: 180px;
                    height: 190px;
                ">
                    <img id="detail-item-icon" style="
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                    ">
                </div>

                <!-- Action buttons -->
                <div style="
                    display: flex;
                    justify-content: flex-start;
                    gap: 8px;
                ">
                    <button id="detail-delete-btn" style="
                        background: #ff4444;
                        border: none;
                        border-radius: 4px;
                        color: white;
                        cursor: pointer;
                        font-size: 16px;
                        padding: 4px;
                        width: ${BTN_W}px;
                        height: ${BTN_H}px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">🗑️</button>
                    <button id="detail-rotate-btn" style="
                        background: #4CAF50;
                        border: none;
                        border-radius: 4px;
                        color: white;
                        cursor: pointer;
                        font-size: 16px;
                        padding: 4px;
                        width: ${BTN_W}px;
                        height: ${BTN_H}px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">🔄</button>
                </div>
            </div>
        `;
    }

    create() {
        // Create HTML detail panel and add to scene
        const detailHTML = this.load();
        this.detailContainer = this.scene.add.dom(this.scene.scale.width / 2, this.scene.scale.height / 2).createFromHTML(detailHTML);
        this.detailContainer.setOrigin(0.5, 0.5);
        this.detailContainer.setScrollFactor(0);
        this.detailContainer.setDepth(10000);

        // Guardar referencia al contenedor antes de moverlo
        this.htmlDetailPanelElement = this.detailContainer.node.querySelector('#html-detail-panel');

        // Mover el elemento al contenedor game-container para que aparezca por encima del chat
        this.moveToGameContainer();

        this.setupEventListeners();
    }

    moveToGameContainer() {
        const gameContainer = document.querySelector('.game-container');

        if (gameContainer && this.htmlDetailPanelElement) {
            gameContainer.appendChild(this.htmlDetailPanelElement);
        }
    }

    setupEventListeners() {
        const container = this.htmlDetailPanelElement;

        // Detener la propagación de eventos para que no interfieran con la escena de Phaser
        const stopPropagation = (event) => event.stopPropagation();
        container.addEventListener('pointerdown', stopPropagation);
        container.addEventListener('mousedown', stopPropagation);
        container.addEventListener('touchstart', stopPropagation);

        // Close button
        const closeBtn = container.querySelector('#detail-close');
        closeBtn.addEventListener('click', () => this.hide());

        // Delete button
        const deleteBtn = container.querySelector('#detail-delete-btn');
        deleteBtn.addEventListener('click', (event) => {
            event.preventDefault();
            if (!deleteBtn.disabled) {
                this.removeSelectedObject();
            }
        });

        // Rotate button
        const rotateBtn = container.querySelector('#detail-rotate-btn');
        rotateBtn.addEventListener('click', (event) => {
            event.preventDefault();
            if (!rotateBtn.disabled) {
                this.rotateSelectedObject();
            }
        });
    }

    show(item) {
        // Cerrar otros paneles antes de abrir el panel de detalles
        if (this.scene.htmlInventory && this.scene.htmlInventory.isVisible) {
            this.scene.htmlInventory.hide();
        }
        if (this.scene.htmlColorPanel && this.scene.htmlColorPanel.isVisible) {
            this.scene.htmlColorPanel.hide();
        }

        this.currentItem = item;

        const nameElement = this.htmlDetailPanelElement.querySelector('#detail-item-name');
        const iconElement = this.htmlDetailPanelElement.querySelector('#detail-item-icon');

        if (this.htmlDetailPanelElement && nameElement && iconElement) {
            // Update content
            nameElement.textContent = item.display_name;
            let imageSrc = import.meta.env.VITE_APP_ENV == 'local' ? item.image : item.image_url;
            iconElement.src = imageSrc;

            // Show panel
            this.htmlDetailPanelElement.style.display = 'block';
            this.isVisible = true;
        } else {
            console.error('HTML detail panel elements not found');
        }
    }

    hide() {
        if (this.htmlDetailPanelElement) {
            this.htmlDetailPanelElement.style.display = 'none';
            this.isVisible = false;
            this.currentItem = null;
        }

        // Also call the scene's deselect method to clean up selection
        this.scene.deselectObject();
    }

    disableButtons() {
        const deleteBtn = this.htmlDetailPanelElement.querySelector('#detail-delete-btn');
        const rotateBtn = this.htmlDetailPanelElement.querySelector('#detail-rotate-btn');

        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.style.opacity = '0.5';
            deleteBtn.style.cursor = 'not-allowed';
        }
        if (rotateBtn) {
            rotateBtn.disabled = true;
            rotateBtn.style.opacity = '0.5';
            rotateBtn.style.cursor = 'not-allowed';
        }
    }

    enableButtons() {
        const deleteBtn = this.htmlDetailPanelElement.querySelector('#detail-delete-btn');
        const rotateBtn = this.htmlDetailPanelElement.querySelector('#detail-rotate-btn');
        
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.style.opacity = '1';
            deleteBtn.style.cursor = 'pointer';
        }
        if (rotateBtn) {
            rotateBtn.disabled = false;
            rotateBtn.style.opacity = '1';
            rotateBtn.style.cursor = 'pointer';
        }
    }

    removeSelectedObject() {
        if (!this.currentItem || !this.scene.selectedObject) return;

        // Disable buttons to prevent spam
        this.disableButtons();

        // Emit socket event to remove the object
        socket.emit(RequestSocketsEnum.SCENE_REMOVE_ITEM, {
            user_catalog_item_id: this.currentItem.id
        });

        // Hide the panel
        this.hide();
    }

    rotateSelectedObject() {
        if (!this.currentItem || !this.scene.selectedObject) return;

        // Disable buttons to prevent spam
        this.disableButtons();

        // Emit socket event to rotate the object
        socket.emit(RequestSocketsEnum.ROTATE_OBJECT, {
            user_catalog_item_id: this.currentItem.id
        });

        // Don't hide the panel, wait for server response
        // The object will rotate when server confirms via socket response
        // Buttons will be re-enabled when server response arrives
    }

    destroy() {
        if (this.detailContainer) {
            this.detailContainer.destroy();
        }
    }
}

export default DetailPanelPrivateSceneHtml;
