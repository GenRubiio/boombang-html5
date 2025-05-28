class AvatarPositionSpriteModal {
    static main(gameScene, spriteAvatar) {
        const controlX = 100;
        const controlY = 100;
        const delta = 1; // Incremento para mover el sprite; ajústalo según necesites

        // Texto para mostrar la posición actual del spriteAvatar
        const positionDisplay = gameScene.add.text(controlX, controlY, 
            `Position: (${spriteAvatar.x.toFixed(2)}, ${spriteAvatar.y.toFixed(2)})`, {
                fontSize: '12px',
                fill: '#fff'
            }
        );

        // Botón Arriba
        const btnUp = gameScene.add.text(controlX, controlY + 20, 'Arriba', {
            fontSize: '12px',
            fill: '#0f0'
        }).setInteractive();

        // Botón Abajo
        const btnDown = gameScene.add.text(controlX, controlY + 60, 'Abajo', {
            fontSize: '12px',
            fill: '#0f0'
        }).setInteractive();

        // Botón Izquierda
        const btnLeft = gameScene.add.text(controlX - 40, controlY + 40, 'Izquierda', {
            fontSize: '12px',
            fill: '#0f0'
        }).setInteractive();

        // Botón Derecha
        const btnRight = gameScene.add.text(controlX + 40, controlY + 40, 'Derecha', {
            fontSize: '12px',
            fill: '#0f0'
        }).setInteractive();

        // Función para actualizar el texto de la posición
        const updatePositionText = () => {
            positionDisplay.setText(`Position: (${spriteAvatar.x.toFixed(2)}, ${spriteAvatar.y.toFixed(2)})`);
        };

        btnUp.on('pointerdown', () => {
            spriteAvatar.y -= delta;
            updatePositionText();
        });

        btnDown.on('pointerdown', () => {
            spriteAvatar.y += delta;
            updatePositionText();
        });

        btnLeft.on('pointerdown', () => {
            spriteAvatar.x -= delta;
            updatePositionText();
        });

        btnRight.on('pointerdown', () => {
            spriteAvatar.x += delta;
            updatePositionText();
        });
    }
}

export default AvatarPositionSpriteModal;
