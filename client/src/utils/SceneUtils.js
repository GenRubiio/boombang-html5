class SceneUtils {
    static loadNpc(col, row, gameScene, name, npcId) {
        const tileWidth = 65;
        const tileHeight = 33;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;
        const centerX = gameScene.scale.width / 2;
        
        const x = (col - row) * halfTileWidth + centerX + 40;
        const y = (col + row) * halfTileHeight + 253;

        const npc = gameScene.add.image(x, y, name);
        npc.setOrigin(0.5, 1);
        npc.setDepth(y);

        npc.setInteractive({
            cursor: 'pointer',
            pixelPerfect: true  // opcional, si tu sprite tiene transparencias
        });

        // 3) Detectar clic y llamar al método de Vue
        npc.on("pointerdown", () => {
            // Llama a openNpcModal() que definiremos en el componente Vue
            gameScene.vueComponent.openNpcModal(npcId);
        });
    }
}

export default SceneUtils;
