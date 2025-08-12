export default class OverheadChatAnimation {
    /**
     * @param {Phaser.Scene} scene - Escena de Phaser.
     * @param {Phaser.GameObjects.Sprite | Phaser.GameObjects.Container} playerSprite
     *        Sprite o contenedor que representa al jugador.
     * @param {string} avatarId - ID base para obtener la imagen del avatar.
     */
    constructor(scene) {
        this.scene = scene;
        this.chatAreaPercent = 0.2;
        this.lineSpacing = 5;
        this.pushSpeed = 1;
        this.checkInterval = 5000;
        this.rightReserved = 220;
        this.leftBound = 0;
        this.textDepth = 9999;
        this.playerSprite = null;
        this.avatarKey = null;
        this.areaStartHeight = 140;

        // Array para almacenar los contenedores de mensajes
        this.messages = [];

        // Control de cuándo llegó el último mensaje
        this.lastMessageTime = 0;

        // Evento para empujar textos cada checkInterval si no hay mensajes nuevos
        this.scene.time.addEvent({
            delay: this.checkInterval,
            callback: this.onCheckInterval,
            callbackScope: this,
            loop: true
        });

        // Registrar el método update para que se llame en cada frame
        this.scene.events.on('update', this.update, this);
    }

    addMessage(text, userName, playerSprite, avatarId, chatColor) {
        let textColor = "#000000"; // Color por defecto
        let backgroundColor = "#ffffff"; // Color de fondo por defecto
        switch (chatColor) {
            case 'admin':
                textColor = "#000000"; // Color de texto para admin
                backgroundColor = "#ffd700"; // Fondo claro para admin
                break;
            case 'vip':
                textColor = "#ffffff"; // Color de texto para VIP
                backgroundColor = "#420143"; // Fondo claro para VIP
                break;
        }
        this.playerSprite = playerSprite;
        this.avatarKey = avatarId + '_cara_media';

        // Configuración de elementos
        const elementMargin = 0;
        const containerPadding = { left: 4, right: 4, top: 2, bottom: 4 };

        // Crear elementos del mensaje
        const avatar = this.scene.add.image(0, 0, this.avatarKey)
            .setOrigin(0, 0)
            .setScale(0.5);

        const nameText = this.scene.add.text(0, 0, `${userName}:`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            fontStyle: 'bold',
            color: textColor
        }).setOrigin(0, 0);

        const messageText = this.scene.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: textColor
        }).setOrigin(0, 0); // Cambiamos el origen a (0,0) para mejor alineación

        // Calcular dimensiones del contenido
        const contentBaseline = Math.max(avatar.displayHeight, nameText.height, messageText.height);
        const contentWidth = containerPadding.left + avatar.displayWidth +
            elementMargin + nameText.width +
            elementMargin + messageText.width +
            containerPadding.right;
        const contentHeight = containerPadding.top + contentBaseline + containerPadding.bottom;

        // Empujar mensajes existentes hacia arriba
        this.messages.forEach(msg => {
            msg.y -= (contentHeight + this.lineSpacing);
        });

        // Obtener posición del jugador
        const playerBounds = this.playerSprite.getBounds();

        // Crear fondo del mensaje
        const bgGraphics = this.scene.add.graphics();
        const bgColor = parseInt(backgroundColor.replace(/^#/, ''), 16);
        bgGraphics.fillStyle(bgColor, 1);
        bgGraphics.fillRoundedRect(0, 0, contentWidth, contentHeight, 5);
        const textureKey = `chatBg_${Date.now()}`;
        bgGraphics.generateTexture(textureKey, contentWidth, contentHeight);
        bgGraphics.destroy();

        // Crear contenedor y posicionar elementos
        const background = this.scene.add.image(0, 0, textureKey)
            .setOrigin(0, 0);

        const chatContainer = this.scene.add.container(0, 0, [
            background,
            avatar,
            nameText,
            messageText
        ]);

        // Posicionar elementos dentro del contenedor
        avatar.setPosition(
            containerPadding.left,
            containerPadding.top + (contentBaseline - avatar.displayHeight)
        );

        nameText.setPosition(
            avatar.x + avatar.displayWidth + elementMargin,
            containerPadding.top + (contentBaseline - nameText.height)
        );

        messageText.setPosition(
            nameText.x + nameText.width + elementMargin,
            containerPadding.top + (contentBaseline - messageText.height)
        );

        // Calcular posición horizontal con límites
        const sceneWidth = this.scene.game.config.width;
        const rightBound = sceneWidth - this.rightReserved;
        const minX = this.leftBound + (contentWidth / 2);
        const maxX = rightBound - (contentWidth / 2);
        const finalX = Phaser.Math.Clamp(playerBounds.centerX, minX, maxX);

        // Posicionar contenedor
        chatContainer.setPosition(
            Math.round(finalX - (contentWidth / 2)), // Ajuste para centrado horizontal
            Math.round(this.areaStartHeight)
        );

        // Configurar profundidad
        chatContainer.setDepth(this.textDepth);

        // Guardar referencia y actualizar tiempo
        this.messages.push(chatContainer);
        this.lastMessageTime = this.scene.time.now;
    }

    // En la clase OverheadChatAnimation
    addSystemAlert(text) {
        // Configuración de elementos
        const containerPadding = { left: 4, right: 4, top: 2, bottom: 4 };
        const elementMargin = 0;

        // Crear texto del mensaje
        const messageText = this.scene.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5); // Texto centrado

        // Calcular dimensiones del contenido
        const contentWidth = messageText.width + containerPadding.left + containerPadding.right;
        const contentHeight = messageText.height + containerPadding.top + containerPadding.bottom;

        // Crear fondo del mensaje
        const bgGraphics = this.scene.add.graphics();
        bgGraphics.fillStyle(0xf7c004, 1); // Color sólido sin transparencia (#f7c004)
        bgGraphics.fillRoundedRect(0, 0, contentWidth, contentHeight, 5);
        const textureKey = `sysAlertBg_${Date.now()}`;
        bgGraphics.generateTexture(textureKey, contentWidth, contentHeight);
        bgGraphics.destroy();

        const background = this.scene.add.image(0, 0, textureKey)
            .setOrigin(0.5); // Fondo centrado

        // Crear contenedor
        const chatContainer = this.scene.add.container(0, 0, [
            background,
            messageText
        ]);

        // Ajustar posición del texto
        messageText.setPosition(0, 0);

        // Posición horizontal centrada
        const sceneWidth = this.scene.game.config.width;
        chatContainer.setPosition(
            Math.round(sceneWidth / 2), // Centrado horizontal
            Math.round(this.areaStartHeight)
        );

        // Empujar mensajes existentes hacia arriba
        this.messages.forEach(msg => {
            msg.y -= (contentHeight + this.lineSpacing);
        });

        // Configurar profundidad y guardar referencia
        chatContainer.setDepth(this.textDepth);
        this.messages.push(chatContainer);
        this.lastMessageTime = this.scene.time.now;
    }

    /**
     * Se llama cada checkInterval ms. Si no llegó ningún mensaje en ese lapso,
     * empuja los textos pushSpeed hacia arriba.
     */
    onCheckInterval() {
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastMessageTime >= this.checkInterval) {
            this.messages.forEach(msg => {
                msg.y -= this.lineSpacing;
            });
        }
    }

    /**
     * Método update que se llama en cada frame para verificar si algún mensaje ha salido
     * del área visible y así destruirlo para liberar recursos.
     */
    update() {
        // Filtrar los mensajes que aún están en pantalla
        this.messages = this.messages.filter(chatContainer => {
            // Se asume que el primer elemento es el fondo, del cual obtenemos su altura
            const background = chatContainer.list[0];
            // Si el mensaje ha salido completamente por la parte superior de la escena, lo destruimos
            if (chatContainer.y + background.height < 0) {
                chatContainer.destroy();
                return false;
            }
            return true;
        });
    }

    destroy() {
        // Desuscribirse del evento update
        this.scene.events.off('update', this.update, this);

        // Destruir todos los contenedores de mensajes
        this.messages.forEach(msg => {
            msg.destroy();
        });

        // Limpiar el array
        this.messages = [];
    }
}
