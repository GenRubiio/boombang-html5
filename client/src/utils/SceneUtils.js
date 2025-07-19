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

    static moveItems(gameScene) {
        const suffix = '_private_scene_' + gameScene.sceneData.scenery.id;
        const sprites = gameScene.children.list.filter(child =>
            child.name && child.name.startsWith('item_') && child.name.endsWith(suffix)
        );

        const infoText = gameScene.add.text(10, 10, 'Select a sprite', {
            font: '16px Arial',
            backgroundColor: '#000000AA',
            color: '#ffffff',
            align: 'left'
        }).setDepth(99999).setScrollFactor(0);

        let uiHTML = `
            <div id="sprite-controller" style="position: absolute; top: 10px; left: 10px; z-index: 100; font-family: Arial, sans-serif; font-size: 14px; color: white;">
                <select id="sprite-selector" style="padding: 2px; margin-top: 60px;">
                    <option value="">Select a sprite</option>
                    ${sprites.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
                </select>
                <div style="margin-top: 10px;">
                    <input type="checkbox" id="show-all-info" style="vertical-align: middle;">
                    <label for="show-all-info" style="vertical-align: middle;">Show All Info</label>
                </div>
                <div id="all-sprites-info" style="position: absolute; top: 120px; left: 0; width: 300px; max-height: 400px; overflow-y: auto; background: rgba(0,0,0,0.6); padding: 5px; display: none;"></div>
            </div>
        `;

        const uiElement = gameScene.add.dom(0, 0).createFromHTML(uiHTML);

        const dropdown = document.getElementById('sprite-selector');
        const showAllCheckbox = document.getElementById('show-all-info');
        const allSpritesInfoDiv = document.getElementById('all-sprites-info');

        if (dropdown) {
            dropdown.addEventListener('change', (event) => {
                const selectedName = event.target.value;
                gameScene.selectedSprite = selectedName ? sprites.find(s => s.name === selectedName) : null;
            });
        }

        if (showAllCheckbox) {
            showAllCheckbox.addEventListener('change', (event) => {
                if (allSpritesInfoDiv) {
                    allSpritesInfoDiv.style.display = event.target.checked ? 'block' : 'none';
                }
            });
        }

        gameScene.input.keyboard.on('keydown', (event) => {
            if (!gameScene.selectedSprite) return;

            const sprite = gameScene.selectedSprite;
            switch (event.key) {
                case 'ArrowUp': sprite.y -= 1; break;
                case 'ArrowDown': sprite.y += 1; break;
                case 'ArrowLeft': sprite.x -= 1; break;
                case 'ArrowRight': sprite.x += 1; break;
                case '+': sprite.depth += 1; break;
                case '-': sprite.depth -= 1; break;
            }
        });

        gameScene.events.on('update', () => {
            // Update info for the selected sprite
            if (gameScene.selectedSprite) {
                const s = gameScene.selectedSprite;
                infoText.setText(
                    `Sprite: ${s.name}\n` +
                    `X: ${Math.round(s.x)}, Y: ${Math.round(s.y)}\n` +
                    `Depth: ${Math.round(s.depth)}`
                );
            } else {
                infoText.setText('Select a sprite');
            }

            // Update info for all sprites if the panel is visible
            if (allSpritesInfoDiv && allSpritesInfoDiv.style.display === 'block') {
                let allInfoHTML = '<ul>';
                sprites.forEach(s => {
                    allInfoHTML += `<li style="margin-bottom: 5px;"><b>${s.name}</b><br>X: ${Math.round(s.x)}, Y: ${Math.round(s.y)}, D: ${Math.round(s.depth)}</li>`;
                });
                allInfoHTML += '</ul>';
                allSpritesInfoDiv.innerHTML = allInfoHTML;
            }
        });

        gameScene.events.on('shutdown', () => {
            uiElement.destroy();
        });
    }
}

export default SceneUtils;
