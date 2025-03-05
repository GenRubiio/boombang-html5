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
        this.lineSpacing = 20;
        this.pushSpeed = 1;
        this.checkInterval = 5000;
        this.rightReserved = 220;
        this.leftBound = 0;
        this.textDepth = 9999;
        this.playerSprite = null;
        this.avatarKey = null;

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

    addMessage(text, userName, playerSprite, avatarId) {
        this.playerSprite = playerSprite;
        this.avatarKey = avatarId + '_cara_media';
        // Empujar mensajes existentes hacia arriba

        this.messages.forEach(msg => {
            msg.y -= this.lineSpacing;
        });

        // Posición vertical fija (20% del alto de la escena)
        const yPos = this.scene.game.config.height * this.chatAreaPercent;
        // Centro del sprite del jugador (para el clamping)
        const bounds = this.playerSprite.getBounds();
        let xPos = bounds.centerX;

        // Variables de configuración
        const elementMargin = 5; // separación entre avatar, nombre y mensaje
        const containerPadding = { left: 4, right: 4, top: 2, bottom: 4 };

        // Crear el avatar y escalarlo
        const avatar = this.scene.add.image(0, 0, this.avatarKey).setOrigin(0, 0);
        avatar.setScale(0.5);

        // Crear el texto del nombre
        const nameText = this.scene.add.text(0, 0, `${userName}:`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#000000'
        });
        nameText.setOrigin(0, 0);

        // Crear el texto del mensaje
        const messageText = this.scene.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#000000'
        });
        // Queremos que su posición x represente el centro del mensaje
        messageText.setOrigin(0.5, 0);
        messageText.setDepth(this.textDepth);

        // Calcular la altura máxima (baseline de contenido) para alinear por abajo
        const contentBaseline = Math.max(avatar.displayHeight, nameText.height, messageText.height);

        // Posicionar cada elemento para que sus bordes inferiores se alineen (baseline)
        avatar.x = containerPadding.left;
        avatar.y = containerPadding.top + (contentBaseline - avatar.displayHeight);

        nameText.x = avatar.x + avatar.displayWidth + elementMargin;
        nameText.y = containerPadding.top + (contentBaseline - nameText.height);

        messageText.x = nameText.x + nameText.width + elementMargin + messageText.width * 0.5;
        messageText.y = containerPadding.top + (contentBaseline - messageText.height);

        // Calcular dimensiones totales del contenido del container
        const contentWidth = containerPadding.left + avatar.displayWidth +
            elementMargin + nameText.width +
            elementMargin + messageText.width + containerPadding.right;
        const contentHeight = containerPadding.top + contentBaseline + containerPadding.bottom;

        // Crear el fondo usando Graphics para dibujar un rectángulo redondeado
        // Generamos una textura única para cada mensaje usando Date.now() en la clave
        const bgGraphics = this.scene.add.graphics();
        bgGraphics.fillStyle(0xffffff, 0.5); // Fondo blanco con 50% de opacidad
        bgGraphics.fillRoundedRect(0, 0, contentWidth, contentHeight, 5);
        const textureKey = 'roundedBg_' + Date.now();
        bgGraphics.generateTexture(textureKey, contentWidth, contentHeight);
        bgGraphics.destroy();

        // Crear una imagen usando la textura generada, centrada en el container
        const background = this.scene.add.image(contentWidth / 2, contentHeight / 2, textureKey);

        // Crear el container y agregar el fondo en la posición 0 para que quede detrás
        const chatContainer = this.scene.add.container(0, 0, [background, avatar, nameText, messageText]);

        // Calcular el clamping para que el centro del mensaje quede correctamente posicionado
        const halfWidth = messageText.width * 0.5;
        const sceneWidth = this.scene.game.config.width;
        const rightBound = sceneWidth - this.rightReserved;
        const minX = this.leftBound + halfWidth;
        const maxX = rightBound - halfWidth;
        const finalMessageX = Phaser.Math.Clamp(xPos, minX, maxX);

        // Ajustar la posición global del container en X
        chatContainer.x = finalMessageX - messageText.x;

        // Ajustar la posición vertical para que el top del mensaje (global) sea yPosf
        chatContainer.y = yPos - messageText.y;

        // Establecer la profundidad del container
        chatContainer.setDepth(this.textDepth);

        // Guardar el container y registrar el tiempo del último mensaje
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
