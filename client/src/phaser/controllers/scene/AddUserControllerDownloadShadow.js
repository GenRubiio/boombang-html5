import MoveUserToTileController from "./MoveUserToTileController.js";
import UserIdleAnimation from "../../animations/UserIdleAnimation.js";
import UserModel from "../../models/UserModel.js";
import socket from "../../../sockets/socket.js"; // Conexión Socket.io
import RequestSocketsEnum from "../../../enums/RequestSocketsEnum.js";
import ShadowColorsEnum from "@/enums/ShadowColorsEnum.js";
import NameColorsEnum from "@/enums/NameColorsEnum.js";
import SceneUtils from "../../../utils/SceneUtils.js";
import TintSpriteUtils from "../../../utils/TintSpriteUtils.js";
import AvatarOriginSpriteModal from "../../admin/modals/AvatarOriginSpriteModal.js";
import AvatarPositionSpriteModal from "../../admin/modals/AvatarPositionSpriteModal.js";
import UserWalkAnimation from "../../animations/UserWalkAnimation.js";
import UserUppercutAnimation from "../../animations/UserUppercutAnimation.js";
import UserEmojiAnimation from "../../animations/UserEmojiAnimation.js";
import UserChatAnimation from "../../animations/UserChatAnimation.js";

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

class AddUserControllerDownloadShadow {
    static async main(gameScene, userData) {
        if (gameScene.users[userData.id]) return;

        // engancha limpieza de nameTags al cerrar la escena
        setupNameTagCleanup(gameScene);

        const { containerUser, spriteAvatar, spriteShadow } = this.createContainerUser(gameScene, userData);
        const user = new UserModel(userData, spriteAvatar, spriteShadow, containerUser);
        MoveUserToTileController.main(gameScene, user);

        // Almacenar jugador
        gameScene.users[userData.id] = user;
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
        spriteShadow.on("pointerdown", async () => {
            // gestión de selección visual
            if (!gameScene.selectedShadow) {
                spriteShadow.setTexture("shadow_selected").setDisplaySize(54, 20);
                gameScene.tintMgr.replaceColor(spriteShadow, "shadow", 0x000000, color);
                gameScene.selectedShadow = spriteShadow;
            } else if (gameScene.selectedShadow !== spriteShadow) {
                try {
                    gameScene.tintMgr.clearPart(gameScene.selectedShadow, "shadow");
                    gameScene.selectedShadow.setTexture("shadow").setDisplaySize(54, 20);
                } catch (e) { /* noop */ }
                spriteShadow.setTexture("shadow_selected").setDisplaySize(54, 20);
                gameScene.tintMgr.replaceColor(spriteShadow, "shadow", 0x000000, color);
                gameScene.selectedShadow = spriteShadow;
            } else {
                // ya era el seleccionado → asegura textura/tinte
                spriteShadow.setTexture("shadow_selected").setDisplaySize(54, 20);
                gameScene.tintMgr.replaceColor(spriteShadow, "shadow", 0x000000, color);
            }

            // Emit select user
            const clickedPlayer = gameScene.users[spriteShadow.playerSocketId];
            if (clickedPlayer) {
                socket.emit(RequestSocketsEnum.USER_SELECT_USER, {
                    socketId: spriteShadow.playerSocketId
                });
            }

            // === DESCARGA RESPETANDO rexColorReplace (sin cámaras) ===
            try {
                const fileName = `shadow_${spriteShadow.playerSocketId}.png`;
                await AddUserController.exportShadowByCPUReplace(gameScene, spriteShadow, 0x000000, color, 18, `shadow_${spriteShadow.playerSocketId}.png`);

            } catch (err) {
                // console.warn("No se pudo descargar la sombra:", err);
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
        spriteAvatar.setDepth(1);
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

    /**
     * Exporta un PNG aplicando EXACTAMENTE rexColorReplace, usando RenderTexture.
     * - Clona el sprite, aplica replaceColor en el clon.
     * - Dibuja el clon en un RT a coordenadas seguras (w*originX, h*originY).
     * - snapshot del RT (incluye pipeline).
     */
    static exportWithColorReplaceRT(scene, sourceSprite, color, fileName = "sprite.png") {
        const w = Math.max(1, Math.ceil(sourceSprite.displayWidth));
        const h = Math.max(1, Math.ceil(sourceSprite.displayHeight));

        // Clon temporal con mismo frame/origen/tamaño
        const texKey = sourceSprite.texture.key;
        const frameName = sourceSprite.frame && sourceSprite.frame.name !== "__BASE" ? sourceSprite.frame.name : null;
        const clone = scene.add.image(0, 0, texKey, frameName);
        clone.setOrigin(sourceSprite.originX, sourceSprite.originY);
        clone.setDisplaySize(w, h);

        // Aplica EXACTAMENTE tu reemplazo
        scene.tintMgr.replaceColor(clone, "shadow", 0x000000, color);

        // RT temporal (no añadido a la escena)
        const rt = scene.make.renderTexture({ x: 0, y: 0, width: w, height: h, add: false });

        // Dibuja el clon dentro del RT respetando el origen (para no recortar)
        const drawX = w * clone.originX;
        const drawY = h * clone.originY;
        rt.draw(clone, drawX, drawY);

        return new Promise((resolve, reject) => {
            try {
                rt.snapshot((img) => {
                    try {
                        const a = document.createElement("a");
                        a.href = img.src;
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        // limpiar
                        clone.destroy();
                        rt.destroy();
                        resolve();
                    } catch (e) {
                        clone.destroy();
                        rt.destroy();
                        reject(e);
                    }
                });
            } catch (e) {
                clone.destroy();
                rt.destroy();
                reject(e);
            }
        });
    }

    /**
   * Exporta la sombra reemplazando color en CPU (Canvas 2D), sin pipelines WebGL.
   * - fromColor: color origen (ej: 0x000000)
   * - toColor: color destino (ej: 0xff6700)
   * - tolerance: 0..255 (distancia máxima por canal para considerar "match")
   * - fileName: nombre del archivo a descargar
   */
    static exportShadowByCPUReplace(scene, sprite, fromColor, toColor, tolerance = 12, fileName = "shadow.png") {
        const tex = sprite.texture;
        const frame = sprite.frame; // Phaser.Textures.Frame
        if (!tex || !frame) return Promise.reject(new Error("Sprite sin textura o frame"));

        // 1) Obtener el source image del frame (respetando recortes)
        const source = frame.source.image; // HTMLImageElement | HTMLCanvasElement | WebGLTexture (si estaba en GPU)
        if (!source || !(source instanceof HTMLImageElement || source instanceof HTMLCanvasElement)) {
            // Si es WebGLTexture, intentamos acceder al canvas de la textura base
            const base = tex.getSourceImage();
            if (!base || !(base instanceof HTMLImageElement || base instanceof HTMLCanvasElement)) {
                return Promise.reject(new Error("No se puede leer la imagen fuente de la textura"));
            }
        }

        const sx = frame.cutX;
        const sy = frame.cutY;
        const sw = frame.cutWidth;
        const sh = frame.cutHeight;

        // 2) Canvas de trabajo con el frame "crudo"
        const work = document.createElement("canvas");
        work.width = sw;
        work.height = sh;
        const wctx = work.getContext("2d");
        wctx.drawImage(frame.source.image, sx, sy, sw, sh, 0, 0, sw, sh);

        // 3) Reemplazo de color por tolerancia
        const fromR = (fromColor >> 16) & 0xff;
        const fromG = (fromColor >> 8) & 0xff;
        const fromB = fromColor & 0xff;

        const toR = (toColor >> 16) & 0xff;
        const toG = (toColor >> 8) & 0xff;
        const toB = toColor & 0xff;

        const imgData = wctx.getImageData(0, 0, sw, sh);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            // Saltar píxeles totalmente transparentes
            if (a === 0) continue;

            // Match por tolerancia por canal (rápido y suficiente para sombras)
            if (Math.abs(r - fromR) <= tolerance &&
                Math.abs(g - fromG) <= tolerance &&
                Math.abs(b - fromB) <= tolerance) {
                data[i] = toR;
                data[i + 1] = toG;
                data[i + 2] = toB;
                // alpha se conserva
            }
        }
        wctx.putImageData(imgData, 0, 0);

        // 4) Escalar al tamaño visual del sprite para que el PNG tenga el mismo tamaño en pantalla
        const outW = Math.max(1, Math.round(sprite.displayWidth));
        const outH = Math.max(1, Math.round(sprite.displayHeight));
        const out = document.createElement("canvas");
        out.width = outW;
        out.height = outH;
        const octx = out.getContext("2d");
        // Desactivar suavizado si quieres pixel-perfect
        // octx.imageSmoothingEnabled = false;
        octx.clearRect(0, 0, outW, outH);
        octx.drawImage(work, 0, 0, sw, sh, 0, 0, outW, outH);

        // 5) Descargar
        return new Promise((resolve) => {
            out.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                resolve();
            }, "image/png");
        });
    }

}

export default AddUserControllerDownloadShadow;
