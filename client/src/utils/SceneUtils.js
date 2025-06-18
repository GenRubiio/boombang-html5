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
            .setScrollFactor(0)
            .setDepth(9999);

        let depthOffset = 0; // Offset para la profundidad del sprite

        // Actualiza posición del sprite y del texto
        function updateInfo() {
            // ajustamos profundidad al y actual
            sprite.setDepth(sprite.y + depthOffset);
            info.setText(
                `Pix → x: ${Math.round(sprite.x)}, y: ${Math.round(sprite.y)}\n` +
                `Depth: ${sprite.y + depthOffset}`
            );
        }
        updateInfo();

        // Botones para mover en píxeles
        const baseX = 10, baseY = 60, size = 30, pad = 5;
        const botones = [
            { label: '↑', dx: 0, dy: -1, x: baseX + size + pad, y: baseY },
            { label: '↓', dx: 0, dy: +1, x: baseX + size + pad, y: baseY + size * 2 },
            { label: '←', dx: -1, dy: 0, x: baseX, y: baseY + size },
            { label: '→', dx: +1, dy: 0, x: baseX + size * 2 + pad * 2, y: baseY + size }
        ];

        botones.forEach(btn => {
            gameScene.add.text(btn.x, btn.y, btn.label, { font: '20px Arial', backgroundColor: '#555' })
                .setInteractive()
                .setScrollFactor(0)
                .setDepth(9999)
                .on('pointerdown', () => {
                    sprite.x += btn.dx;
                    sprite.y += btn.dy;
                    updateInfo();
                });
        });

        const btnsDepth = [
            { label: '+', delta: +1, x: 200, y: 60 },
            { label: '−', delta: -1, x: 200, y: 100 }
        ];
        btnsDepth.forEach(btn => {
            gameScene.add.text(btn.x, btn.y, btn.label, { font: '20px Arial', backgroundColor: '#880' })
                .setInteractive()
                .setScrollFactor(0)
                .setDepth(9999)
                .on('pointerdown', () => {
                    depthOffset += btn.delta;
                    updateInfo();
                });
        });

        gameScene.input.keyboard.on('keydown', (event) => {
            switch (event.key) {
                case 'ArrowUp': sprite.y -= 1; break;
                case 'ArrowDown': sprite.y += 1; break;
                case 'ArrowLeft': sprite.x -= 1; break;
                case 'ArrowRight': sprite.x += 1; break;
                case '+': depthOffset += 1; break;
                case '-': depthOffset -= 1; break;
            }
            updateInfo();
        });
    }
}

export default SceneUtils;
