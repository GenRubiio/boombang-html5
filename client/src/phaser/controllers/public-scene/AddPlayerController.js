import MovePlayerToTileController from "./MovePlayerToTileController.js";
import UserIdleAnimation from "../../animations/UserIdleAnimation.js";
import PlayerModel from "../../models/PlayerModel.js";
import socket from "../../../sockets/socket.js"; // Conexión Socket.io
import RequestSocketsEnum from "../../../enums/RequestSocketsEnum.js";

class AddPlayerController {
    static async main(gameScene, playerData) {
        if (gameScene.players[playerData.id]) return;
        const { playerContainer, spritePlayer, spriteShadow } = this.createPlayerContainer(gameScene, playerData);
        const playerModel = new PlayerModel(playerData, spritePlayer, spriteShadow, playerContainer, gameScene);
        MovePlayerToTileController.main(gameScene, playerModel);
        // Almacenar jugador
        gameScene.players[playerData.id] = playerModel;
    }

    static createPlayerContainer(gameScene, playerData) {
        // Crear sombra
        const spriteShadow = this.createShadowSprite(gameScene, playerData);
        // Crear personaje
        const spritePlayer = this.createPlayerSprite(gameScene, playerData);
        // Crear texto del nombre
        const userNameContainer = this.createUserNameText(gameScene, spritePlayer, playerData);

        // Crear contenedor
        const playerContainer = gameScene.add.container(0, 0, [
            spriteShadow,
            spritePlayer,
            userNameContainer.background,
            userNameContainer.name
        ]);
        playerContainer.setSize(spritePlayer.width, spritePlayer.height + spriteShadow.height);

        return { playerContainer, spritePlayer, spriteShadow };
    }

    static createShadowSprite(gameScene, playerData) {
        // Crear sombra
        const spriteShadow = gameScene.add.image(0, 0, "shadow").setDisplaySize(54, 20);
        spriteShadow.setDepth(0);
        spriteShadow.setInteractive({ useHandCursor: true });
        spriteShadow.playerSocketId = playerData.id;

        //remove listener if already exists
        spriteShadow.removeAllListeners();
        spriteShadow.on('pointerdown', () => {
            const clickedPlayer = gameScene.players[spriteShadow.playerSocketId];
            if (clickedPlayer) {
                //console.log("Jugador clickeado: ", clickedPlayer);
                socket.emit(RequestSocketsEnum.USER_SELECT_USER, {
                    socketId: spriteShadow.playerSocketId
                });
            }
        });
        return spriteShadow;
    }

    static createPlayerSprite(gameScene, playerData) {
        const spritePlayer = gameScene.add.sprite(0, 0, "player_" + playerData.id);
        UserIdleAnimation.main(
            spritePlayer,
            playerData.z,
            playerData.avatar_id
        );
        spritePlayer.setDepth(1);

        return spritePlayer;
    }

    static createUserNameText(gameScene, spritePlayer, playerData) {
        // Nombre del usuario
        const userName = playerData.username || "Usuario";

        // Crear temporalmente el texto para calcular el tamaño dinámico
        const userNameText = gameScene.add.text(0, 0, userName, {
            fontSize: "10px",
            color: "#000",
            fontFamily: "Arial",
            padding: { x: 0, y: 0 }
        }).setOrigin(0.5, 1);

        // Obtener dimensiones del texto
        const textWidth = userNameText.width + 12; // Margen extra
        const textHeight = userNameText.height + 10; // Espacio extra para padding

        // Crear clave de textura dinámica basada en el tamaño del texto
        const textureKey = `nameTag_${userName}_${textWidth}x${textHeight}`;

        // Solo generar la textura si no existe (evita recalcular siempre)
        if (!gameScene.textures.exists(textureKey)) {
            const graphics = gameScene.add.graphics();
            graphics.fillStyle(0xffffff, 0.8); // Fondo blanco semitransparente
            graphics.fillRoundedRect(0, 0, textWidth, textHeight, 8); // Rectángulo redondeado
            graphics.fillTriangle(textWidth / 2 - 5, textHeight, textWidth / 2 + 5, textHeight, textWidth / 2, textHeight + 6); // Triángulo

            // Generar la textura dinámica
            graphics.generateTexture(textureKey, textWidth, textHeight + 6);
            graphics.destroy(); // Liberar memoria del gráfico
        }

        // Crear el fondo usando la textura generada
        const textBackground = gameScene.add.image(0, -spritePlayer.displayHeight / 2 - textHeight - 8, textureKey);
        textBackground.setOrigin(0.5, 1);
        textBackground.setDepth(2);

        // Ajustar la posición del texto para que encaje con el fondo
        userNameText.y = textBackground.y - textHeight / 2;

        return {
            background: textBackground,
            name: userNameText
        }
    }
}

export default AddPlayerController;