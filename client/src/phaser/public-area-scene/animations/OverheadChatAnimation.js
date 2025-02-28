export default class OverheadChatAnimation {
    /**
     * @param {Phaser.Scene} scene - Escena de Phaser.
     * @param {Phaser.GameObjects.Sprite | Phaser.GameObjects.Container} playerSprite
     *        Sprite o contenedor que representa al jugador.
     * @param {Object} [config]
     *   @param {number} [config.chatAreaPercent=0.2]
     *       Fracción vertical (0 a 1) para la posición Y donde aparecen los nuevos mensajes.
     *   @param {number} [config.lineSpacing=20]
     *       Espacio vertical (px) para empujar hacia arriba los textos cuando llega uno nuevo.
     *   @param {number} [config.pushSpeed=1]
     *       Cantidad de píxeles que suben los textos tras checkInterval sin mensajes.
     *   @param {number} [config.checkInterval=5000]
     *       Milisegundos para revisar si no llegaron mensajes nuevos y empujar.
     *   @param {number} [config.rightReserved=200]
     *       Espacio reservado a la derecha (px), donde NO deben aparecer los textos.
     *   @param {number} [config.leftBound=0]
     *       Límite izquierdo para que el texto no salga por la izquierda.
     *   @param {number} [config.textDepth=9999]
     *       Profundidad (z-index) para mostrar los textos por encima de todo.
     */
    constructor(scene, playerSprite, avatarId) {
        this.scene = scene;
        this.playerSprite = playerSprite;

        this.chatAreaPercent = 0.2;
        this.lineSpacing = 20;
        this.pushSpeed = 1;
        this.checkInterval = 5000;
        this.rightReserved = 220;
        this.leftBound = 0;
        this.textDepth = 9999;
        this.avatarKey = avatarId + '_cara_media';

        // Array para almacenar los textos
        this.messages = [];

        // Control de cuándo llegó el último mensaje
        this.lastMessageTime = 0;

        // Evento para empujar textos cada X ms si no hay mensajes nuevos
        this.scene.time.addEvent({
            delay: this.checkInterval,
            callback: this.onCheckInterval,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * Llamar cuando llegue un nuevo mensaje.
     * @param {string} text - Mensaje a mostrar.
     */
    addMessage(text, userName = 'Undefined') {
        // Empujar mensajes existentes
        this.messages.forEach(msg => {
            msg.y -= this.lineSpacing;
        });

        // Posición vertical fija (20% del alto de la escena)
        const yPos = this.scene.game.config.height * this.chatAreaPercent;
        // Centro del sprite del jugador (para el clamping)
        const bounds = this.playerSprite.getBounds();
        let xPos = bounds.centerX;

        // Variables de configuración
        const elementMargin = 5; // separación entre elementos (avatar, nombre y mensaje)
        const containerPadding = { left: 4, right: 4, top: 2, bottom: 4 };

        // Crear el avatar y escalarlo
        const avatar = this.scene.add.image(0, 0, this.avatarKey).setOrigin(0, 0);
        avatar.setScale(0.5);
        // avatar.displayWidth y avatar.displayHeight reflejan sus dimensiones finales

        // Crear el texto del nombre
        const nameText = this.scene.add.text(0, 0, `${userName}:`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#000000'
        });
        nameText.setOrigin(0, 0);

        // Crear el texto del mensaje (con fondo, igual que en tu código original)
        const messageText = this.scene.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#000000',
        });
        // Queremos que su posición x represente el centro del mensaje
        messageText.setOrigin(0.5, 0);
        messageText.setDepth(this.textDepth || 9999);

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

        // Crear el fondo con el mismo color y alfa que el background del mensaje
        // Crear un Graphics para dibujar el rectángulo redondeado
        if (!this.scene.textures.exists('roundedBg')) {
            const bgGraphics = this.scene.add.graphics();
            bgGraphics.fillStyle(0xffffff, 0.5); // Fondo blanco con transparencia 50%
            bgGraphics.fillRoundedRect(0, 0, contentWidth, contentHeight, 5);

            // Generar una textura a partir del Graphics
            bgGraphics.generateTexture('roundedBg', contentWidth, contentHeight);
            bgGraphics.destroy();
        }
        else {
            // Si la textura ya existe, solo obtenerla
            const bgTexture = this.scene.textures.get('roundedBg');
            bgTexture.refresh();
        }

        // Crear una imagen usando la textura generada, centrada en el contenedor
        const background = this.scene.add.image(contentWidth / 2, contentHeight / 2, 'roundedBg');

        // Crear el container y agregar el fondo en la posición 0 para que quede detrás
        const chatContainer = this.scene.add.container(0, 0, [background, avatar, nameText, messageText]);

        // Calcular el clamping para que el centro del mensaje quede igual que en tu código original
        const halfWidth = messageText.width * 0.5;
        const sceneWidth = this.scene.game.config.width;
        const rightBound = sceneWidth - this.rightReserved;
        const minX = this.leftBound + halfWidth;
        const maxX = rightBound - halfWidth;
        const finalMessageX = Phaser.Math.Clamp(xPos, minX, maxX);

        // Dentro del container, el centro del mensaje es messageText.x (por su origin 0.5)
        // Ajustamos la posición global del container en X:
        chatContainer.x = finalMessageX - messageText.x;

        // Para que el top del mensaje (global) sea yPos, tenemos:
        // messageText.top = chatContainer.y + messageText.y  =>  chatContainer.y = yPos - messageText.y
        chatContainer.y = yPos - messageText.y;

        // Establecer la profundidad del container
        chatContainer.setDepth(this.textDepth || 9999);

        // Guardar el container y registrar el tiempo
        this.messages.push(chatContainer);
        this.lastMessageTime = this.scene.time.now;
    }

    /**
     * Se llama cada `checkInterval` ms. Si no llegó ningún mensaje en ese lapso,
     * empuja los textos `pushSpeed` hacia arriba.
     */
    onCheckInterval() {
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastMessageTime >= this.checkInterval) {
            this.messages.forEach(msg => {
                msg.y -= this.lineSpacing;
            });
        }
    }
}
