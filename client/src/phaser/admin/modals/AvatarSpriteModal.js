class AvatarSpriteModal {
    static main(gameScene, spriteAvatar) {
        const controlX = 100;
        const controlY = 100;

        // Texto para mostrar el origin actual del spriteAvatar
        const originDisplay = gameScene.add.text(controlX, controlY, `Origin: (${spriteAvatar.originX.toFixed(2)}, ${spriteAvatar.originY.toFixed(2)})`, {
            fontSize: '12px',
            fill: '#fff'
        });

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

        // Función para actualizar el texto del origin
        const updateOriginText = () => {
            originDisplay.setText(`Origin: (${spriteAvatar.originX.toFixed(2)}, ${spriteAvatar.originY.toFixed(2)})`);
        };

        btnUp.on('pointerdown', () => {
            let newOriginY = spriteAvatar.originY - 0.01;
            //newOriginY = Phaser.Math.Clamp(newOriginY, 0, 1);
            spriteAvatar.setOrigin(spriteAvatar.originX, newOriginY);
            updateOriginText();
        });

        btnDown.on('pointerdown', () => {
            let newOriginY = spriteAvatar.originY + 0.01;
            //newOriginY = Phaser.Math.Clamp(newOriginY, 0, 1);
            spriteAvatar.setOrigin(spriteAvatar.originX, newOriginY);
            updateOriginText();
        });

        btnLeft.on('pointerdown', () => {
            let newOriginX = spriteAvatar.originX + 0.01;
            //newOriginX = Phaser.Math.Clamp(newOriginX, 0, 1);
            spriteAvatar.setOrigin(newOriginX, spriteAvatar.originY);
            updateOriginText();
        });

        btnRight.on('pointerdown', () => {
            let newOriginX = spriteAvatar.originX - 0.01;
            //newOriginX = Phaser.Math.Clamp(newOriginX, 0, 1);
            spriteAvatar.setOrigin(newOriginX, spriteAvatar.originY);
            updateOriginText();
        });
    }
}

export default AvatarSpriteModal;