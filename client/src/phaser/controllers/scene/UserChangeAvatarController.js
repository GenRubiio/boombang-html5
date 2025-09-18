import UserIdleAnimation from "../../animations/UserIdleAnimation.js";
import avatarManager from "../../managers/AvatarManager.js";
import AvatarEnum from "@/enums/AvatarEnum.js";

class UserChangeAvatarController {
    static async main(gameScene, data) {
        const socketId = data.user;
        const position = data.position;

        // Verificar que el jugador exista
        if (!gameScene.users[socketId]) return;

        const user = gameScene.users[socketId];
        if (!user) return;

        const requestedAvatarId = parseInt(data.avatar);

        // Verificar si el avatar está cargado ANTES de intentar pre-carga
        let avatarToUse = requestedAvatarId;

        if (!avatarManager.isAvatarLoaded(requestedAvatarId)) {
            // Si no está cargado, intentar cargar desde cache
            //console.log(`🔄 Avatar ${requestedAvatarId} no está cargado, intentando cache...`);

            try {
                // Intentar cargar usando el sistema unificado de AvatarManager
                await avatarManager.loadAvatar(gameScene, requestedAvatarId);
                //console.log(`✅ Avatar ${requestedAvatarId} cargado exitosamente`);
            } catch (error) {
                //console.warn(`⚠️ Error cargando avatar ${requestedAvatarId}, usando fallback:`, error);
                avatarToUse = avatarManager.getAvatarToUse(requestedAvatarId);

                // Añadir a cola de carga en segundo plano
                avatarManager.queueAvatarForBackgroundLoading(requestedAvatarId);
            }
        }

        // Actualizar el avatarId del usuario
        user.avatarId = avatarToUse;
        user.originalAvatarId = requestedAvatarId; // Guardar el avatar solicitado originalmente
        user.spriteAvatar._avatarId = avatarToUse;

        // Actualizar la posición lógica del jugador
        user.position = position;

        // Detener tweens existentes para asegurar que no se esté moviendo mientras cambias la dirección
        if (user.currentTween) {
            user.currentTween.stop();
            user.currentTween = null;
        }
        gameScene.tweens.killTweensOf(user.containerUser);

        // Si el jugador tiene un path definido, limpiarlo
        user.path = [];
        user.pathIndex = 0;

        // Forzar la posición en el mapa según la lógica isométrica
        const tileWidth = 65 * 2;
        const tileHeight = 33 * 2;
        const finalX = (user.position.x - user.position.y) * (tileWidth / 2) + gameScene.scale.width / 2;
        const finalY = (user.position.x + user.position.y) * (tileHeight / 2);

        user.containerUser.setPosition(finalX, finalY);
        user.containerUser.setDepth(finalY);

        // Reemplazar el sprite con el nuevo avatar
        this.replaceUserSprite(gameScene, user, avatarToUse, position.z);

        // Si estamos usando fallback, configurar listener para actualizar cuando se cargue el avatar real
        if (avatarToUse !== requestedAvatarId) {
            this.setupAvatarChangeListener(gameScene, user, requestedAvatarId, position);
        }
    }

    /**
     * Configura un listener para actualizar el avatar cuando se carga en segundo plano
     */
    static setupAvatarChangeListener(gameScene, user, originalAvatarId, position) {
        const checkInterval = setInterval(() => {
            if (avatarManager.isAvatarLoaded(originalAvatarId)) {
                //console.log(`🔄 Cambiando avatar de ${user.username} a ${originalAvatarId}`);

                // Actualizar el avatar del usuario
                this.updateUserAvatarChange(gameScene, user, originalAvatarId, position);

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
     * Actualiza el avatar cuando se carga en segundo plano
     */
    static updateUserAvatarChange(gameScene, user, newAvatarId, position) {
        try {
            // Verificar que el avatar esté cargado en el AvatarManager
            if (!avatarManager.isAvatarLoaded(newAvatarId)) {
                //console.warn(`⚠️ Avatar ${newAvatarId} no está cargado, reintentando...`);
                // Reintentar en 500ms
                setTimeout(() => {
                    this.updateUserAvatarChange(gameScene, user, newAvatarId, position);
                }, 500);
                return;
            }

            // Reemplazar el sprite con el nuevo avatar
            this.replaceUserSprite(gameScene, user, newAvatarId, position.z);

            //console.log(`✅ Avatar cambiado exitosamente para ${user.username} a ${newAvatarId}`);
        } catch (error) {
            //console.error(`❌ Error cambiando avatar para ${user.username}:`, error);
        }
    }

    /**
     * Reemplaza el sprite del usuario con un nuevo avatar
     */
    static replaceUserSprite(gameScene, user, newAvatarId, currentZ) {
        try {
            // Obtener el atlas key correcto para el nuevo avatar
            const avatarName = this.avatarName(newAvatarId);
            const atlasKey = `${avatarName}_atlas`;

            // Verificar que el atlas existe con retry para casos de cache
            if (!gameScene.textures.exists(atlasKey)) {
                // Intentar esperar un poco y verificar de nuevo (para casos de cache que aún se están procesando)
                setTimeout(() => {
                    if (gameScene.textures.exists(atlasKey)) {
                        this.replaceUserSprite(gameScene, user, newAvatarId, currentZ);
                    } else {
                        //console.error(`❌ Atlas no encontrado para avatar ${newAvatarId}: ${atlasKey}`);
                    }
                }, 100); // 100ms es suficiente para que se procese el texture desde cache
                return;
            }

            // Guardar posición y propiedades actuales
            const currentX = user.spriteAvatar.x;
            const currentY = user.spriteAvatar.y;
            const currentDepth = user.spriteAvatar.depth;
            const storedZ = currentZ || user.spriteAvatar._z;

            // Crear nuevo sprite de avatar con el atlas correcto
            const newSpriteAvatar = gameScene.add.sprite(currentX, currentY, atlasKey);
            newSpriteAvatar._avatarId = newAvatarId;
            newSpriteAvatar._z = storedZ;
            newSpriteAvatar.setDepth(currentDepth);

            // Aplicar animación idle
            UserIdleAnimation.main(newSpriteAvatar, storedZ, newAvatarId);

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
            user.avatarId = newAvatarId;

            //console.log(`🔄 Sprite reemplazado exitosamente para ${user.username} con avatar ${newAvatarId}`);
        } catch (error) {
            //console.error(`❌ Error reemplazando sprite para ${user.username}:`, error);
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
            //console.warn('⚠️ ColorReplacePipeline no disponible o no inicializado, omitiendo tint');
            return;
        }

        // Verificar que el contexto WebGL esté activo
        try {
            const contextLost = pipeline.gl.isContextLost();
            if (contextLost) {
                //console.warn('⚠️ Contexto WebGL perdido, omitiendo tint');
                return;
            }
        } catch (contextError) {
            //console.warn('⚠️ Error verificando contexto WebGL, omitiendo tint');
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
                            //console.warn('⚠️ Sprite no completamente inicializado, omitiendo tint');
                        }
                    } else {
                        //console.warn('⚠️ Pipeline no inicializado correctamente en callback, omitiendo tint');
                    }
                }
            } catch (tintError) {
                //console.warn(`⚠️ Error aplicando tint:`, tintError.message);
                // Si el error es específicamente del set1f, intentar deshabilitar temporalmente el pipeline
                if (tintError.message && tintError.message.includes('set1f')) {
                    //console.warn('🔧 Error set1f detectado, deshabilitando pipeline temporalmente');
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
                    //console.warn('⚠️ Error en reintento de tint:', retryError.message);
                }
            }, 500);
        }
    }

    /**
     * Convierte avatar ID a nombre de avatar
     */
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

export default UserChangeAvatarController;

