import asset_backgroundImage from "../../../assets/game/scenarios/100/background.webp";
import asset_npcImage from "../../../assets/game/npc/wise_ring.webp";

class RingScenePreload {
    static preload(gameScene) {
        gameScene.load.image("background_ring", asset_backgroundImage);
        gameScene.load.image("npc_ring", asset_npcImage);
    }

    static load(gameScene) {
        this.loadBackground(gameScene);
        this.loadNPC(gameScene);
    }

    static loadBackground(gameScene) {
        const background = gameScene.add.image(0, 0, "background_ring").setOrigin(0);
        background.setDisplaySize(gameScene.scale.width, gameScene.scale.height);
    }

    static loadNPC(gameScene) {
        const tileWidth = 65;
        const tileHeight = 33;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;
        const centerX = gameScene.scale.width / 2;

        const col = 8;
        const row = 4;
        const x = (col - row) * halfTileWidth + centerX + 40;
        const y = (col + row) * halfTileHeight + 253;

        const npc = gameScene.add.image(x, y, "npc_ring");
        npc.setOrigin(0.5, 1);
        npc.setDepth(y);

        npc.setInteractive({
            cursor: 'pointer',
            pixelPerfect: true  // opcional, si tu sprite tiene transparencias
        });
        
        // 3) Detectar clic y llamar al método de Vue
        npc.on("pointerdown", () => {
            // Llama a openNpcModal() que definiremos en el componente Vue
            gameScene.vueComponent.openNpcModal(1);
        });
    }
}

export default RingScenePreload;