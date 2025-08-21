import ChatColorsEnum from '@/enums/ChatColorsEnum';
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
        //this.scene.time.addEvent({
        //    delay: this.checkInterval,
        //    callback: this.onCheckInterval,
        //    callbackScope: this,
        //    loop: true
        //});

        // No registrar update al inicio, solo cuando haya mensajes
        this.updateRegistered = false;
    }

    addMessage(text, userName, playerSprite, avatarId, chatColor) {
        this.playerSprite = playerSprite;
        this.avatarKey = null;

        let textColor = "#000000";
        let backgroundColor = "#ffffff";
        switch (chatColor) {
            case ChatColorsEnum.ADMIN:
                backgroundColor = "#ffd700";
                break;
            case ChatColorsEnum.VIP:
                textColor = "#ffffff";
                backgroundColor = "#420143";
                break;
            case ChatColorsEnum.PRIVATE:
                textColor = "#ffffff";
                backgroundColor = "#323435";
                break;
        }
        switch (avatarId) {
            case 5:
                this.avatarKey = 'gata';
                break;
            case 12:
                this.avatarKey = 'rasta';
                break;
        }
        let avatarImage = `src/assets/game/avatars/${this.avatarKey}/cara_media.svg`;
        const containerHTML = `
            <div style="
                background-color: ${backgroundColor};
                color: ${textColor};
                padding: 1px 10px 1px 1px;
                border-radius: 5px;
                display: flex;
                align-items: center;
                font-family: Arial;
                font-size: 14px;
                cursor: default;
                user-select: none;
            ">
                <img src="${avatarImage}" style="width: 20px; height: 20px; margin-right: 4px;">
                <span style="font-weight: bold;">${userName}:</span>
                <span style="margin-left: 4px;">${text}</span>
            </div>
        `;

        const domElement = this.scene.add.dom(0, 0).createFromHTML(containerHTML);

        // Empujar mensajes existentes hacia arriba
        this.messages.forEach(msg => {
            msg.y -= (domElement.height + this.lineSpacing);
        });

        const playerBounds = this.playerSprite.getBounds();
        const sceneWidth = this.scene.game.config.width;
        const rightBound = sceneWidth - this.rightReserved;
        const minX = this.leftBound + (domElement.width / 2);
        const maxX = rightBound - (domElement.width / 2);
        const finalX = Phaser.Math.Clamp(playerBounds.centerX, minX, maxX);

        domElement.setPosition(
            Math.round(finalX),
            Math.round(this.areaStartHeight)
        );
        domElement.setDepth(this.textDepth);

        this.messages.push(domElement);
        this.lastMessageTime = this.scene.time.now;

        // Si el update estaba desregistrado, volver a registrarlo
        if (!this.updateRegistered) {
            this.scene.events.on('update', this.update, this);
            this.updateRegistered = true;
        }
    }

    addSystemAlert(text) {
        const containerHTML = `
            <div style="
                background-color: #f7c004;
                color: #000000;
                padding: 1px 10px 1px 10px;
                border-radius: 5px;
                display: flex;
                align-items: center;
                font-family: Arial;
                font-size: 14px;
                cursor: default;
                user-select: none;
            ">
                <span>${text}</span>
            </div>
        `;

        const domElement = this.scene.add.dom(0, 0).createFromHTML(containerHTML);

        // Empujar mensajes existentes hacia arriba
        this.messages.forEach(msg => {
            msg.y -= (domElement.height + this.lineSpacing);
        });

        const sceneWidth = this.scene.game.config.width;
        domElement.setPosition(
            Math.round(sceneWidth / 2),
            Math.round(this.areaStartHeight)
        );
        domElement.setDepth(this.textDepth);

        this.messages.push(domElement);
        this.lastMessageTime = this.scene.time.now;

        // Si el update estaba desregistrado, volver a registrarlo
        if (!this.updateRegistered) {
            this.scene.events.on('update', this.update, this);
            this.updateRegistered = true;
        }
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
        // Solo procesar si hay mensajes activos
        if (this.messages.length === 0) {
            return;
        }
        
        this.messages = this.messages.filter(chatContainer => {
            if (chatContainer.y + chatContainer.height < 0) {
                chatContainer.destroy();
                return false;
            }
            return true;
        });
        
        // Si no quedan mensajes, desregistrar el update temporalmente
        if (this.messages.length === 0) {
            this.scene.events.off('update', this.update, this);
            this.updateRegistered = false;
        }
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
