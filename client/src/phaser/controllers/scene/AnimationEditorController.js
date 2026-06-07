import avatarConfig from "@/assets/game/avatars/empollon/config.json";

class AnimationEditorController {
    static editorInstance = null;
    static animationData = {};
    static currentSprite = null;
    static currentAnimation = null;
    static dropdownOpen = false;
    static gameScene = null;
    static keyRepeatIntervals = {};

    static create(gameScene, spriteAvatar, user) {
        // Prevent multiple instances
        if (this.editorInstance) {
            return this.editorInstance;
        }

        // Create a deep copy of the animation data to avoid modifying the original
        this.animationData = JSON.parse(JSON.stringify(avatarConfig));
        this.currentSprite = spriteAvatar;
        this.currentUser = user;
        this.gameScene = gameScene;

        // Create the dropdown UI container
        const editorContainer = gameScene.add.container(0, 0);
        
        // Create dropdown button
        const dropdownButton = this.createDropdownButton(gameScene);
        
        // Create dropdown list (initially hidden)
        const dropdownList = this.createDropdownList(gameScene);
        dropdownList.setVisible(false);
        
        // Create position controls (initially hidden)
        const positionControls = this.createPositionControls(gameScene);
        positionControls.container.setVisible(false);
        
        // Create action buttons (initially hidden)
        const actionButtons = this.createActionButtons(gameScene);
        actionButtons.container.setVisible(false);

        // Add all elements to main container
        editorContainer.add([
            dropdownButton.container,
            dropdownList,
            positionControls.container,
            actionButtons.container
        ]);

        // Position the editor in the top-left corner with 100px margin
        editorContainer.setPosition(100, 100);
        editorContainer.setDepth(99999);
        editorContainer.setScrollFactor(0);

        // Setup keyboard controls
        this.setupKeyboardControls(gameScene);

        // Store references
        this.editorInstance = {
            container: editorContainer,
            dropdownButton,
            dropdownList,
            positionControls,
            actionButtons,
            gameScene: gameScene
        };

        return this.editorInstance;
    }

    static createDropdownButton(gameScene) {
        const container = gameScene.add.container(0, 0);
        
        // Simplified button background - no rounded corners for better performance
        const buttonBg = gameScene.add.graphics();
        buttonBg.fillStyle(0x333333, 1);
        buttonBg.fillRect(0, 0, 360, 50);
        buttonBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 360, 50), Phaser.Geom.Rectangle.Contains);
        buttonBg.setScrollFactor(0);

        // Button text
        const buttonText = gameScene.add.text(10, 25, 'Select Animation', {
            fontSize: '22px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0, 0.5).setScrollFactor(0);

        // Arrow indicator
        const arrow = gameScene.add.text(330, 25, '▼', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0.5).setScrollFactor(0);

        // Simplified button interactions - no hover effects for performance
        buttonBg.on('pointerdown', () => {
            this.toggleDropdown();
        });

        container.add([buttonBg, buttonText, arrow]);
        return { container: container, text: buttonText, arrow: arrow };
    }

    static createDropdownList(gameScene) {
        const container = gameScene.add.container(0, 60);
        container.setScrollFactor(0);

        // Show all animations from the JSON
        const animationKeys = Object.keys(this.animationData);
        
        // Split animations into two columns
        const halfLength = Math.ceil(animationKeys.length / 2);
        const leftColumnKeys = animationKeys.slice(0, halfLength);
        const rightColumnKeys = animationKeys.slice(halfLength);
        
        // Create two side-by-side lists
        const listHeight = 600;
        const columnWidth = 340;
        
        // Left column background
        const leftBg = gameScene.add.graphics();
        leftBg.fillStyle(0x222222, 0.9);
        leftBg.fillRect(0, 0, columnWidth, listHeight);
        leftBg.setScrollFactor(0);
        
        // Right column background
        const rightBg = gameScene.add.graphics();
        rightBg.fillStyle(0x222222, 0.9);
        rightBg.fillRect(columnWidth + 20, 0, columnWidth, listHeight);
        rightBg.setScrollFactor(0);

        container.add([leftBg, rightBg]);

        // Create left column animations
        let yOffset = 4;
        leftColumnKeys.forEach((key, index) => {
            const animButton = gameScene.add.graphics();
            animButton.fillStyle(0x444444, 1);
            animButton.fillRect(4, yOffset, columnWidth - 8, 36);
            animButton.setInteractive(new Phaser.Geom.Rectangle(4, yOffset, columnWidth - 8, 36), Phaser.Geom.Rectangle.Contains);
            animButton.setScrollFactor(0);

            const animText = gameScene.add.text(10, yOffset + 4, key, {
                fontSize: '16px',
                color: '#ffffff',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0, 0).setScrollFactor(0);

            animButton.on('pointerdown', () => {
                this.selectAnimation(key);
                this.toggleDropdown();
            });

            container.add([animButton, animText]);
            yOffset += 40;
        });

        // Create right column animations
        yOffset = 4;
        rightColumnKeys.forEach((key, index) => {
            const animButton = gameScene.add.graphics();
            animButton.fillStyle(0x444444, 1);
            animButton.fillRect(columnWidth + 24, yOffset, columnWidth - 8, 36);
            animButton.setInteractive(new Phaser.Geom.Rectangle(columnWidth + 24, yOffset, columnWidth - 8, 36), Phaser.Geom.Rectangle.Contains);
            animButton.setScrollFactor(0);

            const animText = gameScene.add.text(columnWidth + 30, yOffset + 4, key, {
                fontSize: '16px',
                color: '#ffffff',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0, 0).setScrollFactor(0);

            animButton.on('pointerdown', () => {
                this.selectAnimation(key);
                this.toggleDropdown();
            });

            container.add([animButton, animText]);
            yOffset += 40;
        });

        return container;
    }

    static toggleDropdown() {
        if (!this.editorInstance) return;

        this.dropdownOpen = !this.dropdownOpen;
        
        // Toggle dropdown list visibility
        this.editorInstance.dropdownList.setVisible(this.dropdownOpen);
        
        // Update arrow direction
        this.editorInstance.dropdownButton.arrow.setText(this.dropdownOpen ? '▲' : '▼');
        
        // Show/hide controls when dropdown is open
        if (this.dropdownOpen) {
            this.editorInstance.positionControls.container.setVisible(false);
            this.editorInstance.actionButtons.container.setVisible(false);
        }
    }

    static createPositionControls(gameScene) {
        const container = gameScene.add.container(0, 320);
        container.setScrollFactor(0);

        // Simplified background
        const controlsBg = gameScene.add.graphics();
        controlsBg.fillStyle(0x222222, 0.9);
        controlsBg.fillRect(0, 0, 360, 200);
        controlsBg.setScrollFactor(0);

        // Title
        const title = gameScene.add.text(10, 10, 'Position:', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0, 0).setScrollFactor(0);

        // Position values display
        const xValue = gameScene.add.text(180, 30, '0', {
            fontSize: '20px',
            color: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0.5).setScrollFactor(0);

        const yValue = gameScene.add.text(180, 100, '0', {
            fontSize: '20px',
            color: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0.5).setScrollFactor(0);

        // Flip value display
        const flipValue = gameScene.add.text(180, 170, 'false', {
            fontSize: '20px',
            color: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0.5).setScrollFactor(0);

        // Cross formation arrow buttons
        // Up arrow (Y-)
        const upBtn = this.createArrowButton(gameScene, 180, 60, '▲', () => {
            this.adjustPosition('y', -1);
        });

        // Down arrow (Y+)
        const downBtn = this.createArrowButton(gameScene, 180, 130, '▼', () => {
            this.adjustPosition('y', 1);
        });

        // Left arrow (X-)
        const leftBtn = this.createArrowButton(gameScene, 140, 94, '◄', () => {
            this.adjustPosition('x', -1);
        });

        // Right arrow (X+)
        const rightBtn = this.createArrowButton(gameScene, 220, 94, '►', () => {
            this.adjustPosition('x', 1);
        });

        // Flip toggle button
        const flipBtn = this.createArrowButton(gameScene, 260, 170, '⟷', () => {
            this.toggleFlip();
        });

        container.add([controlsBg, title, xValue, yValue, flipValue, upBtn, downBtn, leftBtn, rightBtn, flipBtn]);

        return {
            container: container,
            xValue: xValue,
            yValue: yValue,
            flipValue: flipValue
        };
    }

    static createArrowButton(gameScene, x, y, arrow, callback) {
        const button = gameScene.add.graphics();
        button.fillStyle(0x444444, 1);
        button.fillRect(x - 20, y - 16, 40, 32);
        button.setInteractive(new Phaser.Geom.Rectangle(x - 20, y - 16, 40, 32), Phaser.Geom.Rectangle.Contains);
        button.setScrollFactor(0);

        const buttonText = gameScene.add.text(x, y, arrow, {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0.5).setScrollFactor(0);

        // No hover effects for performance
        button.on('pointerdown', () => {
            callback();
        });

        return button;
    }

    static createActionButtons(gameScene) {
        const container = gameScene.add.container(0, 540);
        container.setScrollFactor(0);

        // Simplified background
        const actionsBg = gameScene.add.graphics();
        actionsBg.fillStyle(0x222222, 0.9);
        actionsBg.fillRect(0, 0, 360, 100);
        actionsBg.setScrollFactor(0);

        // Stop Animation Button
        const stopBtn = this.createActionButton(gameScene, 10, 10, 'Stop', () => {
            this.stopCurrentAnimation();
        });

        // Download Button
        const downloadBtn = this.createActionButton(gameScene, 190, 10, 'Save', () => {
            this.downloadModifiedConfig();
        });

        // Close Button
        const closeBtn = this.createActionButton(gameScene, 100, 50, 'Close', () => {
            this.close();
        });

        container.add([actionsBg, stopBtn.graphics, stopBtn.text, downloadBtn.graphics, downloadBtn.text, closeBtn.graphics, closeBtn.text]);

        return { container: container };
    }

    static createActionButton(gameScene, x, y, text, callback) {
        const button = gameScene.add.graphics();
        button.fillStyle(0x006600, 1);
        button.fillRect(x, y, 140, 36);
        button.setInteractive(new Phaser.Geom.Rectangle(x, y, 140, 36), Phaser.Geom.Rectangle.Contains);
        button.setScrollFactor(0);

        const buttonText = gameScene.add.text(x + 70, y + 18, text, {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0.5).setScrollFactor(0);

        // No hover effects for performance
        button.on('pointerdown', () => {
            callback();
        });

        return { graphics: button, text: buttonText };
    }

    static selectAnimation(animationKey) {
        this.currentAnimation = animationKey;
        console.log(`Selected animation: ${animationKey}`);
        
        // Update dropdown button text
        if (this.editorInstance) {
            this.editorInstance.dropdownButton.text.setText(animationKey);
            
            // Show position controls and action buttons
            this.editorInstance.positionControls.container.setVisible(true);
            this.editorInstance.actionButtons.container.setVisible(true);
            
            // Update position controls with current animation data
            if (this.animationData[animationKey]) {
                const animData = this.animationData[animationKey];
                this.editorInstance.positionControls.xValue.setText(animData.positionX.toString());
                this.editorInstance.positionControls.yValue.setText(animData.positionY.toString());
                this.editorInstance.positionControls.flipValue.setText(animData.flip_horizontally.toString());
            }
        }
        
        // Automatically play the selected animation
        this.playCurrentAnimation();
    }

    static adjustPosition(axis, delta) {
        if (!this.currentAnimation || !this.animationData[this.currentAnimation]) {
            console.log('No animation selected');
            return;
        }

        const animData = this.animationData[this.currentAnimation];
        
        if (axis === 'x') {
            animData.positionX += delta;
            this.editorInstance.positionControls.xValue.setText(animData.positionX.toString());
        } else if (axis === 'y') {
            animData.positionY += delta;
            this.editorInstance.positionControls.yValue.setText(animData.positionY.toString());
        }

        // Apply position change to sprite immediately
        if (this.currentSprite) {
            this.currentSprite.x = animData.positionX * 2;
            this.currentSprite.y = animData.positionY * 2;
        }

        console.log(`Updated ${this.currentAnimation} position${axis.toUpperCase()}: ${animData[`position${axis.toUpperCase()}`]}`);
    }

    static toggleFlip() {
        if (!this.currentAnimation || !this.animationData[this.currentAnimation]) {
            console.log('No animation selected');
            return;
        }

        const animData = this.animationData[this.currentAnimation];
        
        // Toggle flip_horizontally value
        animData.flip_horizontally = !animData.flip_horizontally;
        this.editorInstance.positionControls.flipValue.setText(animData.flip_horizontally.toString());

        // Apply flip change to sprite immediately
        if (this.currentSprite) {
            this.currentSprite.setFlipX(animData.flip_horizontally);
        }

        console.log(`Updated ${this.currentAnimation} flip_horizontally: ${animData.flip_horizontally}`);
    }

    static playCurrentAnimation() {
        if (!this.currentAnimation || !this.currentUser) {
            console.log('No animation or user available');
            return;
        }

        // Obtener referencia fresca del sprite desde el usuario
        const freshSprite = this.currentUser.spriteAvatar;
        if (!freshSprite) {
            console.error('No sprite available in user');
            return;
        }

        // Actualizar la referencia del sprite si es diferente
        if (this.currentSprite !== freshSprite) {
            console.log('Updating sprite reference');
            this.currentSprite = freshSprite;
        }

        const animationKey = this.currentUser.avatarId + `_${this.currentAnimation}`;
        
        try {
            // Verificar que el sprite tenga el método play
            if (!this.currentSprite.play || typeof this.currentSprite.play !== 'function') {
                console.error('Sprite does not have play method. Sprite type:', this.currentSprite.type);
                console.error('Sprite properties:', Object.keys(this.currentSprite));
                console.error('Fresh sprite properties:', Object.keys(freshSprite));
                return;
            }

            // Verificar que la animación existe en el scene
            const scene = this.gameScene;
            if (!scene || !scene.anims) {
                console.error('Game scene or animations not available');
                return;
            }
            
            if (!scene.anims.exists(animationKey)) {
                console.error(`Animation ${animationKey} does not exist in scene animations`);
                console.log('Available animations:', Array.from(scene.anims.anims.entries.keys()));
                return;
            }
            
            // Apply position and flip from animation data to the sprite's container
            const animData = this.animationData[this.currentAnimation];
            
            // Get the sprite's parent container (containerUser)
            const containerUser = this.currentSprite.parentContainer;
            if (containerUser) {
                // Apply position offset to the sprite within its container
                this.currentSprite.x = animData.positionX;
                this.currentSprite.y = animData.positionY;
                
                // Apply horizontal flip if specified
                this.currentSprite.setFlipX(animData.flip_horizontally || false);
            }
            
            // Play the animation with infinite repeat
            this.currentSprite.x = this.currentSprite.x * 2;
            this.currentSprite.y = this.currentSprite.y * 2;
            this.currentSprite.play({
                key: animationKey,
                repeat: -1
            });
            console.log(`Playing animation: ${animationKey} with position X:${animData.positionX}, Y:${animData.positionY}`);
        } catch (error) {
            console.error(`Error playing animation ${animationKey}:`, error);
            console.error('Current sprite:', this.currentSprite);
            console.error('Current user:', this.currentUser);
        }
    }

    static stopCurrentAnimation() {
        if (this.currentSprite) {
            this.currentSprite.stop();
            // Reset position to 0,0 within container
            this.currentSprite.x = 0;
            this.currentSprite.y = 0;
            console.log('Animation stopped');
        }
    }

    static downloadModifiedConfig() {
        try {
            // Create downloadable JSON file
            const dataStr = JSON.stringify(this.animationData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // Create download link
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = 'modified_avatar_config.json';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('Configuration downloaded successfully');
        } catch (error) {
            console.error('Error downloading configuration:', error);
        }
    }

    static close() {
        if (this.editorInstance) {
            // Limpiar intervalos de repetición de teclas antes de cerrar
            this.clearKeyRepeatIntervals();
            
            this.editorInstance.container.destroy();
            this.editorInstance = null;
            this.currentSprite = null;
            this.currentAnimation = null;
            console.log('Animation editor closed');
        }
    }

    static remove() {
        this.close();
    }

    /**
     * Configura controles de teclado para mover animaciones con flechas
     */
    static setupKeyboardControls(gameScene) {
        // Crear objeto de teclas
        this.cursors = gameScene.input.keyboard.createCursorKeys();
        
        // Agregar teclas adicionales para control fino
        this.keys = gameScene.input.keyboard.addKeys({
            'shift': Phaser.Input.Keyboard.KeyCodes.SHIFT,
            'ctrl': Phaser.Input.Keyboard.KeyCodes.CTRL
        });

        // Configurar eventos de keydown para iniciar movimiento continuo
        gameScene.input.keyboard.on('keydown', (event) => {
            // Solo procesar si hay una animación seleccionada y el editor está visible
            if (!this.currentAnimation || !this.editorInstance || !this.editorInstance.positionControls.container.visible) {
                return;
            }

            // Si ya hay un intervalo para esta tecla, no crear otro
            if (this.keyRepeatIntervals[event.code]) {
                return;
            }

            const isShiftPressed = this.keys.shift.isDown;
            const isCtrlPressed = this.keys.ctrl.isDown;
            
            // Determinar el incremento basado en modificadores
            let increment = 1;
            if (isShiftPressed) increment = 5;  // Movimiento rápido con Shift
            if (isCtrlPressed) increment = 0.5; // Movimiento fino con Ctrl

            // Determinar la velocidad de repetición
            let repeatDelay = 100; // ms entre repeticiones
            if (isShiftPressed) repeatDelay = 50;  // Más rápido con Shift
            if (isCtrlPressed) repeatDelay = 150;  // Más lento con Ctrl para precisión

            let moveFunction = null;

            switch (event.code) {
                case 'ArrowUp':
                    event.preventDefault();
                    moveFunction = () => this.adjustPosition('y', -increment);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    moveFunction = () => this.adjustPosition('y', increment);
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    moveFunction = () => this.adjustPosition('x', -increment);
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    moveFunction = () => this.adjustPosition('x', increment);
                    break;
                case 'Space':
                    event.preventDefault();
                    this.toggleFlip();
                    return; // Space no necesita repetición continua
            }

            if (moveFunction) {
                // Ejecutar inmediatamente
                moveFunction();
                
                // Configurar repetición continua
                this.keyRepeatIntervals[event.code] = setInterval(moveFunction, repeatDelay);
            }
        });

        // Configurar eventos de keyup para detener movimiento continuo
        gameScene.input.keyboard.on('keyup', (event) => {
            // Limpiar intervalo si existe
            if (this.keyRepeatIntervals[event.code]) {
                clearInterval(this.keyRepeatIntervals[event.code]);
                delete this.keyRepeatIntervals[event.code];
            }
        });

        console.log('⌨️ Controles de teclado configurados:');
        console.log('  • Flechas: Mover animación continuo (mantener presionado)');
        console.log('  • Shift + Flechas: Movimiento rápido (±5px, 50ms)');
        console.log('  • Ctrl + Flechas: Movimiento fino (±0.5px, 150ms)');
        console.log('  • Normal: Movimiento estándar (±1px, 100ms)');
        console.log('  • Espacio: Alternar flip horizontal');
    }

    /**
     * Limpia todos los intervalos de repetición de teclas
     */
    static clearKeyRepeatIntervals() {
        Object.values(this.keyRepeatIntervals).forEach(interval => {
            clearInterval(interval);
        });
        this.keyRepeatIntervals = {};
    }
}

export default AnimationEditorController;
