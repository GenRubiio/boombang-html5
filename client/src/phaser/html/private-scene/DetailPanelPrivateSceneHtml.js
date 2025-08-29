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
                position: fixed;
                right: -496px;
                bottom: -258px;
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

                <!-- Delete button -->
                <div style="
                    display: flex;
                    justify-content: flex-start;
                ">
                    <button id="detail-delete-btn" style="
                        background: #ff0000;
                        border: none;
                        border-radius: 4px;
                        color: white;
                        cursor: pointer;
                        font-size: 12px;
                        padding: 4px 8px;
                        width: ${BTN_W}px;
                        height: ${BTN_H}px;
                    ">${i18n.global.t('common.delete')}</button>
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

        this.setupEventListeners();
    }

    setupEventListeners() {
        const container = this.detailContainer.node;

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
            this.removeSelectedObject();
        });
    }

    show(item) {
        if (this.scene.htmlInventory && this.scene.htmlInventory.isVisible) {
            this.scene.htmlInventory.hide();
        }
        this.currentItem = item;
        
        const container = this.detailContainer.node.querySelector('#html-detail-panel');
        const nameElement = this.detailContainer.node.querySelector('#detail-item-name');
        const iconElement = this.detailContainer.node.querySelector('#detail-item-icon');
        
        if (container && nameElement && iconElement) {
            // Update content
            nameElement.textContent = item.display_name;
            let imageSrc = import.meta.env.VITE_APP_ENV == 'local' ? item.image : item.image_url;
            iconElement.src = imageSrc;

            // Show panel
            container.style.display = 'block';
            this.isVisible = true;
        } else {
            console.error('HTML detail panel elements not found');
        }
    }

    hide() {
        const container = this.detailContainer.node.querySelector('#html-detail-panel');
        if (container) {
            container.style.display = 'none';
            this.isVisible = false;
            this.currentItem = null;
        }
        
        // Also call the scene's deselect method to clean up selection
        this.scene.deselectObject();
    }

    removeSelectedObject() {
        if (!this.currentItem || !this.scene.selectedObject) return;

        // Emit socket event to remove the object
        socket.emit(RequestSocketsEnum.SCENE_REMOVE_ITEM, {
            user_catalog_item_id: this.currentItem.id
        });

        // Hide the panel
        this.hide();
    }

    destroy() {
        if (this.detailContainer) {
            this.detailContainer.destroy();
        }
    }
}

export default DetailPanelPrivateSceneHtml;
