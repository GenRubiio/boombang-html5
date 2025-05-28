import Phaser from "phaser";
import socket from "../sockets/socket"; // Conexión Socket.io
import asset_shadowImage from "../assets/game/avatar/shadow.png"; // Imagen de la sombra
import asset_tileImage from "../assets/game/scene/tile.png"; // Imagen del suelo
import asset_500oroCatalogImage from "../assets/game/objects/500oroCatalog.png"; // Imagen de objeto para inventario
import SceneRequestSockets from "./sockets/SceneRequestSockets"; // Controladores de sockets
import SceneResponseSockets from "./sockets/SceneResponseSockets"; // Controladores de sockets
import OverheadChatAnimation from "./animations/OverheadChatAnimation"; // Animación de chat
import PublicSceneLoader from "./loaders/PublicSceneLoader"; // Precargador de escena
import CreateSceneController from "./controllers/scene/CreateSceneController"; // Controlador de creación de escena
import RemovePhaserSocketsUtil from "../utils/RemovePhaserSocketsUtil"; // Utilidad para eliminar sockets
import TintManager from "./managers/TintManager"; // Gestor de tintes


export default class PrivateScene extends Phaser.Scene {
    constructor() {
        super("PrivateScene");
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
    }

    preload() {
        PublicSceneLoader.main(this, this.sceneType, true); // Precargar imágenes específicas de la sala
        this.load.image("tile", asset_tileImage);
        this.load.image("shadow", asset_shadowImage);
        // Cargar sprite de objeto para inventario
        this.load.image("500oroCatalog", asset_500oroCatalogImage);
    }

    create() {
        this.tintMgr = new TintManager(this);
        this.scene.pauseOnBlur = false;
        this.scene.pauseOnHide = false;
        this.input.enabled = true;
        this.input.topOnly = false;

        SceneRequestSockets.main(this); // Solicitar datos iniciales de la sala
        SceneResponseSockets.main(this); // Inicializar controladores de sockets

        PublicSceneLoader.main(this, this.sceneData.scenery.type, false);
        CreateSceneController.main(this, this.sceneData); // Crear escena con jugadores
        this.vueComponent.$emit("updateLoading", false);
        // Inicializar inventario y arrastrar/soltar objetos
        this.createInventory();

        this.chatManager = new OverheadChatAnimation(this);

        this.events.on('shutdown', this.shutdown, this);
        this.events.on('destroy', this.destroy, this);
        this.scene.pauseOnBlur = false;
        this.scene.pauseOnHide = false;
    }

    shutdown() {
        //console.log("Shutting down scene with exclusion lists.");

        RemovePhaserSocketsUtil.main(socket); // Eliminar eventos de socket

        if (this.chatManager) {
            this.chatManager.destroy();
            this.chatManager = null;
        }
    }

    destroy() {
        this.shutdown();
    }
    /**
     * Crear inventario y habilitar arrastrar y soltar objetos sobre la cuadrícula
     */
    createInventory() {
        const tileWidth = 65;
        const tileHeight = 33;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;
        const centerX = this.scale.width / 2;
        const rows = this.sceneData.scenery.map_rows;
        const cols = this.sceneData.scenery.map_cols;

        // Inicializar ocupación de tiles
        this.tiles.forEach(row => row.forEach(tile => tile.occupied = false));

        // Polígono rombo para detección precisa
        const diamond = new Phaser.Geom.Polygon([
            { x: -halfTileWidth, y: 0 },
            { x: 0, y: -halfTileHeight },
            { x: halfTileWidth, y: 0 },
            { x: 0, y: halfTileHeight }
        ]);

        // Dibujar fondo del inventario en esquina superior izquierda (UI fija)
        this.add.rectangle(10, 10, 50, 50, 0x000000, 0.5)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(9999);

        // Sprite de objeto en inventario, draggable
        const invItem = this.add.image(10 + 25, 10 + 25, "500oroCatalog")
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(10000);
        // Hacer el objeto draggable y mostrar cursor de mano
        this.input.setDraggable(invItem);
        invItem.originalX = invItem.x;
        invItem.originalY = invItem.y;

        // Drag events sobre el icono de inventario
        invItem.on('dragstart', (pointer) => {
            invItem.setTint(0xaaaaaa);
        });

        // Durante el drag, el icono sigue al cursor
        invItem.on('drag', (pointer, dragX, dragY) => {
            invItem.x = dragX;
            invItem.y = dragY;
        });

        // Al soltar, colocar en el mapa o devolver al inventario
        invItem.on('dragend', (pointer) => {
            invItem.clearTint();
            const mx = pointer.worldX;
            const my = pointer.worldY;
            const colFloat = ((mx - centerX) / halfTileWidth + my / halfTileHeight) / 2;
            const rowFloat = (my / halfTileHeight - (mx - centerX) / halfTileWidth) / 2;
            const col = Math.round(colFloat);
            const row = Math.round(rowFloat);
            if (col < 0 || col >= cols || row < 0 || row >= rows) {
                invItem.x = invItem.originalX;
                invItem.y = invItem.originalY;
                return;
            }
            const tileCenterX = (col - row) * halfTileWidth + centerX;
            const tileCenterY = (col + row) * halfTileHeight;
            const localX = mx - tileCenterX;
            const localY = my - tileCenterY;
            if (!Phaser.Geom.Polygon.Contains(diamond, localX, localY)) {
                invItem.x = invItem.originalX;
                invItem.y = invItem.originalY;
                return;
            }
            const tile = this.tiles[row][col];
            if (!tile.isClickable || tile.occupied) {
                invItem.x = invItem.originalX;
                invItem.y = invItem.originalY;
                return;
            }
            tile.occupied = true;
            this.add.image(tileCenterX, tileCenterY, "500oroCatalog")
                .setOrigin(0.5, 1)
                .setDepth(tileCenterY);
            invItem.destroy();
        });
    }
}
