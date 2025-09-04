import MoveUserToTileController from "./MoveUserToTileController.js";
//import MovementControlsController from "./MovementControlsController.js";
import AnimationEditorController from "./AnimationEditorController.js";
import UserIdleAnimation from "../../animations/UserIdleAnimation.js";
import UserModel from "../../models/UserModel.js";
import socket from "@/sockets/socket.js"; // Conexión Socket.io
import RequestSocketsEnum from "@/enums/RequestSocketsEnum.js";
import ShadowColorsEnum from "@/enums/ShadowColorsEnum.js";
import NameColorsEnum from "@/enums/NameColorsEnum.js";
//import SceneUtils from "../../../utils/SceneUtils.js";
//import TintSpriteUtils from "../../../utils/TintSpriteUtils.js";
//import AvatarOriginSpriteModal from "../../admin/modals/AvatarOriginSpriteModal.js";
//import AvatarPositionSpriteModal from "../../admin/modals/AvatarPositionSpriteModal.js";
//import UserWalkAnimation from "../../animations/UserWalkAnimation.js";
//import UserUppercutAnimation from "../../animations/UserUppercutAnimation.js";
//import UserEmojiAnimation from "../../animations/UserEmojiAnimation.js";
//import UserChatAnimation from "../../animations/UserChatAnimation.js";

/* =========================
   NameTag texture cache (Opción B)
   ========================= */
const nameTagStyleHash = new Map(); // texKey -> "WxH_bgColor_alpha"

function ensureNameTagTexture(gameScene, texKey, w, h, bgColor, alpha) {
    const hash = `${w}x${h}_${bgColor}_${alpha}`;
    if (nameTagStyleHash.get(texKey) === hash && gameScene.textures.exists(texKey)) {
        return; // misma textura ya generada
    }
    if (gameScene.textures.exists(texKey)) {
        gameScene.textures.remove(texKey);
    }
    const g = gameScene.add.graphics();
    g.fillStyle(bgColor, alpha);
    g.fillRoundedRect(0, 0, w, h, 8);
    // punta inferior
    g.fillTriangle(
        w / 2 - 5, h,
        w / 2 + 5, h,
        w / 2, h + 6
    );
    // incluye la punta en la textura
    g.generateTexture(texKey, w, h + 6);
    g.destroy();
    nameTagStyleHash.set(texKey, hash);
}

function setupNameTagCleanup(scene) {
    if (scene._nameTagCleanupHooked) return;
    scene._nameTagCleanupHooked = true;
    scene.sys.events.once("shutdown", () => {
        // elimina texturas nameTag_ creadas entre salas
        const keys = Object.keys(scene.textures.list ?? {});
        keys.forEach((key) => {
            if (key.startsWith("nameTag_")) {
                scene.textures.remove(key);
                nameTagStyleHash.delete(key);
            }
        });
    });
}

class AddUserController {
    static async main(gameScene, userData) {
        if (gameScene.users[userData.id]) return;

        // engancha limpieza de nameTags al cerrar la escena
        setupNameTagCleanup(gameScene);

        const { containerUser, spriteAvatar, spriteShadow } = this.createContainerUser(gameScene, userData);
        const user = new UserModel(userData, spriteAvatar, spriteShadow, containerUser);
        MoveUserToTileController.main(gameScene, user);

        // Almacenar jugador
        gameScene.users[userData.id] = user;
        
        // Create animation editor for this user's sprite
        if (import.meta.env.VITE_ANIMATION_AVATAR_EDITOR == "true") {
            AnimationEditorController.create(gameScene, user.spriteAvatar, user);
        }
        
        // UserChatAnimation.main(user, "leftup_talk");
        // UserEmojiAnimation.main(user, 8);
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

        //MovementControlsController.createMovementControls(gameScene, spriteAvatar, userData.avatar_id + "_" + "down_beber");
        // AvatarOriginSpriteModal.main(gameScene, spriteAvatar);
        // AvatarPositionSpriteModal.main(gameScene, spriteAvatar);
        return { containerUser, spriteAvatar, spriteShadow };
    }

    static createShadowSprite(gameScene, userData) {
        // Crear sombra
        const spriteShadow = gameScene.add.image(0, 0, "shadow").setDisplaySize(54, 20);
        spriteShadow.setDepth(0);
        spriteShadow.setInteractive({ useHandCursor: true });
        spriteShadow.playerSocketId = userData.id;

        let color = 0xff6700;
        switch (userData.shadow_color) {
            case ShadowColorsEnum.ADMIN:
                color = 0xffd700;
                break;
            case ShadowColorsEnum.VIP:
                color = 0x6a006a;
                break;
        }

        // remove listener if already exists
        spriteShadow.removeAllListeners();
        spriteShadow.on("pointerdown", () => {
            if (!gameScene.selectedShadow) {
                // change image shadow to shadow_selected
                spriteShadow.setTexture("shadow_selected");
                gameScene.tintMgr.replaceColor(spriteShadow, "shadow", 0x000000, color);
                gameScene.selectedShadow = spriteShadow;
            } else if (gameScene.selectedShadow !== spriteShadow) {
                try {
                    // console.log("Desmarcando sombra: ");
                    gameScene.tintMgr.clearPart(gameScene.selectedShadow, "shadow");
                    gameScene.selectedShadow.setTexture("shadow");
                } catch (e) { }
                spriteShadow.setTexture("shadow_selected");
                gameScene.tintMgr.replaceColor(spriteShadow, "shadow", 0x000000, color);
                gameScene.selectedShadow = spriteShadow;
            }
            const clickedPlayer = gameScene.users[spriteShadow.playerSocketId];
            if (clickedPlayer) {
                // console.log("Jugador clickeado: ", clickedPlayer);
                socket.emit(RequestSocketsEnum.USER_SELECT_USER, {
                    socketId: spriteShadow.playerSocketId
                });
            }
        });
        return spriteShadow;
    }

    static createAvatarSprite(gameScene, userData) {
        const spriteAvatar = gameScene.add.sprite(0, 0, "player_" + userData.id);
        spriteAvatar._avatarId = userData.avatar_id;
        spriteAvatar._z = userData.z;
        UserIdleAnimation.main(
            spriteAvatar,
            userData.z,
            userData.avatar_id
        );
        // UserWalkAnimation.playWalk( spriteAvatar, 2, userData.avatar_id );
        // UserUppercutAnimation.main( spriteAvatar, 'left', true, userData.avatar_id );
        spriteAvatar.setDepth(1);
        // gameScene.tintMgr.replaceColor(spriteAvatar, 'pelo', 0xff9900, 0x36c5bf);
        gameScene.tintMgr.changeUppercutColor(spriteAvatar, userData.uppercut_selected);
        return spriteAvatar;
    }

    static createUserNameText(gameScene, spriteAvatar, userData) {
        // Nombre del usuario
        const userName = userData.username || "Undefined";

        // Estilos por defecto
        let textColor = "#000000";
        let backgroundColor = 0xffffff;
        let alpha = 1;

        switch (userData.name_color) {
            case NameColorsEnum.ADMIN:
                textColor = "#000000";
                backgroundColor = 0xffd700;
                break;
            case NameColorsEnum.VIP:
                textColor = "#ffffff";
                backgroundColor = 0x420143;
                break;
        }

        // 1) Crear el texto para medir y reutilizarlo
        const userNameText = gameScene.add.text(0, 0, userName, {
            fontSize: "10px",
            color: textColor,
            fontFamily: "Arial",
            padding: { x: 0, y: 0 }
        }).setOrigin(0.5, 1);

        // 2) Medidas con padding visual
        const textWidth = Math.ceil(userNameText.width) + 12;  // margen extra
        const textHeight = Math.ceil(userNameText.height) + 10; // padding vertical

        // 3) Clave única por usuario (id si existe; fallback a username)
        const safeName = String(userName).replace(/\s+/g, "_");
        const textureKey = `nameTag_${userData.id ?? safeName}`;

        // 4) Asegurar textura según estilo actual (regenera si cambió tamaño/color/alpha)
        ensureNameTagTexture(gameScene, textureKey, textWidth, textHeight, backgroundColor, alpha);

        // 5) Crear imagen de fondo usando la textura
        const yBg = -spriteAvatar.displayHeight / 2 - textHeight - 8;
        const textBackground = gameScene.add.image(0, yBg, textureKey)
            .setOrigin(0.5, 1)
            .setDepth(2);

        // 6) Ajustar posición del texto encima del fondo
        userNameText.y = textBackground.y - textHeight / 2;
        userNameText.setDepth(3);
        userNameText.setColor(textColor); // por si cambia dinámicamente

        return {
            background: textBackground,
            name: userNameText
        };
    }

}

export default AddUserController;
