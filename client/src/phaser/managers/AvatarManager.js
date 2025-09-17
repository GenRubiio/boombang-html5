import AvatarEnum from "@/enums/AvatarEnum";
import cacheManager from "./CacheManager";
import assetVersionManager from "./AssetVersionManager";
import AvatarBoomerLoad from "../load/avatars/AvatarBoomerLoad";
import AvatarBrujitaLoad from "../load/avatars/AvatarBrujitaLoad";
import AvatarCholoLoad from "../load/avatars/AvatarCholoLoad";
import AvatarEmpollonLoad from "../load/avatars/AvatarEmpollonLoad";
import AvatarGataLoad from "../load/avatars/AvatarGataLoad";
import AvatarGhostLoad from "../load/avatars/AvatarGhostLoad";
import AvatarIndiaLoad from "../load/avatars/AvatarIndiaLoad";
import AvatarLilianLoad from "../load/avatars/AvatarLilianLoad";
import AvatarMarsuLoad from "../load/avatars/AvatarMarsuLoad";
import AvatarModernLoad from "../load/avatars/AvatarModernLoad";
import AvatarNinjaLoad from "../load/avatars/AvatarNinjaLoad";
import AvatarRastaLoad from "../load/avatars/AvatarRastaLoad";
import AvatarSkeletonLoad from "../load/avatars/AvatarSkeletonLoad";
import AvatarWerewolfLoad from "../load/avatars/AvatarWerewolfLoad";
import AvatarWraithLoad from "../load/avatars/AvatarWraithLoad";
import AvatarYayoLoad from "../load/avatars/AvatarYayoLoad";
import AvatarZombieLoad from "../load/avatars/AvatarZombieLoad";

class AvatarManager {
    constructor() {
        // Avatares cargados actualmente
        this.loadedAvatars = new Set();
        
        // Cola de carga en segundo plano
        this.loadingQueue = [];
        
        // Estado de carga
        this.isLoading = false;
        
        // Avatares prioritarios (se cargan primero)
        this.priorityAvatars = [AvatarEnum.GATA, AvatarEnum.RASTA];
        
        // Avatar por defecto para fallback
        this.defaultAvatar = AvatarEnum.RASTA;
        
        // Mapeo de avatares a sus loaders
        this.avatarLoaders = {
            [AvatarEnum.BOOMER]: AvatarBoomerLoad,
            [AvatarEnum.BRUJITA]: AvatarBrujitaLoad,
            [AvatarEnum.CHOLO]: AvatarCholoLoad,
            [AvatarEnum.EMPOLLON]: AvatarEmpollonLoad,
            [AvatarEnum.GATA]: AvatarGataLoad,
            [AvatarEnum.GHOST]: AvatarGhostLoad,
            [AvatarEnum.INDIA]: AvatarIndiaLoad,
            [AvatarEnum.LILIAN]: AvatarLilianLoad,
            [AvatarEnum.MARSU]: AvatarMarsuLoad,
            [AvatarEnum.MODERN]: AvatarModernLoad,
            [AvatarEnum.NINJA]: AvatarNinjaLoad,
            [AvatarEnum.RASTA]: AvatarRastaLoad,
            [AvatarEnum.SKELETON]: AvatarSkeletonLoad,
            [AvatarEnum.WEREWOLF]: AvatarWerewolfLoad,
            [AvatarEnum.WRAITH]: AvatarWraithLoad,
            [AvatarEnum.YAYO]: AvatarYayoLoad,
            [AvatarEnum.ZOMBIE]: AvatarZombieLoad
        };
        
        // Referencia a la escena actual
        this.currentScene = null;
    }

    /**
     * Inicializa el manager con la escena actual
     */
    async init(scene) {
        this.currentScene = scene;
        
        // Inicializar el sistema de versionado
        assetVersionManager.init();
        
        // Inicializar el sistema de cache
        try {
            await cacheManager.init();
            
            // Pre-cargar blob URLs de avatares más populares para cambios ultra-rápidos
            await cacheManager.preloadHotAvatars();
            
            // Mostrar estadísticas del cache
            const stats = await cacheManager.getCacheStats();
        } catch (error) {
            // Error inicializando cache, funcionando sin persistencia
        }
    }

    /**
     * Carga solo los avatares prioritarios (Gata y Rasta)
     */
    loadPriorityAvatars(scene) {
        this.priorityAvatars.forEach(avatarId => {
            this.loadAvatar(scene, avatarId);
        });
    }

    /**
     * Carga un avatar específico
     */
    async loadAvatar(scene, avatarId) {
        if (this.loadedAvatars.has(avatarId)) {
            return Promise.resolve();
        }

        const loader = this.avatarLoaders[avatarId];
        if (!loader) {
            return Promise.reject();
        }

        // Verificar si el avatar está en cache
        const avatarName = this.getAvatarName(avatarId);
        const avatarVersion = assetVersionManager.getAvatarVersion(avatarId);
        const atlasKey = `${avatarName}_atlas`;
        const spreadsheetKey = `${avatarName}_spreadsheet`;
        const versionedAtlasKey = `${atlasKey}_v${avatarVersion}`;
        const versionedSpreadsheetKey = `${spreadsheetKey}_v${avatarVersion}`;
        
        // Intentar cargar desde cache primero
        const hasCachedAssets = await this.loadFromCache(scene, avatarId, versionedAtlasKey, versionedSpreadsheetKey, atlasKey, spreadsheetKey);
        
        if (hasCachedAssets) {
            // Para assets en cache, esperamos un poco para que se procesen y luego creamos animaciones
            return new Promise((resolve) => {
                const checkAndResolve = () => {
                    if (scene.textures.exists(atlasKey)) {
                        this.createAvatarAnimations(scene, avatarId);
                        this.loadedAvatars.add(avatarId);
                        resolve();
                    } else {
                        // Verificar de nuevo en 50ms
                        setTimeout(checkAndResolve, 50);
                    }
                };
                
                // Comenzar verificación inmediatamente
                checkAndResolve();
            });
        }

        // Si no está en cache, cargar desde red y cachear
        return new Promise((resolve, reject) => {
            try {
                // Cargar assets del avatar
                loader.main(scene, avatarId);
                
                // Escuchar cuando termine la carga
                scene.load.once('complete', async () => {
                    // Cachear los assets recién cargados
                    await this.cacheLoadedAssets(scene, avatarId, versionedAtlasKey, versionedSpreadsheetKey, atlasKey, spreadsheetKey);
                    
                    // Crear animaciones del avatar
                    this.createAvatarAnimations(scene, avatarId);
                    this.loadedAvatars.add(avatarId);
                    resolve();
                });

                scene.load.once('loaderror', (file) => {
                    reject();
                });

                // Iniciar carga
                if (!scene.load.isLoading()) {
                    scene.load.start();
                }

            } catch (error) {
                reject();
            }
        });
    }

    /**
     * Crea las animaciones para un avatar específico
     */
    createAvatarAnimations(scene, avatarId) {
        const config = window.avatars_config[avatarId];
        if (!config) {
            return;
        }

        Object.entries(config).forEach(([animationName, animData]) => {
            const animKey = `${avatarId}_${animationName}`;
            const atlasKey = animData.atlasKey;

            // Verificar si la animación ya existe
            if (scene.anims.exists(animKey)) {
                return;
            }

            try {
                scene.anims.create({
                    key: animKey,
                    frames: scene.anims.generateFrameNames(atlasKey, {
                        start: animData.start,
                        end: animData.end,
                        prefix: animData.prefix
                    }),
                    frameRate: animData.frameRate,
                    repeat: animData.repeat
                });
            } catch (error) {
                // Error creating animation
            }
        });
    }

    /**
     * Verifica si un avatar está cargado
     */
    isAvatarLoaded(avatarId) {
        return this.loadedAvatars.has(avatarId);
    }

    /**
     * Precarga texturas desde cache de forma agresiva (para cambios rápidos de avatar)
     */
    async preloadTextureFromCache(scene, avatarId) {
        const avatarName = this.getAvatarName(avatarId);
        const avatarVersion = assetVersionManager.getAvatarVersion(avatarId);
        const atlasKey = `${avatarName}_atlas`;
        const versionedAtlasKey = `${atlasKey}_v${avatarVersion}`;
        const versionedSpreadsheetKey = `${avatarName}_spreadsheet_v${avatarVersion}`;
        
        try {
            // Si ya existe en Phaser, no hacer nada
            if (scene.textures.exists(atlasKey)) {
                return true;
            }
            
            // Verificar cache
            const hasAtlas = await cacheManager.hasAsset(versionedAtlasKey, cacheManager.stores.ATLAS);
            const hasSpreadsheet = await cacheManager.hasAsset(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);
            
            if (!hasAtlas || !hasSpreadsheet) {
                return false;
            }
            
            // Usar fast blob URLs para carga ultra-rápida
            const atlasURL = await cacheManager.getFastBlobURL(versionedAtlasKey, cacheManager.stores.ATLAS);
            const spreadsheetURL = await cacheManager.getFastBlobURL(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);
            
            if (atlasURL && spreadsheetURL) {
                // Cargar de forma síncrona para que esté disponible inmediatamente
                scene.load.atlas(atlasKey, atlasURL, spreadsheetURL);
                
                if (!scene.load.isLoading()) {
                    scene.load.start();
                }
                
                // Cleanup URLs después (pero no los pre-cacheados)
                scene.load.once('complete', () => {
                    // Solo revocar si no están en el cache de blob URLs
                    if (!cacheManager.blobURLCache || !cacheManager.blobURLCache.has(versionedAtlasKey)) {
                        cacheManager.constructor.revokeBlobURL(atlasURL);
                    }
                    if (!cacheManager.blobURLCache || !cacheManager.blobURLCache.has(versionedSpreadsheetKey)) {
                        cacheManager.constructor.revokeBlobURL(spreadsheetURL);
                    }
                });
                
                return true;
            }
            
        } catch (error) {
            // Error precargando texture desde cache
        }
        
        return false;
    }

    /**
     * Obtiene el avatar a usar (original o fallback)
     */
    getAvatarToUse(requestedAvatarId) {
        if (this.isAvatarLoaded(requestedAvatarId)) {
            return requestedAvatarId;
        }
        
        // Si el avatar solicitado no está cargado, usar el por defecto
        return this.defaultAvatar;
    }

    /**
     * Añade un avatar a la cola de carga en segundo plano
     */
    queueAvatarForBackgroundLoading(avatarId) {
        if (this.isAvatarLoaded(avatarId) || this.loadingQueue.includes(avatarId)) {
            return;
        }

        this.loadingQueue.push(avatarId);
        
        // Iniciar carga en segundo plano si no está activa
        this.processBackgroundQueue();
    }

    /**
     * Procesa la cola de carga en segundo plano
     */
    async processBackgroundQueue() {
        if (this.isLoading || this.loadingQueue.length === 0 || !this.currentScene) {
            return;
        }

        this.isLoading = true;
        
        while (this.loadingQueue.length > 0) {
            const avatarId = this.loadingQueue.shift();
            
            if (!this.isAvatarLoaded(avatarId)) {
                try {
                    await this.loadAvatar(this.currentScene, avatarId);
                    
                    // Pequeña pausa para no bloquear el hilo principal
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    // Error cargando avatar en segundo plano
                }
            }
        }
        
        this.isLoading = false;
    }

    /**
     * Obtiene todos los avatares disponibles
     */
    getAllAvatars() {
        return Object.keys(this.avatarLoaders);
    }

    /**
     * Obtiene estadísticas de carga
     */
    getLoadingStats() {
        const totalAvatars = this.getAllAvatars().length;
        const loadedCount = this.loadedAvatars.size;
        const queuedCount = this.loadingQueue.length;
        
        return {
            total: totalAvatars,
            loaded: loadedCount,
            queued: queuedCount,
            percentage: Math.round((loadedCount / totalAvatars) * 100)
        };
    }

    /**
     * Limpia recursos cuando se cambia de escena
     */
    cleanup() {
        this.loadingQueue = [];
        this.isLoading = false;
        this.currentScene = null;
    }

    /**
     * Intenta cargar un avatar desde cache
     */
    async loadFromCache(scene, avatarId, versionedAtlasKey, versionedSpreadsheetKey, atlasKey, spreadsheetKey) {
        try {
            // Verificar si los assets están en cache con la versión correcta
            const hasAtlas = await cacheManager.hasAsset(versionedAtlasKey, cacheManager.stores.ATLAS);
            const hasSpreadsheet = await cacheManager.hasAsset(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);
            
            if (!hasAtlas || !hasSpreadsheet) {
                return false; // No están todos los assets necesarios o están desactualizados
            }

            // Verificar si ya está cargado en Phaser (para evitar cargas duplicadas)
            if (scene.textures.exists(atlasKey)) {
                return true;
            }

            // Cargar atlas desde cache
            const atlasAsset = await cacheManager.getAsset(versionedAtlasKey, cacheManager.stores.ATLAS);
            const spreadsheetAsset = await cacheManager.getAsset(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);

            if (!atlasAsset || !spreadsheetAsset) {
                return false;
            }

            // Convertir datos del cache a URLs utilizables (usando fast URLs si están disponibles)
            const atlasURL = await cacheManager.getFastBlobURL(versionedAtlasKey, cacheManager.stores.ATLAS);
            const spreadsheetURL = await cacheManager.getFastBlobURL(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);

            if (!atlasURL || !spreadsheetURL) {
                return false;
            }

            // Cargar en Phaser desde las blob URLs usando las claves sin versión
            scene.load.atlas(atlasKey, atlasURL, spreadsheetURL);
            
            // Limpiar URLs temporales cuando termine la carga (sin blocking)
            scene.load.once('complete', () => {
                // Solo revocar URLs que no están en el cache de blob URLs
                if (!cacheManager.blobURLCache || !cacheManager.blobURLCache.has(versionedAtlasKey)) {
                    cacheManager.constructor.revokeBlobURL(atlasURL);
                }
                if (!cacheManager.blobURLCache || !cacheManager.blobURLCache.has(versionedSpreadsheetKey)) {
                    cacheManager.constructor.revokeBlobURL(spreadsheetURL);
                }
            });

            // Iniciar carga de forma asíncrona (sin bloquear)
            if (!scene.load.isLoading()) {
                scene.load.start();
            }

            // Retornar inmediatamente para indicar que los assets están en cache
            // La carga real se completará de forma asíncrona
            return true;

        } catch (error) {
            return false;
        }
    }

    /**
     * Cachea los assets recién cargados desde la red (solo si no están ya en cache)
     */
    async cacheLoadedAssets(scene, avatarId, versionedAtlasKey, versionedSpreadsheetKey, atlasKey, spreadsheetKey) {
        try {
            // Verificar si ya están en cache para evitar re-cacheo innecesario
            const hasAtlas = await cacheManager.hasAsset(versionedAtlasKey, cacheManager.stores.ATLAS);
            const hasSpreadsheet = await cacheManager.hasAsset(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);
            
            if (hasAtlas && hasSpreadsheet) {
                return;
            }

            // Solo cachear si no están presentes
            if (!hasAtlas) {
                // Obtener las texturas cargadas
                const atlasTexture = scene.textures.get(atlasKey);
                const atlasSource = atlasTexture?.source?.[0];
                
                if (atlasSource && atlasSource.image) {
                    // Calcular tamaño teórico sin comprimir (RGBA = 4 bytes por pixel)
                    const theoreticalSize = atlasSource.width * atlasSource.height * 4;
                    
                    // Convertir imagen a blob para almacenar
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = atlasSource.width;
                    canvas.height = atlasSource.height;
                    ctx.drawImage(atlasSource.image, 0, 0);
                    
                    await new Promise(resolve => {
                        canvas.toBlob(async (blob) => {
                            if (blob) {
                                await cacheManager.storeAsset(
                                    versionedAtlasKey, 
                                    blob, 
                                    cacheManager.stores.ATLAS,
                                    { 
                                        type: 'atlas_image', 
                                        avatarId: avatarId,
                                        url: atlasSource.image.src,
                                        version: assetVersionManager.getAvatarVersion(avatarId)
                                    }
                                );
                            }
                            resolve();
                        }, 'image/png');
                    });
                }
            }

            if (!hasSpreadsheet) {
                // Intentar obtener y cachear el JSON del atlas (si está disponible)
                const atlasTexture = scene.textures.get(atlasKey);
                if (atlasTexture && atlasTexture.dataSource && atlasTexture.dataSource.length > 0) {
                    const jsonData = atlasTexture.dataSource[0];
                    if (jsonData) {
                        const jsonString = JSON.stringify(jsonData);
                        
                        await cacheManager.storeAsset(
                            versionedSpreadsheetKey,
                            jsonString,
                            cacheManager.stores.SPREADSHEET,
                            {
                                type: 'atlas_json',
                                avatarId: avatarId,
                                version: assetVersionManager.getAvatarVersion(avatarId)
                            }
                        );
                    }
                }
            }

        } catch (error) {
            // Error cacheando assets de avatar
        }
    }

    /**
     * Obtiene el nombre del avatar por su ID
     */
    getAvatarName(avatarId) {
        const avatarNames = {
            [AvatarEnum.BOOMER]: "boomer",
            [AvatarEnum.BRUJITA]: "brujita", 
            [AvatarEnum.CHOLO]: "cholo",
            [AvatarEnum.EMPOLLON]: "empollon",
            [AvatarEnum.GATA]: "gata",
            [AvatarEnum.GHOST]: "ghost",
            [AvatarEnum.INDIA]: "india",
            [AvatarEnum.LILIAN]: "lilian",
            [AvatarEnum.MARSU]: "marsu",
            [AvatarEnum.MODERN]: "modern",
            [AvatarEnum.NINJA]: "ninja",
            [AvatarEnum.RASTA]: "rasta",
            [AvatarEnum.SKELETON]: "skeleton",
            [AvatarEnum.WEREWOLF]: "werewolf",
            [AvatarEnum.WRAITH]: "wraith",
            [AvatarEnum.YAYO]: "yayo",
            [AvatarEnum.ZOMBIE]: "zombie"
        };
        return avatarNames[avatarId] || "unknown";
    }

    /**
     * Obtiene estadísticas del cache de avatares
     */
    async getCacheStats() {
        return await cacheManager.getCacheStats();
    }

    /**
     * Limpia el cache de avatares
     */
    async clearCache() {
        await cacheManager.clearCache();
    }
}

// Instancia singleton
const avatarManager = new AvatarManager();

export default avatarManager;
