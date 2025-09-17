class SceneUtils {
    static loadNpc(col, row, gameScene, name, npcId) {
        const tileWidth = 65 * 2;
        const tileHeight = 33 * 2;
        const halfTileWidth = tileWidth / 2;
        const halfTileHeight = tileHeight / 2;
        const centerX = gameScene.scale.width / 2;

        const x = (col - row) * halfTileWidth + centerX + 40 * 2;
        const y = (col + row) * halfTileHeight + 253 * 2;

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

    /**
    * Detectar si un archivo es un video por su extensión
    */
    static isVideoFile(src) {
        if (!src) return false;
        const videoExtensions = ['.webm', '.mp4', '.ogg', '.mov'];
        const extension = src.toLowerCase().substring(src.lastIndexOf('.'));
        return videoExtensions.includes(extension);
    }

    static moveItem(gameScene, sprite) {
        // Texto fijo en pantalla para Pix: x/y
        const info = gameScene.add.text(10, 10, '', { font: '16px Arial', backgroundColor: '#000000AA' })
            .setScrollFactor(0)
            .setDepth(9999);

        let currentDepth = Number(sprite.depth); // Profundidad actual del sprite

        // Actualiza posición del sprite y del texto
        function updateInfo() {
            // La profundidad no cambia automáticamente con Y
            info.setText(
                `Pix → x: ${Math.round(sprite.x)}, y: ${Math.round(sprite.y)}\n` +
                `Depth: ${currentDepth}`
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
                    sprite.x = Number(sprite.x) + btn.dx;
                    sprite.y = Number(sprite.y) + btn.dy;
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
                    currentDepth = Number(currentDepth) + btn.delta;
                    sprite.setDepth(currentDepth);
                    updateInfo();
                });
        });

        // Limpiar event listeners previos para evitar duplicados
        gameScene.input.keyboard.removeAllListeners('keydown');

        gameScene.input.keyboard.on('keydown', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    sprite.y = Number(sprite.y) - 1;
                    break;
                case 'ArrowDown':
                    sprite.y = Number(sprite.y) + 1;
                    break;
                case 'ArrowLeft':
                    sprite.x = Number(sprite.x) - 1;
                    break;
                case 'ArrowRight':
                    sprite.x = Number(sprite.x) + 1;
                    break;
                case '+':
                    currentDepth = Number(currentDepth) + 1;
                    sprite.setDepth(currentDepth);
                    break;
                case '-':
                    currentDepth = Number(currentDepth) - 1;
                    sprite.setDepth(currentDepth);
                    break;
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

    /**
     * Public Scene unified controller: builds a dropdown to pick which sprite to control
     * among those marked with show_controller=Yes in the API.
     */
    static setupPublicMoveController(gameScene) {
        // Ensure there are items registered and that there is more than one to justify a dropdown
        if (!gameScene.activeItems || gameScene.activeItems.size < 2) return;

        // Create UI container with dropdown and arrow/depth buttons
        const names = Array.from(gameScene.activeItems.keys());
        const uiHTML = `
            <div id="public-scene-controller" style="position: fixed; top: 10px; left: 70px; z-index: 10002; font-family: Arial, sans-serif; font-size: 14px; color: white; pointer-events: auto;">
                <div style="display:flex; align-items:center; gap:6px;">
                    <label style="margin-right: 6px;">Controller:</label>
                    <select id="public-controller-select" style="padding: 2px;">
                        <option value="">Select object</option>
                        ${names.map(n => `<option value="${n}">${n}</option>`).join('')}
                    </select>
                </div>
                <div style="margin-top:8px; display:inline-block;">
                    <div style="display:flex; justify-content:center; gap:6px; margin-bottom:4px;">
                        <button data-move="up" style="width:30px; height:30px;">↑</button>
                    </div>
                    <div style="display:flex; justify-content:center; gap:6px;">
                        <button data-move="left" style="width:30px; height:30px;">←</button>
                        <button data-move="down" style="width:30px; height:30px;">↓</button>
                        <button data-move="right" style="width:30px; height:30px;">→</button>
                    </div>
                    <div style="display:flex; justify-content:center; gap:6px; margin-top:6px;">
                        <button data-depth="plus" style="width:30px; height:30px;">+</button>
                        <button data-depth="minus" style="width:30px; height:30px;">−</button>
                    </div>
                </div>
            </div>
        `;

        const uiElement = gameScene.add.dom(0, 0).createFromHTML(uiHTML);
        uiElement.setOrigin(0, 0);
        uiElement.setScrollFactor(0);
        uiElement.setDepth(10000);

        // On-screen info text
        const infoText = gameScene.add.text(10, 120, 'Select object', {
            font: '16px Arial',
            backgroundColor: '#000000AA',
            color: '#ffffff',
        }).setDepth(10000).setScrollFactor(0);

        const dropdown = uiElement.node.querySelector('#public-controller-select');
        // Make dropdown not focusable via keyboard (but still clickable)
        if (dropdown) {
            dropdown.setAttribute('tabindex', '-1');
            // Prevent arrow keys and +/- from changing the selection when dropdown has focus
            dropdown.addEventListener('keydown', (ev) => {
                const blockedKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','+','-','=', '_','PageUp','PageDown','Home','End'];
                if (blockedKeys.includes(ev.key)) {
                    ev.preventDefault();
                }
            });
            // Hide visual focus ring to avoid the feeling of taking focus
            dropdown.style.outline = 'none';
            dropdown.addEventListener('focus', () => {
                dropdown.style.outline = 'none';
            });
        }

        // Stop propagation so clicks on the DOM UI don't interfere with scene input
        const containerNode = uiElement.node;
        const stopPropagation = (ev) => ev.stopPropagation();
        ['pointerdown','mousedown','touchstart','click'].forEach(evt => containerNode.addEventListener(evt, stopPropagation));

        const updateInfo = (sprite) => {
            if (!sprite) {
                infoText.setText('Select object');
                return;
            }
            infoText.setText(`Sprite: ${sprite.name}\nX: ${Math.round(sprite.x)}, Y: ${Math.round(sprite.y)}\nDepth: ${Math.round(sprite.depth)}`);
        };

        const focusCanvas = () => {
            const canvas = gameScene.game && gameScene.game.canvas ? gameScene.game.canvas : null;
            if (canvas) {
                if (!canvas.hasAttribute('tabindex')) {
                    canvas.setAttribute('tabindex', '-1');
                }
                try { canvas.focus(); } catch {}
            }
        };

        if (dropdown) {
            dropdown.addEventListener('change', (e) => {
                const selectedName = e.target.value;
                gameScene.selectedSprite = selectedName ? gameScene.activeItems.get(selectedName) : null;
                updateInfo(gameScene.selectedSprite);
                // Blur dropdown and focus canvas so arrow keys are ready
                try { dropdown.blur(); } catch {}
                focusCanvas();
            });
        }

        // Button controls for currently selected sprite
        const moveButtons = containerNode.querySelectorAll('button[data-move]');
        moveButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dir = btn.getAttribute('data-move');
                const sprite = gameScene.selectedSprite;
                if (!sprite) return;
                switch (dir) {
                    case 'up': sprite.y = Number(sprite.y) - 1; break;
                    case 'down': sprite.y = Number(sprite.y) + 1; break;
                    case 'left': sprite.x = Number(sprite.x) - 1; break;
                    case 'right': sprite.x = Number(sprite.x) + 1; break;
                }
                updateInfo(sprite);
                focusCanvas();
            });
        });

        const depthButtons = containerNode.querySelectorAll('button[data-depth]');
        depthButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-depth');
                const sprite = gameScene.selectedSprite;
                if (!sprite) return;
                if (action === 'plus') sprite.setDepth(Number(sprite.depth) + 1);
                if (action === 'minus') sprite.setDepth(Number(sprite.depth) - 1);
                updateInfo(sprite);
                focusCanvas();
            });
        });

        // Keyboard controls for currently selected sprite
        const keydownHandler = (event) => {
            const sprite = gameScene.selectedSprite;
            if (!sprite) return;
            switch (event.key) {
                case 'ArrowUp': sprite.y = Number(sprite.y) - 1; break;
                case 'ArrowDown': sprite.y = Number(sprite.y) + 1; break;
                case 'ArrowLeft': sprite.x = Number(sprite.x) - 1; break;
                case 'ArrowRight': sprite.x = Number(sprite.x) + 1; break;
                case '+': sprite.setDepth(Number(sprite.depth) + 1); break;
                case '-': sprite.setDepth(Number(sprite.depth) - 1); break;
                default: return;
            }
            updateInfo(sprite);
        };

        // Avoid stacking multiple listeners
        // Note: do not remove all listeners globally to not affect other systems
        gameScene.input.keyboard.on('keydown', keydownHandler);

        // Cleanup on shutdown
        gameScene.events.on('shutdown', () => {
            try { gameScene.input.keyboard.off('keydown', keydownHandler); } catch {}
            uiElement.destroy();
            infoText.destroy();
        });
    }
}

export default SceneUtils;
