/**
 * Controlador de inicialización del sistema de avatares
 * Maneja la inicialización y configuración del sistema inteligente de avatares
 */

import smartAvatarSystem from "../managers/SmartAvatarSystem.js";
import backgroundAvatarLoader from "../managers/BackgroundAvatarLoader.js";
import AvatarDiagnostic from "../utils/AvatarDiagnostic.js";

class AvatarSystemController {
    
    /**
     * Inicializa el sistema completo de avatares para una escena
     */
    static async init(scene) {
        //console.log("🎯 Inicializando sistema de avatares...");
        
        try {
            // Inicializar el sistema inteligente
            await smartAvatarSystem.init(scene);
            
            // Configurar listeners para eventos del sistema
            this.setupSystemListeners(scene);
            
            // Configurar limpieza automática al cambiar de escena
            this.setupSceneCleanup(scene);
            
            //console.log("✅ Sistema de avatares inicializado correctamente");
            
            return true;
        } catch (error) {
            //console.error("❌ Error inicializando sistema de avatares:", error);
            return false;
        }
    }

    /**
     * Configura listeners para eventos del sistema
     */
    static setupSystemListeners(scene) {
        // Listener para cuando todos los avatares esenciales estén listos
        smartAvatarSystem.once('essentialReady', () => {
            //console.log("⚡ Avatares esenciales listos - sala puede funcionar");
            scene.avatarsEssentialReady = true;
            
            // Emitir evento personalizado para la escena
            scene.events.emit('avatarsEssentialReady');
        });

        // Listener para cuando todos los avatares estén cargados
        smartAvatarSystem.once('allAvatarsReady', (stats) => {
            //console.log("🎉 Todos los avatares cargados:", stats);
            scene.allAvatarsReady = true;
            
            // Emitir evento personalizado para la escena
            scene.events.emit('allAvatarsReady', stats);
        });

        // Listener para estadísticas en tiempo real
        backgroundAvatarLoader.on('avatarLoaded', (data) => {
            // Actualizar UI de progreso si existe
            if (scene.updateAvatarProgress) {
                scene.updateAvatarProgress(data);
            }
            
            // Emitir evento para la escena
            scene.events.emit('avatarLoaded', data);
        });

        // Configurar logging de estadísticas periódicas
        this.setupPeriodicStats(scene);
    }

    /**
     * Configura limpieza automática al cambiar de escena
     */
    static setupSceneCleanup(scene) {
        // Limpiar cuando la escena termine
        scene.events.once('shutdown', () => {
            //console.log("🧹 Limpiando sistema de avatares...");
            
            smartAvatarSystem.cleanup();
            
            //console.log("✅ Sistema de avatares limpio");
        });

        // Pausar cuando la escena se pause
        scene.events.on('pause', () => {
            //console.log("⏸️ Pausando sistema de avatares");
            smartAvatarSystem.pause();
        });

        // Reanudar cuando la escena se reanude
        scene.events.on('resume', () => {
            //console.log("▶️ Reanudando sistema de avatares");
            smartAvatarSystem.resume();
        });
    }

    /**
     * Configura logging de estadísticas periódicas
     */
    static setupPeriodicStats(scene) {
        // Solo en desarrollo
        if (import.meta.env.DEV) {
            const statsInterval = setInterval(() => {
                const stats = smartAvatarSystem.getSystemStats();
                
                if (stats.pending > 0 || stats.active > 0) {
                    //console.log(`📊 Sistema de avatares: ${stats.loaded}/${stats.total} cargados (${stats.percentage}%) | Pendientes: ${stats.pending} | Activos: ${stats.active}`);
                }
                
                // Limpiar interval cuando termine la escena
                if (!scene.scene || !scene.scene.isActive()) {
                    clearInterval(statsInterval);
                }
            }, 5000); // Cada 5 segundos

            // Limpiar interval al shutdown
            scene.events.once('shutdown', () => {
                clearInterval(statsInterval);
            });
        }
    }

    /**
     * Fuerza la priorización de avatares de usuarios activos
     */
    static prioritizeActiveUsers(scene) {
        if (!scene.users) return;
        
        const userCount = Object.keys(scene.users).length;
        //console.log(`🎯 Priorizando avatares para ${userCount} usuarios activos`);
        
        smartAvatarSystem.prioritizeActiveUsers();
    }

    /**
     * Obtiene estadísticas del sistema
     */
    static getStats() {
        return smartAvatarSystem.getSystemStats();
    }

    /**
     * Verifica si un avatar específico está disponible
     */
    static isAvatarAvailable(avatarId) {
        return smartAvatarSystem.isAvatarAvailable(avatarId);
    }

    /**
     * Solicita carga prioritaria de un avatar
     */
    static requestPriorityLoad(avatarId) {
        backgroundAvatarLoader.requestPriorityLoad(avatarId);
    }

    /**
     * Pausa temporalmente el sistema
     */
    static pause() {
        smartAvatarSystem.pause();
    }

    /**
     * Reanuda el sistema
     */
    static resume() {
        smartAvatarSystem.resume();
    }

    /**
     * Obtiene información de un avatar para un usuario
     */
    static getAvatarForUser(userId, requestedAvatarId) {
        return smartAvatarSystem.getAvatarForUser(userId, requestedAvatarId);
    }

    /**
     * Actualiza el avatar actual de un usuario
     */
    static updateUserAvatar(userId, newAvatarId) {
        smartAvatarSystem.updateUserAvatar(userId, newAvatarId);
    }

    /**
     * Elimina un usuario del sistema
     */
    static removeUser(userId) {
        smartAvatarSystem.removeUser(userId);
    }

    /**
     * Configura callback para cuando un avatar esté listo
     */
    static onAvatarReady(avatarId, callback) {
        smartAvatarSystem.onAvatarReady(avatarId, callback);
    }

    /**
     * Reinicia completamente el sistema
     */
    static reset() {
        smartAvatarSystem.reset();
    }

    /**
     * Diagnóstico del sistema para debugging
     */
    static diagnose(scene = null) {
        return AvatarDiagnostic.fullDiagnosis(scene);
    }

    /**
     * Sincroniza manualmente todos los sistemas (para resolver inconsistencias)
     */
    static forceSync(scene) {
        return AvatarDiagnostic.forceSync(scene);
    }

    /**
     * Inicia monitoreo en tiempo real del sistema
     */
    static startMonitoring(intervalMs = 5000) {
        return AvatarDiagnostic.startMonitoring(intervalMs);
    }

    /**
     * Reset completo del sistema
     */
    static hardReset(scene) {
        return AvatarDiagnostic.hardReset(scene);
    }
}

export default AvatarSystemController;