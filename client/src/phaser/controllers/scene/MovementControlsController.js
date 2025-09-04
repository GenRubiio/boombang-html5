class MovementControlsController {
    static createMovementControls(gameScene, spriteAvatar, animation) {
        spriteAvatar.setPosition(0, 0);
        spriteAvatar.play(animation);
        // Crear contenedor para los controles
        const controlsContainer = gameScene.add.container(50, 0);
        controlsContainer.setDepth(1000); // Asegurar que esté por encima de todo

        // Posición base para los controles (esquina superior izquierda)
        const baseX = 50;
        const baseY = 50;
        const buttonSize = 40;
        const spacing = 50;

        // Crear label de posición en el centro
        const positionLabel = gameScene.add.text(baseX + spacing, baseY + spacing,
            `X: ${Math.round(spriteAvatar.x)}, Y: ${Math.round(spriteAvatar.y)}`, {
            fontSize: "14px",
            color: "#ffffff",
            fontFamily: "Arial",
            backgroundColor: "#000000",
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5, 0.5);

        // Función para actualizar la posición del label
        const updatePositionLabel = () => {
            positionLabel.setText(`X: ${Math.round(spriteAvatar.x)}, Y: ${Math.round(spriteAvatar.y)}`);
        };

        // Crear botón arriba
        const upButton = gameScene.add.graphics()
            .fillStyle(0x4CAF50)
            .fillRoundedRect(0, 0, buttonSize, buttonSize, 8)
            .setPosition(baseX + spacing - buttonSize / 2, baseY - buttonSize / 2)
            .setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains);

        const upText = gameScene.add.text(baseX + spacing, baseY, "↑", {
            fontSize: "20px",
            color: "#ffffff",
            fontFamily: "Arial"
        }).setOrigin(0.5, 0.5);

        // Crear botón abajo
        const downButton = gameScene.add.graphics()
            .fillStyle(0x4CAF50)
            .fillRoundedRect(0, 0, buttonSize, buttonSize, 8)
            .setPosition(baseX + spacing - buttonSize / 2, baseY + spacing + buttonSize / 2)
            .setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains);

        const downText = gameScene.add.text(baseX + spacing, baseY + spacing + buttonSize, "↓", {
            fontSize: "20px",
            color: "#ffffff",
            fontFamily: "Arial"
        }).setOrigin(0.5, 0.5);

        // Crear botón izquierda
        const leftButton = gameScene.add.graphics()
            .fillStyle(0x4CAF50)
            .fillRoundedRect(0, 0, buttonSize, buttonSize, 8)
            .setPosition(baseX - buttonSize / 2, baseY + spacing - buttonSize / 2)
            .setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains);

        const leftText = gameScene.add.text(baseX, baseY + spacing, "←", {
            fontSize: "20px",
            color: "#ffffff",
            fontFamily: "Arial"
        }).setOrigin(0.5, 0.5);

        // Crear botón derecha
        const rightButton = gameScene.add.graphics()
            .fillStyle(0x4CAF50)
            .fillRoundedRect(0, 0, buttonSize, buttonSize, 8)
            .setPosition(baseX + spacing * 2 - buttonSize / 2, baseY + spacing - buttonSize / 2)
            .setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains);

        const rightText = gameScene.add.text(baseX + spacing * 2, baseY + spacing, "→", {
            fontSize: "20px",
            color: "#ffffff",
            fontFamily: "Arial"
        }).setOrigin(0.5, 0.5);

        // Velocidad de movimiento
        const moveSpeed = 1;

        // Event listeners para los botones
        upButton.on('pointerdown', () => {
            spriteAvatar.y -= moveSpeed;
            updatePositionLabel();
        });

        downButton.on('pointerdown', () => {
            spriteAvatar.y += moveSpeed;
            updatePositionLabel();
        });

        leftButton.on('pointerdown', () => {
            spriteAvatar.x -= moveSpeed;
            updatePositionLabel();
        });

        rightButton.on('pointerdown', () => {
            spriteAvatar.x += moveSpeed;
            updatePositionLabel();
        });

        // Configurar controles de teclado
        const cursors = gameScene.input.keyboard.createCursorKeys();

        // Función para manejar el movimiento con teclado
        const handleKeyboardMovement = () => {
            let moved = false;

            if (cursors.left.isDown) {
                spriteAvatar.x -= moveSpeed;
                moved = true;
            }
            if (cursors.right.isDown) {
                spriteAvatar.x += moveSpeed;
                moved = true;
            }
            if (cursors.up.isDown) {
                spriteAvatar.y -= moveSpeed;
                moved = true;
            }
            if (cursors.down.isDown) {
                spriteAvatar.y += moveSpeed;
                moved = true;
            }

            if (moved) {
                updatePositionLabel();
            }
        };

        // Agregar el listener de update a la escena
        gameScene.keyboardMovementHandler = handleKeyboardMovement;
        gameScene.events.on('update', handleKeyboardMovement);

        // Efectos hover para los botones
        const addHoverEffects = (button) => {
            button.on('pointerover', () => {
                button.clear();
                button.fillStyle(0x66BB6A);
                button.fillRoundedRect(0, 0, buttonSize, buttonSize, 8);
            });

            button.on('pointerout', () => {
                button.clear();
                button.fillStyle(0x4CAF50);
                button.fillRoundedRect(0, 0, buttonSize, buttonSize, 8);
            });
        };

        addHoverEffects(upButton);
        addHoverEffects(downButton);
        addHoverEffects(leftButton);
        addHoverEffects(rightButton);

        // Crear botón Save
        const saveButton = gameScene.add.graphics()
            .fillStyle(0xFF5722)
            .fillRoundedRect(0, 0, 80, buttonSize, 8)
            .setPosition(baseX + spacing - 40, baseY + spacing * 2 + buttonSize / 2)
            .setInteractive(new Phaser.Geom.Rectangle(0, 0, 80, buttonSize), Phaser.Geom.Rectangle.Contains);

        const saveText = gameScene.add.text(baseX + spacing, baseY + spacing * 2 + buttonSize, "Save", {
            fontSize: "16px",
            color: "#ffffff",
            fontFamily: "Arial"
        }).setOrigin(0.5, 0.5);

        // Event listener para el botón Save
        saveButton.on('pointerdown', async () => {
            const currentAnimation = spriteAvatar.anims.currentAnim ? spriteAvatar.anims.currentAnim.key : 'No animation';
            const position = {
                x: Math.round(spriteAvatar.x),
                y: Math.round(spriteAvatar.y)
            };
            const animationSprite = currentAnimation.substring(2);

            try {
                // Leer el archivo config.json
                const response = await fetch('/src/assets/game/avatars/gata/config.json');
                const configData = await response.json();

                // Buscar la animación por key
                if (configData[animationSprite]) {
                    // Modificar positionX y positionY
                    configData[animationSprite].positionX = position.x;
                    configData[animationSprite].positionY = position.y;

                    console.log(`Animación ${animationSprite} actualizada:`, {
                        positionX: position.x,
                        positionY: position.y
                    });

                    // Crear y descargar el archivo JSON modificado
                    const jsonString = JSON.stringify(configData, null, 4);
                    const blob = new Blob([jsonString], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);

                    // Crear elemento de descarga
                    const downloadLink = document.createElement('a');
                    downloadLink.href = url;
                    downloadLink.download = 'config.json';
                    downloadLink.style.display = 'none';

                    // Agregar al DOM, hacer clic y remover
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);

                    // Limpiar URL del blob
                    URL.revokeObjectURL(url);

                    // Mostrar confirmación
                    alert(`Archivo config.json descargado con posición actualizada para ${animationSprite}: X=${position.x}, Y=${position.y}`);
                } else {
                    console.warn(`Animación ${animationSprite} no encontrada en config.json`);
                    alert(`Animación ${animationSprite} no encontrada en la configuración`);
                }
            } catch (error) {
                console.error('Error al procesar el archivo config.json:', error);
                alert('Error al acceder al archivo de configuración');
            }
        });

        // Efectos hover para el botón Save
        saveButton.on('pointerover', () => {
            saveButton.clear();
            saveButton.fillStyle(0xFF7043);
            saveButton.fillRoundedRect(0, 0, 80, buttonSize, 8);
        });

        saveButton.on('pointerout', () => {
            saveButton.clear();
            saveButton.fillStyle(0xFF5722);
            saveButton.fillRoundedRect(0, 0, 80, buttonSize, 8);
        });

        // Añadir todos los elementos al contenedor
        controlsContainer.add([
            upButton, upText,
            downButton, downText,
            leftButton, leftText,
            rightButton, rightText,
            positionLabel,
            saveButton, saveText
        ]);

        // Guardar referencia para poder destruir los controles después
        gameScene.movementControls = controlsContainer;

        return controlsContainer;
    }
}

export default MovementControlsController;
