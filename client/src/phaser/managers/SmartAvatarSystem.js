/**
 * Sistema de gestión de avatares optimizado
 * Integra el cargador en background con el sistema de fallback inteligente
 */

import AvatarEnum from "@/enums/AvatarEnum.js";
import backgroundAvatarLoader from "./BackgroundAvatarLoader.js";
import EventEmitter from "events";

class SmartAvatarSystem extends EventEmitter {
    constructor() {
        super();
        
        // Estado del sistema
        this.isInitialized = false;
        this.currentScene = null;
        
        // Avatares disponibles inmediatamente
        this.availableAvatars = new Set();
        
        // Avatares en uso en la sala actual
        this.activeAvatars = new Map(); // userId -> {requested, current, updated}
        
        // Listeners para cambios de avatar
        this.avatarUpdateListeners = new Map(); // userId -> callback
        
        // Configuración
        this.fallbackAvatars = [AvatarEnum.GATA, AvatarEnum.RASTA];
        this.updateCheckInterval = 2000; // Check cada 2 segundos
        
        // Timer para verificaciones
        this.updateTimer = null;
    }

    /**
     * Inicializa el sistema con una escena
     */
    async init(scene) {
        if (this.isInitialized) return;
        
        this.currentScene = scene;
        this.isInitialized = true;
        
        //console.log("🎯 SmartAvatarSystem inicializado");
        
        // Inicializar el cargador en background
        await backgroundAvatarLoader.init(scene);
        
        // Escuchar eventos del cargador
        this.setupLoaderListeners();
        
        // Sincronizar con avatares ya cargados por el BackgroundAvatarLoader
        if (backgroundAvatarLoader.loadedAvatars) {
            for (const avatarId of backgroundAvatarLoader.loadedAvatars) {
                this.availableAvatars.add(avatarId);
            }
        }
        
        // Marcar avatares esenciales como disponibles (por si no están en la sincronización)
        for (const avatarId of this.fallbackAvatars) {
            this.availableAvatars.add(avatarId);
        }
        
        // Iniciar verificaciones periódicas
        this.startUpdateChecks();
        
        this.emit('systemReady');
    }

    /**
     * Configura listeners del cargador en background
     */
    setupLoaderListeners() {
        backgroundAvatarLoader.on('avatarLoaded', (data) => {
            this.availableAvatars.add(data.avatarId);
            this.checkPendingUpdates(data.avatarId);
            
            this.emit('avatarBecameAvailable', data);
        });
        
        backgroundAvatarLoader.on('avatarLoadFailed', (data) => {
            // Asegurar que avatares fallidos no se marquen como disponibles
            this.availableAvatars.delete(data.avatarId);
            //console.warn(`⚠️ Avatar ${data.avatarId} no está disponible debido a error de carga`);
            
            this.emit('avatarLoadFailed', data);
        });
        
        backgroundAvatarLoader.on('essentialAvatarsLoaded', () => {
            //console.log("✅ Avatares esenciales listos");
            this.emit('essentialReady');
        });
        
        backgroundAvatarLoader.on('backgroundLoadingComplete', (stats) => {
            //console.log("🎉 Todos los avatares cargados:", stats);
            this.emit('allAvatarsReady', stats);
        });
    }

    /**
     * Obtiene el avatar a usar para un usuario (original o fallback)
     */
    getAvatarForUser(userId, requestedAvatarId) {
        // Si el avatar solicitado está disponible, usarlo
        if (this.isAvatarAvailable(requestedAvatarId)) {
            return {
                avatarId: requestedAvatarId,
                isFallback: false,
                needsUpdate: false
            };
        }
        
        // Si no está disponible, solicitar carga prioritaria
        backgroundAvatarLoader.requestPriorityLoad(requestedAvatarId);
        
        // Usar fallback inteligente
        const fallbackId = this.selectBestFallback(requestedAvatarId);
        
        // Registrar para actualización futura
        this.activeAvatars.set(userId, {
            requested: requestedAvatarId,
            current: fallbackId,
            updated: false,
            registeredAt: Date.now()
        });
        
        return {
            avatarId: fallbackId,
            isFallback: true,
            needsUpdate: true
        };
    }

    /**
     * Selecciona el mejor avatar de fallback basado en disponibilidad
     */
    selectBestFallback(requestedAvatarId) {
        // Primero intentar con el fallback preferido por género/tipo
        const preferredFallback = this.getPreferredFallback(requestedAvatarId);
        if (this.isAvatarAvailable(preferredFallback)) {
            return preferredFallback;
        }
        
        // Si no, usar cualquier fallback disponible
        for (const fallbackId of this.fallbackAvatars) {
            if (this.isAvatarAvailable(fallbackId)) {
                return fallbackId;
            }
        }
        
        // En último caso, usar RASTA (siempre debería estar disponible)
        return AvatarEnum.RASTA;
    }

    /**
     * Obtiene el fallback preferido basado en el avatar solicitado
     */
    getPreferredFallback(requestedAvatarId) {
        // Avatares femeninos -> GATA
        const femaleAvatars = [
            AvatarEnum.GATA, AvatarEnum.BRUJITA, AvatarEnum.INDIA, 
            AvatarEnum.LILIAN, AvatarEnum.MODERN
        ];
        
        if (femaleAvatars.includes(requestedAvatarId)) {
            return AvatarEnum.GATA;
        }
        
        // Todos los demás -> RASTA
        return AvatarEnum.RASTA;
    }

    /**
     * Verifica si un avatar está disponible para uso inmediato
     */
    isAvatarAvailable(avatarId) {
        return this.availableAvatars.has(avatarId);
    }

    /**
     * Registra un callback para cuando un avatar específico esté listo
     */
    onAvatarReady(avatarId, callback) {
        if (this.isAvatarAvailable(avatarId)) {
            // Ya está disponible, ejecutar inmediatamente
            setTimeout(() => callback(avatarId), 0);
            return;
        }
        
        // Registrar listener temporal
        const listener = (data) => {
            if (data.avatarId === avatarId) {
                callback(avatarId);
                backgroundAvatarLoader.off('avatarLoaded', listener);
            }
        };
        
        backgroundAvatarLoader.on('avatarLoaded', listener);
        
        // Solicitar carga prioritaria
        backgroundAvatarLoader.requestPriorityLoad(avatarId);
    }

    /**
     * Verifica actualizaciones pendientes para un avatar específico
     */
    checkPendingUpdates(avatarId) {
        const usersToUpdate = [];
        
        for (const [userId, avatarInfo] of this.activeAvatars.entries()) {
            if (avatarInfo.requested === avatarId && !avatarInfo.updated && avatarInfo.current !== avatarId) {
                usersToUpdate.push(userId);
            }
        }
        
        // Emitir evento para cada usuario que necesita actualización
        for (const userId of usersToUpdate) {
            const avatarInfo = this.activeAvatars.get(userId);
            avatarInfo.updated = true;
            avatarInfo.updatedAt = Date.now();
            
            //console.log(`🔄 Avatar ${avatarId} ahora disponible para usuario ${userId}`);
            
            this.emit('userAvatarReady', {
                userId,
                avatarId,
                previousId: avatarInfo.current,
                waitTime: Date.now() - avatarInfo.registeredAt
            });
        }
    }

    /**
     * Inicia verificaciones periódicas de actualizaciones
     */
    startUpdateChecks() {
        if (this.updateTimer) return;
        
        this.updateTimer = setInterval(() => {
            this.performUpdateCheck();
        }, this.updateCheckInterval);
    }

    /**
     * Realiza verificación periódica de avatares pendientes
     */
    performUpdateCheck() {
        let pendingCount = 0;
        
        for (const [userId, avatarInfo] of this.activeAvatars.entries()) {
            if (!avatarInfo.updated && avatarInfo.requested !== avatarInfo.current) {
                if (this.isAvatarAvailable(avatarInfo.requested)) {
                    this.checkPendingUpdates(avatarInfo.requested);
                } else {
                    pendingCount++;
                }
            }
        }
        
        // Optimización: si no hay pendientes, reducir frecuencia de checks
        if (pendingCount === 0 && this.updateCheckInterval < 5000) {
            this.updateCheckInterval = Math.min(this.updateCheckInterval * 1.2, 5000);
            this.restartUpdateTimer();
        }
    }

    /**
     * Reinicia el timer de verificaciones con nueva frecuencia
     */
    restartUpdateTimer() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        this.startUpdateChecks();
    }

    /**
     * Actualiza el avatar actual de un usuario
     */
    updateUserAvatar(userId, newAvatarId) {
        const avatarInfo = this.activeAvatars.get(userId);
        if (avatarInfo) {
            avatarInfo.current = newAvatarId;
            avatarInfo.updated = true;
            avatarInfo.updatedAt = Date.now();
        }
    }

    /**
     * Elimina un usuario del sistema
     */
    removeUser(userId) {
        this.activeAvatars.delete(userId);
        
        // Limpiar listeners específicos del usuario si los hay
        if (this.avatarUpdateListeners.has(userId)) {
            this.avatarUpdateListeners.delete(userId);
        }
    }

    /**
     * Obtiene estadísticas del sistema
     */
    getSystemStats() {
        const backgroundStats = backgroundAvatarLoader.getLoadingStats();
        
        const activeUsers = this.activeAvatars.size;
        const usersWithFallback = Array.from(this.activeAvatars.values())
            .filter(info => info.current !== info.requested && !info.updated).length;
        
        const usersUpdated = Array.from(this.activeAvatars.values())
            .filter(info => info.updated).length;
        
        return {
            ...backgroundStats,
            activeUsers,
            usersWithFallback,
            usersUpdated,
            availableCount: this.availableAvatars.size,
            updateInterval: this.updateCheckInterval
        };
    }

    /**
     * Pausa el sistema temporalmente
     */
    pause() {
        backgroundAvatarLoader.pause();
        
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        
        //console.log("⏸️ SmartAvatarSystem pausado");
    }

    /**
     * Reanuda el sistema
     */
    resume() {
        backgroundAvatarLoader.resume();
        this.startUpdateChecks();
        
        //console.log("▶️ SmartAvatarSystem reanudado");
    }

    /**
     * Fuerza la carga de todos los avatares de usuarios activos
     */
    prioritizeActiveUsers() {
        const uniqueAvatars = new Set();
        
        for (const avatarInfo of this.activeAvatars.values()) {
            if (!this.isAvatarAvailable(avatarInfo.requested)) {
                uniqueAvatars.add(avatarInfo.requested);
            }
        }
        
        for (const avatarId of uniqueAvatars) {
            backgroundAvatarLoader.requestPriorityLoad(avatarId);
        }
        
        //console.log(`🎯 Priorizando carga de ${uniqueAvatars.size} avatares de usuarios activos`);
    }

    /**
     * Limpia recursos al cambiar de escena
     */
    cleanup() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        
        this.activeAvatars.clear();
        this.avatarUpdateListeners.clear();
        this.availableAvatars.clear();
        
        backgroundAvatarLoader.cleanup();
        
        this.currentScene = null;
        this.isInitialized = false;
        
        //console.log("🧹 SmartAvatarSystem limpio");
    }

    /**
     * Reinicia el sistema completamente
     */
    reset() {
        this.cleanup();
        backgroundAvatarLoader.reset();
        
        // Resetear configuración
        this.updateCheckInterval = 2000;
        
        //console.log("🔄 SmartAvatarSystem reiniciado");
    }
}

// Instancia singleton
const smartAvatarSystem = new SmartAvatarSystem();

export default smartAvatarSystem;