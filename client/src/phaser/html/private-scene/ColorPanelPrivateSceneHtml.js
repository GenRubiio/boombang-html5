import i18n from "@/plugins/i18n";
import socket from "@/sockets/socket";
import RequestSocketsEnum from "@/enums/RequestSocketsEnum";

class ColorPanelPrivateSceneHtml {
    constructor(scene) {
        this.scene = scene;
        this.colorPanelContainer = null;
        this.isVisible = false;
        this.currentColors = {}; // Colores temporales mientras se edita
        this.originalColors = {}; // Colores originales para restaurar si se cancela
    }

    load() {
        const colors = this.scene.sceneData.scenery.colors || {};
        const defaultColors = this.scene.sceneData.sceneConfig.default_colors || {};
        const assets = this.scene.sceneData.sceneConfig.assets_data?.assets_data_repeatable || [];

        // Identificar qué color_item_keys están disponibles
        const colorKeys = new Set();
        assets.forEach(asset => {
            if (asset.color_item_key) {
                colorKeys.add(asset.color_item_key);
            }
        });

        // Si no hay colores para pintar, retornar vacío
        if (colorKeys.size === 0) {
            return '';
        }

        // Inicializar colores actuales con los guardados o por defecto
        Array.from(colorKeys).forEach(key => {
            this.currentColors[key] = colors[key] || defaultColors[key] || 'ffffff';
            this.originalColors[key] = colors[key] || defaultColors[key] || 'ffffff';
        });

        return `
            <div id="html-color-panel" style="
                position: absolute;
                right: 10px;
                bottom: 72px;
                width: 200px;
                max-height: 294px;
                background: rgba(255, 255, 255, 0.95);
                border: 2px solid #cccccc;
                border-radius: 8px;
                z-index: 10000;
                display: none;
                font-family: Arial, sans-serif;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                overflow-y: auto;
            ">
                <!-- Header with close button -->
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px;
                    border-bottom: 1px solid #ddd;
                    background: rgba(240, 240, 240, 0.9);
                ">
                    <span style="font-weight: bold; font-size: 12px;">${i18n.global.t('scene.color_panel_title') || 'Colorear Escena'}</span>
                    <button id="color-panel-close" style="
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

                <!-- Color pickers container -->
                <div id="color-pickers-container" style="
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                ">
                    ${this.generateColorPickers(colorKeys)}
                </div>

                <!-- Action buttons -->
                <div style="
                    padding: 8px;
                    border-top: 1px solid #ddd;
                    display: flex;
                    justify-content: center;
                    background: rgba(240, 240, 240, 0.9);
                ">
                    <button id="color-panel-save" style="
                        width: 100%;
                        padding: 6px 8px;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: bold;
                    ">${i18n.global.t('scene.color_panel_save') || 'Guardar'}</button>
                </div>
            </div>
        `;
    }

    generateColorPickers(colorKeys) {
        let pickersHTML = '';
        let itemIndex = 1;
        Array.from(colorKeys).forEach(key => {
            const colorValue = this.currentColors[key] || 'ffffff';
            pickersHTML += `
                <div class="color-picker-item" data-color-key="${key}" style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                ">
                    <label style="
                        font-size: 11px;
                        font-weight: bold;
                        color: #333;
                        flex-shrink: 0;
                    ">Item ${itemIndex}</label>

                    <input
                        type="color"
                        class="color-picker-input"
                        data-color-key="${key}"
                        value="#${colorValue}"
                        style="
                            width: 35px;
                            height: 35px;
                            border: 1px solid #ccc;
                            border-radius: 4px;
                            cursor: pointer;
                        "
                    >
                </div>
            `;
            itemIndex++;
        });
        return pickersHTML;
    }

    create() {
        // Verificar si hay colores disponibles
        const assets = this.scene.sceneData.sceneConfig.assets_data?.assets_data_repeatable || [];
        const hasColorableAssets = assets.some(asset => asset.color_item_key);

        if (!hasColorableAssets) {
            // No crear el panel si no hay assets coloreables
            return;
        }

        // Create HTML color panel and add to scene
        const colorPanelHTML = this.load();
        if (!colorPanelHTML) return;

        this.colorPanelContainer = this.scene.add.dom(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2
        ).createFromHTML(colorPanelHTML);

        this.colorPanelContainer.setOrigin(0.5, 0.5);
        this.colorPanelContainer.setScrollFactor(0);
        this.colorPanelContainer.setDepth(10001);

        // Guardar referencia al contenedor antes de moverlo
        this.htmlColorPanelElement = this.colorPanelContainer.node.querySelector('#html-color-panel');

        // Mover el elemento al contenedor game-container
        this.moveToGameContainer();

        this.setupEventListeners();
    }

    moveToGameContainer() {
        const gameContainer = document.querySelector('.game-container');

        if (gameContainer && this.htmlColorPanelElement) {
            gameContainer.appendChild(this.htmlColorPanelElement);
        }
    }

    setupEventListeners() {
        if (!this.htmlColorPanelElement) return;

        const container = this.htmlColorPanelElement;

        // Detener la propagación de eventos
        const stopPropagation = (event) => event.stopPropagation();
        container.addEventListener('pointerdown', stopPropagation);
        container.addEventListener('mousedown', stopPropagation);
        container.addEventListener('touchstart', stopPropagation);

        // Close button
        const closeBtn = container.querySelector('#color-panel-close');
        closeBtn.addEventListener('click', () => {
            this.restoreOriginalColors();
            this.hide();
        });

        // Save button
        const saveBtn = container.querySelector('#color-panel-save');
        saveBtn.addEventListener('click', () => {
            this.saveColors();
        });

        // Color picker inputs
        const colorInputs = container.querySelectorAll('.color-picker-input');
        colorInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const key = e.target.getAttribute('data-color-key');
                const hexValue = e.target.value.replace('#', '');
                this.updateColor(key, hexValue);
            });
        });

    }

    updateColor(key, hexValue) {
        // Actualizar el color temporal
        this.currentColors[key] = hexValue;

        // Sincronizar el input de color
        const container = this.htmlColorPanelElement;
        const colorInput = container.querySelector(`.color-picker-input[data-color-key="${key}"]`);

        if (colorInput) {
            colorInput.value = '#' + hexValue;
        }

        // Aplicar el color en tiempo real a la escena
        this.applyColorToScene(key, hexValue);
    }

    applyColorToScene(key, hexValue) {
        const sceneId = this.scene.sceneData.scenery.id;
        const assets = this.scene.sceneData.sceneConfig.assets_data?.assets_data_repeatable || [];

        // Recorrer los assets y aplicar el color a los que correspondan
        assets.forEach((asset, index) => {
            if (asset.color_item_key === key) {
                const spriteName = 'private_scene_' + sceneId + '_item_' + index;
                const sprite = this.scene.children.getByName(spriteName);

                if (sprite) {
                    const tint = parseInt(hexValue, 16);
                    sprite.clearTint();
                    sprite.setBlendMode(Phaser.BlendModes.NORMAL);
                    sprite.setTint(tint);
                }
            }
        });
    }

    restoreOriginalColors() {
        // Restaurar todos los colores originales
        Object.keys(this.originalColors).forEach(key => {
            this.applyColorToScene(key, this.originalColors[key]);
            this.currentColors[key] = this.originalColors[key];
        });
    }

    saveColors() {
        const sceneId = this.scene.sceneData.scenery.id;

        // Enviar los colores al servidor mediante socket
        socket.emit(RequestSocketsEnum.UPDATE_PRIVATE_SCENE_COLORS, {
            sceneId: sceneId,
            colors: this.currentColors
        });

        // Actualizar los colores originales con los guardados
        this.originalColors = { ...this.currentColors };

        // Actualizar también en los datos de la escena
        this.scene.sceneData.scenery.colors = { ...this.currentColors };

        // Cerrar el panel
        this.hide();
    }

    show() {
        // Cerrar otros paneles antes de abrir el panel de coloración
        if (this.scene.htmlInventory && this.scene.htmlInventory.isVisible) {
            this.scene.htmlInventory.hide();
        }
        if (this.scene.htmlDetailPanel && this.scene.htmlDetailPanel.isVisible) {
            this.scene.htmlDetailPanel.hide();
        }

        if (this.htmlColorPanelElement) {
            // Resetear los colores temporales a los guardados actualmente
            const colors = this.scene.sceneData.scenery.colors || {};
            const defaultColors = this.scene.sceneData.sceneConfig.default_colors || {};

            Object.keys(this.currentColors).forEach(key => {
                const savedColor = colors[key] || defaultColors[key] || 'ffffff';
                this.currentColors[key] = savedColor;
                this.originalColors[key] = savedColor;

                // Actualizar el input de color
                const container = this.htmlColorPanelElement;
                const colorInput = container.querySelector(`.color-picker-input[data-color-key="${key}"]`);

                if (colorInput) colorInput.value = '#' + savedColor;
            });

            this.htmlColorPanelElement.style.display = 'block';
            this.isVisible = true;
        }
    }

    hide() {
        if (this.htmlColorPanelElement) {
            this.htmlColorPanelElement.style.display = 'none';
            this.isVisible = false;
        }
    }

    toggle() {
        if (this.isVisible) {
            this.restoreOriginalColors();
            this.hide();
        } else {
            this.show();
        }
    }

    destroy() {
        if (this.colorPanelContainer) {
            this.colorPanelContainer.destroy();
        }

        if (this.htmlColorPanelElement && this.htmlColorPanelElement.parentNode) {
            this.htmlColorPanelElement.parentNode.removeChild(this.htmlColorPanelElement);
        }
    }
}

export default ColorPanelPrivateSceneHtml;
