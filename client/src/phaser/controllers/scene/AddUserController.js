import MoveUserToTileController from "./MoveUserToTileController.js";
//import MovementControlsController from "./MovementControlsController.js";
import AnimationEditorController from "./AnimationEditorController.js";
import UserIdleAnimation from "../../animations/UserIdleAnimation.js";
import UserModel from "../../models/UserModel.js";
import socket from "@/sockets/socket.js"; // Conexión Socket.io
import RequestSocketsEnum from "@/enums/RequestSocketsEnum.js";
import ShadowColorsEnum from "@/enums/ShadowColorsEnum.js";
import NameColorsEnum from "@/enums/NameColorsEnum.js";
import avatarManager from "../../managers/AvatarManager.js";
import AvatarEnum from "@/enums/AvatarEnum.js";
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
    g.fillRoundedRect(0, 0, w, h, 8 * 2);
    // punta inferior
    g.fillTriangle(
        w / 2 - 5 * 2, h,
        w / 2 + 5 * 2, h,
        w / 2, h + 6 * 2
    );
    // incluye la punta en la textura
    g.generateTexture(texKey, w, h + 6 * 2);
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

        // Verificar si el avatar está cargado, si no, usar fallback y cargar en segundo plano
        const requestedAvatarId = userData.avatar_id;
        const avatarToUse = avatarManager.getAvatarToUse(requestedAvatarId);

        // Si usamos fallback, añadir el avatar original a la cola de carga
        if (avatarToUse !== requestedAvatarId) {
            avatarManager.queueAvatarForBackgroundLoading(requestedAvatarId);
        }

        // Usar el avatar disponible (original o fallback)
        const modifiedUserData = { ...userData, avatar_id: avatarToUse };

        const { containerUser, spriteAvatar, spriteShadow } = this.createContainerUser(gameScene, modifiedUserData);
        const user = new UserModel(userData, spriteAvatar, spriteShadow, containerUser);

        // Guardar el avatar original solicitado para futuras actualizaciones
        user.originalAvatarId = requestedAvatarId;
        user.currentAvatarId = avatarToUse;

        MoveUserToTileController.main(gameScene, user);

        // Almacenar jugador
        gameScene.users[userData.id] = user;

        // Create animation editor for this user's sprite
        if (import.meta.env.VITE_ANIMATION_AVATAR_EDITOR == "true") {
            AnimationEditorController.create(gameScene, user.spriteAvatar, user);
        }

        // Si estamos usando fallback, configurar listener para actualizar cuando se cargue el avatar real
        if (avatarToUse !== requestedAvatarId) {
            this.setupAvatarUpdateListener(gameScene, user, requestedAvatarId);
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
        //TODO: Nuevo rederizado * 2
        const spriteShadow = gameScene.add.image(0, 0, "shadow").setDisplaySize(54 * 2, 20 * 2);
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
        // Obtener el atlas key correcto para el avatar
        const avatarName = this.avatarName(userData.avatar_id);
        const atlasKey = `${avatarName}_atlas`;

        // Verificar que el atlas existe antes de crear el sprite
        if (!gameScene.textures.exists(atlasKey)) {
            console.error(`❌ Atlas no encontrado para avatar ${userData.avatar_id}: ${atlasKey}`);
            // Usar un sprite por defecto o placeholder
            const spriteAvatar = gameScene.add.sprite(0, 0);
            spriteAvatar.setVisible(false); // Ocultar hasta que se cargue
            spriteAvatar._avatarId = userData.avatar_id;
            spriteAvatar._z = userData.z;
            return spriteAvatar;
        }

        // Crear sprite con el atlas correcto
        const spriteAvatar = gameScene.add.sprite(0, 0, atlasKey);
        spriteAvatar._avatarId = userData.avatar_id;
        spriteAvatar._z = userData.z;

        // Aplicar animación idle
        UserIdleAnimation.main(
            spriteAvatar,
            userData.z,
            userData.avatar_id
        );

        spriteAvatar.setDepth(1);

        // Aplicar tints de color si están configurados - usando safeApplyTint
        this.safeApplyTint(gameScene, spriteAvatar, userData.uppercut_selected);
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
            fontSize: "20px",
            color: textColor,
            fontFamily: "Arial",
            padding: { x: 0, y: 0 }
        }).setOrigin(0.5, 1);

        // 2) Medidas con padding visual
        const textWidth = Math.ceil(userNameText.width) + 12 * 2;  // margen extra
        const textHeight = Math.ceil(userNameText.height) + 10 * 2; // padding vertical

        // 3) Clave única por usuario (id si existe; fallback a username)
        const safeName = String(userName).replace(/\s+/g, "_");
        const textureKey = `nameTag_${userData.id ?? safeName}`;

        // 4) Asegurar textura según estilo actual (regenera si cambió tamaño/color/alpha)
        ensureNameTagTexture(gameScene, textureKey, textWidth, textHeight, backgroundColor, alpha);

        // 5) Crear imagen de fondo usando la textura
        const yBg = -spriteAvatar.displayHeight / 2 - textHeight - 8 * 2;
        const textBackground = gameScene.add.image(0, yBg, textureKey)
            .setOrigin(0.5, 1)
            .setDepth(2);

        // 6) Ajustar posición del texto encima del fondo
        userNameText.y = textBackground.y - textHeight / 2;
        userNameText.setDepth(3);
        userNameText.setColor(textColor); // por si cambia dinámicamente

         //TODO: Nuevo rederizado * 2
        // textBackground.setScale(2);  // Removed: scaling elements directly instead
        // userNameText.setScale(2);    // Removed: scaling font size instead

        return {
            background: textBackground,
            name: userNameText
        };
    }

    /**
     * Configura un listener para actualizar el avatar cuando se carga en segundo plano
     */
    static setupAvatarUpdateListener(gameScene, user, originalAvatarId) {
        const checkInterval = setInterval(() => {
            if (avatarManager.isAvatarLoaded(originalAvatarId)) {
                console.log(`🔄 Actualizando avatar de ${user.username} a ${originalAvatarId}`);

                // Actualizar el sprite del avatar
                this.updateUserAvatar(gameScene, user, originalAvatarId);

                // Limpiar el interval
                clearInterval(checkInterval);
            }
        }, 1000); // Verificar cada segundo

        // Limpiar el interval si el usuario se desconecta
        if (user.cleanupCallbacks) {
            user.cleanupCallbacks.push(() => clearInterval(checkInterval));
        } else {
            user.cleanupCallbacks = [() => clearInterval(checkInterval)];
        }
    }

    /**
     * Actualiza el avatar de un usuario existente
     */
    static updateUserAvatar(gameScene, user, newAvatarId) {
        try {
            // Verificar que el avatar esté cargado en el AvatarManager
            if (!avatarManager.isAvatarLoaded(newAvatarId)) {
                console.warn(`⚠️ Avatar ${newAvatarId} no está cargado, reintentando...`);
                // Reintentar en 500ms
                setTimeout(() => {
                    this.updateUserAvatar(gameScene, user, newAvatarId);
                }, 500);
                return;
            }

            // Guardar posición y propiedades actuales
            const currentX = user.spriteAvatar.x;
            const currentY = user.spriteAvatar.y;
            const currentDepth = user.spriteAvatar.depth;
            const currentZ = user.spriteAvatar._z;

            // Obtener el atlas key correcto para el nuevo avatar
            const avatarName = this.avatarName(newAvatarId);
            const atlasKey = `${avatarName}_atlas`;

            // Verificar que el atlas existe
            if (!gameScene.textures.exists(atlasKey)) {
                console.error(`❌ Atlas no encontrado para avatar ${newAvatarId}: ${atlasKey}`);
                return;
            }

            // Crear nuevo sprite de avatar con el atlas correcto
            const newSpriteAvatar = gameScene.add.sprite(currentX, currentY, atlasKey);
            newSpriteAvatar._avatarId = newAvatarId;
            newSpriteAvatar._z = currentZ;
            newSpriteAvatar.setDepth(currentDepth);

            // Aplicar animación idle
            UserIdleAnimation.main(newSpriteAvatar, currentZ, newAvatarId);

            // Aplicar tints si los había - con verificación de pipeline
            this.safeApplyTint(gameScene, newSpriteAvatar, user.uppercut_selected);

            // Reemplazar en el contenedor
            const containerIndex = user.containerUser.list.indexOf(user.spriteAvatar);
            if (containerIndex !== -1) {
                user.containerUser.removeAt(containerIndex);
                user.containerUser.addAt(newSpriteAvatar, containerIndex);
            }

            // Destruir sprite anterior
            user.spriteAvatar.destroy();

            // Actualizar referencias
            user.spriteAvatar = newSpriteAvatar;
            user.currentAvatarId = newAvatarId;

            console.log(`✅ Avatar actualizado exitosamente para ${user.username}`);
        } catch (error) {
            console.error(`❌ Error actualizando avatar para ${user.username}:`, error);
        }
    }

    /**
     * Aplica tints de forma segura verificando el estado del ColorReplacePipeline
     */
    static safeApplyTint(gameScene, sprite, uppercutSelected) {
        if (!uppercutSelected || !gameScene.tintMgr || !sprite) {
            return;
        }

        // Verificar que el pipeline esté disponible y completamente inicializado
        const pipeline = gameScene.renderer.pipelines.get('ColorReplacePipeline');
        if (!pipeline || !pipeline.gl || !pipeline.gl.getParameter) {
            console.warn('⚠️ ColorReplacePipeline no disponible o no inicializado, omitiendo tint');
            return;
        }

        // Verificar que el contexto WebGL esté activo
        try {
            const contextLost = pipeline.gl.isContextLost();
            if (contextLost) {
                console.warn('⚠️ Contexto WebGL perdido, omitiendo tint');
                return;
            }
        } catch (contextError) {
            console.warn('⚠️ Error verificando contexto WebGL, omitiendo tint');
            return;
        }

        // Aplicar tint con delay y verificaciones adicionales
        setTimeout(() => {
            try {
                if (sprite && !sprite.destroyed && gameScene.tintMgr) {
                    // Triple verificación antes de aplicar tint
                    const currentPipeline = gameScene.renderer.pipelines.get('ColorReplacePipeline');
                    if (currentPipeline &&
                        currentPipeline.gl &&
                        currentPipeline.gl.getParameter &&
                        !currentPipeline.gl.isContextLost()) {

                        // Verificar que el sprite tenga las propiedades necesarias
                        if (sprite.pipeline && sprite.texture && sprite.texture.source) {
                            gameScene.tintMgr.changeUppercutColor(sprite, uppercutSelected);
                        } else {
                            console.warn('⚠️ Sprite no completamente inicializado, omitiendo tint');
                        }
                    } else {
                        console.warn('⚠️ Pipeline no inicializado correctamente en callback, omitiendo tint');
                    }
                }
            } catch (tintError) {
                console.warn(`⚠️ Error aplicando tint:`, tintError.message);
                // Si el error es específicamente del set1f, intentar deshabilitar temporalmente el pipeline
                if (tintError.message && tintError.message.includes('set1f')) {
                    console.warn('🔧 Error set1f detectado, deshabilitando pipeline temporalmente');
                    this.disablePipelineTemporarily(gameScene, sprite, uppercutSelected);
                }
            }
        }, 200); // Incrementar delay a 200ms
    }

    /**
     * Deshabilita temporalmente el pipeline y reintenta después
     */
    static disablePipelineTemporarily(gameScene, sprite, uppercutSelected) {
        const pipeline = gameScene.renderer.pipelines.get('ColorReplacePipeline');
        if (pipeline) {
            // Guardar el estado original del pipeline
            const originalActive = pipeline.active;

            // Deshabilitar temporalmente
            pipeline.active = false;

            // Reintentar después de un delay más largo
            setTimeout(() => {
                try {
                    // Restaurar el pipeline
                    pipeline.active = originalActive;

                    // Verificar nuevamente y aplicar tint
                    if (sprite && !sprite.destroyed && gameScene.tintMgr &&
                        pipeline.gl && !pipeline.gl.isContextLost()) {
                        gameScene.tintMgr.changeUppercutColor(sprite, uppercutSelected);
                    }
                } catch (retryError) {
                    console.warn('⚠️ Error en reintento de tint:', retryError.message);
                }
            }, 500);
        }
    }

    static avatarName(avatarId) {
        switch (avatarId) {
            case AvatarEnum.BOOMER: return "boomer";
            case AvatarEnum.BRUJITA: return "brujita";
            case AvatarEnum.CHOLO: return "cholo";
            case AvatarEnum.EMPOLLON: return "empollon";
            case AvatarEnum.GATA: return "gata";
            case AvatarEnum.GHOST: return "ghost";
            case AvatarEnum.INDIA: return "india";
            case AvatarEnum.LILIAN: return "lilian";
            case AvatarEnum.MARSU: return "marsu";
            case AvatarEnum.MODERN: return "modern";
            case AvatarEnum.NINJA: return "ninja";
            case AvatarEnum.RASTA: return "rasta";
            case AvatarEnum.SKELETON: return "skeleton";
            case AvatarEnum.WEREWOLF: return "werewolf";
            case AvatarEnum.WRAITH: return "wraith";
            case AvatarEnum.YAYO: return "yayo";
            case AvatarEnum.ZOMBIE: return "zombie";
            default: return "unknown";
        }
    }
}

export default AddUserController;
