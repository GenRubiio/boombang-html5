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
import i18n from "../plugins/i18n";


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
        PublicSceneLoader.main(this, this.sceneType, true); // Precargar imágenes específicas de la sala
        this.load.image("tile", asset_tile_image);
        this.load.image("shadow", asset_shadow_image);
        this.load.image("shadow_selected", asset_shadow_selected_image);
        this.load.image("asset_ui_shop_image", asset_ui_shop_image);
        this.load.image("asset_ui_avatars_image", asset_ui_avatars_image);
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

        PublicSceneLoader.main(this, this.sceneData.scenery.type, false);
        CreateSceneController.main(this, this.sceneData); // Crear escena con jugadores
        this.vueComponent.$emit("updateLoading", false);

        this.chatManager = new OverheadChatAnimation(this);

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('destroy', this.destroy, this);
        this.scene.pauseOnBlur = false;
        this.scene.pauseOnHide = false;

        this.createButtons();
    }

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
        const makeButton = (x, iconKey, cb, tip) => {
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
            icon.setScale(Math.min((BUTTON_SIZE - 10) / icon.width,
                (BUTTON_SIZE - 10) / icon.height));

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
                if (import.meta.env.VITE_APP_ENV === "local") {
                    console.log('Botón de tienda pulsado');
                }
            },
            i18n.global.t('scene.tooltip_shop')
        );

        /* --------------------- BOTÓN “AVATARES” --------------------- */
        this.avatarsButton = makeButton(
            START_X + BUTTON_SIZE + BUTTON_SPACING,
            'asset_ui_avatars_image',
            () => {
                if (import.meta.env.VITE_APP_ENV === "local") {
                    console.log('Botón de avatares pulsado');
                }
            },
            i18n.global.t('scene.tooltip_avatars')
        );
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
