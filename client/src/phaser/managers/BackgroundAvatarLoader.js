/**
 * Sistema de carga de avatares en segundo plano
 * Maneja la carga asíncrona y no bloqueante de todos los avatares
 * Evita freezes cargando de forma inteligente y paralela
 */

import socket from "@/sockets/socket.js";
import AvatarEnum from "@/enums/AvatarEnum.js";
import avatarManager from "./AvatarManager.js";
import EventEmitter from "events";

class BackgroundAvatarLoader extends EventEmitter {
    constructor() {
        super();

        // Estado del cargador
        this.isInitialized = false;
        this.isLoading = false;
        this.isPaused = false;

        // Cola de carga con prioridades
        this.loadQueue = [];
        this.priorityQueue = [];
        this.loadedAvatars = new Set();

        // Configuración
        this.maxConcurrentLoads = 2; // Máximo 2 avatares simultáneos
        this.loadDelay = 150; // Delay entre cargas (ms)
        this.retryAttempts = 3; // Reintentos por avatar

        // Estado de cargas activas
        this.activeLoads = new Map();

        // Estadísticas
        this.stats = {
            totalLoaded: 0,
            totalFailed: 0,
            loadingTime: 0,
            startTime: null
        };

        // Referencias
        this.currentScene = null;

        // Avatares que siempre deben estar disponibles (carga prioritaria)
        this.essentialAvatars = [
            AvatarEnum.GATA,
            AvatarEnum.RASTA
        ];

        // Añadir el avatar del usuario conectado a avatares esenciales para carga prioritaria
        if (socket.user && socket.user.avatar_id && !this.essentialAvatars.includes(socket.user.avatar_id)) {
            this.essentialAvatars.push(socket.user.avatar_id);
        }
    }

    /**
     * Inicializa el cargador con una escena
     */
    async init(scene) {
        if (this.isInitialized) return;

        this.currentScene = scene;
        this.isInitialized = true;
        this.stats.startTime = Date.now();

        //console.log("🚀 BackgroundAvatarLoader inicializado");

        // Sincronizar estado con AvatarManager existente
        this.syncWithAvatarManager();

        // Cargar avatares esenciales primero (síncronos)
        await this.loadEssentialAvatars();

        // Iniciar carga en background del resto
        this.startBackgroundLoading();
    }

    /**
     * Sincroniza el estado con el AvatarManager para evitar cargas duplicadas
     */
    syncWithAvatarManager() {
        if (avatarManager.loadedAvatars) {
            // Copiar avatares ya cargados desde AvatarManager
            avatarManager.loadedAvatars.forEach(avatarId => {
                this.loadedAvatars.add(avatarId);
            });
        }

        // También verificar texturas existentes en Phaser
        if (this.currentScene && this.currentScene.textures) {
            const allAvatars = Object.values(AvatarEnum);
            for (const avatarId of allAvatars) {
                const textureKey = `${avatarId}_atlas`;
                if (this.currentScene.textures.exists(textureKey)) {
                    this.loadedAvatars.add(avatarId);
                }
            }
        }

        if (this.loadedAvatars.size > 0) {
            //console.log(`🔄 Sincronizado ${this.loadedAvatars.size} avatares ya cargados desde AvatarManager y texturas de Phaser`);
        }
    }

    /**
     * Carga los avatares esenciales de forma síncrona (GATA y RASTA)
     */
    async loadEssentialAvatars() {
        //console.log("⚡ Cargando avatares esenciales...");

        for (const avatarId of this.essentialAvatars) {
            try {
                // Verificar si ya está cargado (tanto en nuestro estado como en Phaser)
                const textureKey = `${avatarId}_atlas`;
                const alreadyLoaded = this.loadedAvatars.has(avatarId) ||
                    (this.currentScene && this.currentScene.textures.exists(textureKey));

                if (!alreadyLoaded) {
                    await this.loadAvatarSync(avatarId);
                    this.loadedAvatars.add(avatarId);
                    //console.log(`✅ Avatar esencial cargado: ${avatarId}`);
                } else {
                    //console.log(`🔄 Avatar esencial ${avatarId} ya estaba cargado`);
                    this.loadedAvatars.add(avatarId); // Asegurar sincronización
                }
            } catch (error) {
                //console.error(`❌ Error cargando avatar esencial ${avatarId}:`, error);
            }
        }

        this.emit('essentialAvatarsLoaded');
    }

    /**
     * Inicia la carga en segundo plano de todos los demás avatares
     */
    startBackgroundLoading() {
        if (this.isLoading) return;

        // Añadir todos los avatares no esenciales a la cola
        const allAvatars = Object.values(AvatarEnum);

        for (const avatarId of allAvatars) {
            if (!this.essentialAvatars.includes(avatarId) && !this.loadedAvatars.has(avatarId)) {
                this.addToQueue(avatarId, false);
            }
        }

        //console.log(`🔄 Iniciando carga en background de ${this.loadQueue.length} avatares`);

        // Procesar cola de forma asíncrona
        this.processQueue();
    }

    /**
     * Añade un avatar a la cola de carga
     */
    addToQueue(avatarId, isPriority = false) {
        // Verificar si ya está cargado o en cola
        if (this.loadedAvatars.has(avatarId)) return;

        const existsInPriority = this.priorityQueue.some(item => item.avatarId === avatarId);
        const existsInNormal = this.loadQueue.some(item => item.avatarId === avatarId);

        if (existsInPriority || existsInNormal) return;

        const loadItem = {
            avatarId,
            attempts: 0,
            addedAt: Date.now()
        };

        if (isPriority) {
            this.priorityQueue.push(loadItem);
        } else {
            this.loadQueue.push(loadItem);
        }

        // Si no estamos cargando, iniciar procesamiento
        if (!this.isLoading && this.isInitialized) {
            this.processQueue();
        }
    }

    /**
     * Procesa la cola de carga de forma asíncrona
     */
    async processQueue() {
        if (this.isLoading || this.isPaused || !this.currentScene) return;

        this.isLoading = true;

        while ((this.priorityQueue.length > 0 || this.loadQueue.length > 0) && !this.isPaused) {
            // Limitar cargas concurrentes
            if (this.activeLoads.size >= this.maxConcurrentLoads) {
                await this.waitForActiveLoads();
                continue;
            }

            // Priorizar cola prioritaria
            const loadItem = this.priorityQueue.shift() || this.loadQueue.shift();
            if (!loadItem) break;

            // Verificar si ya está cargado (por si se cargó mientras esperaba)
            if (this.loadedAvatars.has(loadItem.avatarId)) continue;

            // Cargar avatar de forma asíncrona
            this.loadAvatarAsync(loadItem);

            // Delay para no saturar el hilo principal
            await this.sleep(this.loadDelay);
        }

        this.isLoading = false;

        if (this.loadQueue.length === 0 && this.priorityQueue.length === 0) {
            //console.log("🎉 Carga en background completada");
            this.emit('backgroundLoadingComplete', this.getLoadingStats());
        }
    }

    /**
     * Carga un avatar de forma asíncrona
     */
    async loadAvatarAsync(loadItem) {
        const { avatarId } = loadItem;
        const loadId = `${avatarId}_${Date.now()}`;

        this.activeLoads.set(loadId, loadItem);

        try {
            // Verificar si ya está cargado antes de intentar cargar
            if (this.loadedAvatars.has(avatarId)) {
                //console.log(`🔄 Avatar ${avatarId} ya estaba cargado, omitiendo...`);
                return;
            }

            await this.loadAvatarSync(avatarId);
            this.loadedAvatars.add(avatarId);
            this.stats.totalLoaded++;

            //console.log(`✅ Avatar ${avatarId} cargado en background (${this.loadedAvatars.size}/${Object.values(AvatarEnum).length})`);

            this.emit('avatarLoaded', {
                avatarId,
                loadedCount: this.loadedAvatars.size,
                totalCount: Object.values(AvatarEnum).length
            });

        } catch (error) {
            loadItem.attempts++;

            if (loadItem.attempts < this.retryAttempts) {
                // Reintentår después de un delay mayor
                setTimeout(() => {
                    if (loadItem.attempts === 1) {
                        this.priorityQueue.unshift(loadItem); // Primera prioridad en reintentos
                    } else {
                        this.loadQueue.push(loadItem);
                    }

                    if (!this.isLoading) {
                        this.processQueue();
                    }
                }, this.loadDelay * loadItem.attempts);

                //console.warn(`⚠️ Reintentando carga de avatar ${avatarId} (intento ${loadItem.attempts}/${this.retryAttempts})`);
            } else {
                this.stats.totalFailed++;
                //console.error(`❌ Error definitivo cargando avatar ${avatarId} después de ${loadItem.attempts} intentos:`, error);

                // Emitir evento de fallo para que el SmartAvatarSystem sepa que este avatar no está disponible
                this.emit('avatarLoadFailed', {
                    avatarId,
                    error: error.message,
                    attempts: loadItem.attempts
                });
            }
        } finally {
            this.activeLoads.delete(loadId);
        }
    }

    /**
     * Carga un avatar de forma síncrona (wrapper del AvatarManager)
     */
    async loadAvatarSync(avatarId) {
        if (!this.currentScene) {
            throw new Error("No hay escena disponible");
        }

        // Verificar si la textura ya existe en Phaser
        const textureKey = `${avatarId}_atlas`;
        if (this.currentScene.textures.exists(textureKey)) {
            //console.log(`✅ Avatar ${avatarId} ya existe en texturas de Phaser, sincronizando...`);
            this.loadedAvatars.add(avatarId);
            return Promise.resolve();
        }

        // Verificar si el AvatarManager ya lo tiene cargado
        if (avatarManager.isAvatarLoaded && avatarManager.isAvatarLoaded(avatarId)) {
            //console.log(`✅ Avatar ${avatarId} ya cargado en AvatarManager, sincronizando...`);
            this.loadedAvatars.add(avatarId);
            return Promise.resolve();
        }

        return await avatarManager.loadAvatar(this.currentScene, avatarId);
    }

    /**
     * Espera a que termine alguna carga activa
     */
    async waitForActiveLoads() {
        return new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (this.activeLoads.size < this.maxConcurrentLoads) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 50);
        });
    }

    /**
     * Pausa temporal para no bloquear el hilo principal
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Verifica si un avatar está cargado
     */
    isAvatarLoaded(avatarId) {
        return this.loadedAvatars.has(avatarId);
    }

    /**
     * Solicita carga prioritaria de un avatar específico
     */
    requestPriorityLoad(avatarId) {
        if (!this.loadedAvatars.has(avatarId)) {
            this.addToQueue(avatarId, true);
        }
    }

    /**
     * Pausa la carga en background
     */
    pause() {
        this.isPaused = true;
        //console.log("⏸️ Carga en background pausada");
    }

    /**
     * Reanuda la carga en background
     */
    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            //console.log("▶️ Carga en background reanudada");

            if (!this.isLoading && (this.loadQueue.length > 0 || this.priorityQueue.length > 0)) {
                this.processQueue();
            }
        }
    }

    /**
     * Obtiene estadísticas de carga
     */
    getLoadingStats() {
        const total = Object.values(AvatarEnum).length;
        const loaded = this.loadedAvatars.size;
        const pending = this.loadQueue.length + this.priorityQueue.length;
        const active = this.activeLoads.size;

        // Agregar información de debug sobre qué avatares están cargados
        const loadedList = Array.from(this.loadedAvatars).sort((a, b) => a - b);
        const missingList = Object.values(AvatarEnum).filter(id => !this.loadedAvatars.has(id));

        if (missingList.length > 0) {
            //console.log(`🔍 Avatares faltantes: [${missingList.join(', ')}]`);
            //console.log(`🔍 Avatares cargados: [${loadedList.join(', ')}]`);
        }

        return {
            total,
            loaded,
            pending,
            active,
            failed: this.stats.totalFailed,
            percentage: Math.round((loaded / total) * 100),
            loadingTime: this.stats.startTime ? Date.now() - this.stats.startTime : 0,
            isComplete: loaded === total,
            isPaused: this.isPaused,
            isLoading: this.isLoading,
            loadedAvatars: loadedList,
            missingAvatars: missingList
        };
    }

    /**
     * Limpia recursos al cambiar de escena
     */
    cleanup() {
        this.pause();
        this.loadQueue = [];
        this.priorityQueue = [];
        this.activeLoads.clear();
        this.currentScene = null;
        this.isInitialized = false;

        // NO limpiar this.loadedAvatars aquí - los avatares siguen disponibles entre escenas

        //console.log("🧹 BackgroundAvatarLoader limpio");
    }

    /**
     * Reinicia el cargador completamente
     */
    reset() {
        this.cleanup();

        // Solo resetear si realmente necesitamos empezar desde cero
        // this.loadedAvatars.clear(); // Comentado para mantener avatares entre sesiones

        this.stats = {
            totalLoaded: 0,
            totalFailed: 0,
            loadingTime: 0,
            startTime: null
        };

        //console.log("🔄 BackgroundAvatarLoader reiniciado (manteniendo avatares cargados)");
    }
}

// Instancia singleton
const backgroundAvatarLoader = new BackgroundAvatarLoader();

export default backgroundAvatarLoader;