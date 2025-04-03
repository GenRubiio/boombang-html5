import MoveUserToTileController from "./MoveUserToTileController.js";
import UserIdleAnimation from "../../animations/UserIdleAnimation.js";
import UserModel from "../../models/UserModel.js";
import socket from "../../../sockets/socket.js"; // Conexión Socket.io
import RequestSocketsEnum from "../../../enums/RequestSocketsEnum.js";
import AvatarSpriteModal from "../../admin/modals/AvatarSpriteModal.js";
import UserWalkAnimation from "../../animations/UserWalkAnimation.js";
import UserUppercutAnimation from "../../animations/UserUppercutAnimation.js";
import UserEmojiAnimation from "../../animations/UserEmojiAnimation.js";

class AddUserController {
    static async main(gameScene, userData) {
        if (gameScene.users[userData.id]) return;
        const { containerUser, spriteAvatar, spriteShadow } = this.createContainerUser(gameScene, userData);
        const user = new UserModel(userData, spriteAvatar, spriteShadow, containerUser);
        MoveUserToTileController.main(gameScene, user);
        // Almacenar jugador
        gameScene.users[userData.id] = user;
        //UserEmojiAnimation.main(user, 8);
    }

    static createContainerUser(gameScene, userData) {
        // Crear sombra
        const spriteShadow = this.createShadowSprite(gameScene, userData);
        // Crear personaje
        const spriteAvatar = this.createAvatarSprite(gameScene, userData);
        // Crear texto del nombre
        const userNameContainer = this.createUserNameText(gameScene, spriteAvatar, userData);

        // Crear contenedor
        const containerUser = gameScene.add.container(0, 0, [
            spriteShadow,
            spriteAvatar,
            userNameContainer.background,
            userNameContainer.name
        ]);
        containerUser.setSize(spriteAvatar.width, spriteAvatar.height + spriteShadow.height);

        //AvatarSpriteModal.main(gameScene, spriteAvatar);
        return { containerUser, spriteAvatar, spriteShadow };
    }

    static createShadowSprite(gameScene, userData) {
        // Crear sombra
        const spriteShadow = gameScene.add.image(0, 0, "shadow").setDisplaySize(54, 20);
        spriteShadow.setDepth(0);
        spriteShadow.setInteractive({ useHandCursor: true });
        spriteShadow.playerSocketId = userData.id;

        //remove listener if already exists
        spriteShadow.removeAllListeners();
        spriteShadow.on('pointerdown', () => {
            const clickedPlayer = gameScene.users[spriteShadow.playerSocketId];
            if (clickedPlayer) {
                //console.log("Jugador clickeado: ", clickedPlayer);
                socket.emit(RequestSocketsEnum.USER_SELECT_USER, {
                    socketId: spriteShadow.playerSocketId
                });
            }
        });
        return spriteShadow;
    }

    static createAvatarSprite(gameScene, userData) {
        const spriteAvatar = gameScene.add.sprite(0, 0, "player_" + userData.id);
        UserIdleAnimation.main(
            spriteAvatar,
            userData.z,
            userData.avatar_id
        );
        //UserWalkAnimation.playWalk(
        //    spriteAvatar,
        //    8,
        //    userData.avatar_id
        //);
        //UserUppercutAnimation.main(
        //    spriteAvatar,
        //    'right',
        //    true,
        //    userData.avatar_id
        //);
        spriteAvatar.setDepth(1);

        return spriteAvatar;
    }

    static createUserNameText(gameScene, spriteAvatar, userData) {
        // Nombre del usuario
        const userName = userData.username || "Usuario";

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
        const textBackground = gameScene.add.image(0, -spriteAvatar.displayHeight / 2 - textHeight - 8, textureKey);
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

export default AddUserController;