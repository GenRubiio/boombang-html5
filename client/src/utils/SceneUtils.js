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

    static moveItem(gameScene, sprite) {
        // Texto fijo en pantalla para Pix: x/y
        const info = gameScene.add.text(10, 10, '', { font: '16px Arial', backgroundColor: '#000000AA' })
            .setScrollFactor(0);

        // Actualiza posición del sprite y del texto
        function updateInfo() {
            // ajustamos profundidad al y actual
            sprite.setDepth(sprite.y);
            info.setText(
                `Pix → x: ${Math.round(sprite.x)}, y: ${Math.round(sprite.y)}`
            );
        }
        updateInfo();

        // Botones para mover en píxeles
        const baseX = 10, baseY = 60, size = 30, pad = 5;
        const botones = [
            { label: '↑', dx: 0, dy: -5, x: baseX + size + pad, y: baseY },
            { label: '↓', dx: 0, dy: +5, x: baseX + size + pad, y: baseY + size * 2 },
            { label: '←', dx: -5, dy: 0, x: baseX, y: baseY + size },
            { label: '→', dx: +5, dy: 0, x: baseX + size * 2 + pad * 2, y: baseY + size }
        ];

        botones.forEach(btn => {
            gameScene.add.text(btn.x, btn.y, btn.label, { font: '20px Arial', backgroundColor: '#555' })
                .setInteractive()
                .setScrollFactor(0)
                .on('pointerdown', () => {
                    sprite.x += btn.dx;
                    sprite.y += btn.dy;
                    updateInfo();
                });
        });
    }
}

export default SceneUtils;
