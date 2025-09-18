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
        // Atlas en carga para evitar duplicados
        this.inFlightAtlasLoads = new Set();
        
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

    // Calcula una firma corta del multiatlas para diferenciar calidades/variantes (x1, high_quality, etc.)
    computeAtlasSignature(atlasJson) {
        try {
            if (!atlasJson || !Array.isArray(atlasJson.textures)) return 'nosig';
            const baseName = (p) => {
                try { return String(p).split('?')[0].split('#')[0].split('/').pop(); } catch { return String(p); }
            };
            const parts = atlasJson.textures.map(t => {
                const img = baseName(t?.image || '');
                const w = t?.size?.w || 0;
                const h = t?.size?.h || 0;
                const f = Array.isArray(t?.frames) ? t.frames.length : 0;
                return `${img}:${w}x${h}:${f}`;
            }).join(';');
            // hash djb2 simple
            let hash = 5381;
            for (let i = 0; i < parts.length; i++) {
                hash = ((hash << 5) + hash) + parts.charCodeAt(i);
                hash |= 0; // 32-bit
            }
            return (hash >>> 0).toString(16);
        } catch {
            return 'nosig';
        }
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
    const versionedAtlasKey = `${atlasKey}_v${avatarVersion}`; // base for page keys: `${versionedAtlasKey}_p{index}`
    const versionedSpreadsheetKey = `${spreadsheetKey}_v${avatarVersion}`; // cached multiatlas JSON
        
        // PRIMERO: Verificar si ya está cargado en Phaser
        if (scene.textures.exists(atlasKey)) {
            //console.log(`✅ Avatar ${avatarId} ya existe en Phaser, marcando como cargado`);
            this.createAvatarAnimations(scene, avatarId);
            this.loadedAvatars.add(avatarId);
            return Promise.resolve();
        }
        // Si ya hay una carga en curso para este atlas, esperar a que aparezca
        if (this.inFlightAtlasLoads.has(atlasKey)) {
            return new Promise((resolve) => {
                const check = () => {
                    if (scene.textures.exists(atlasKey)) {
                        this.createAvatarAnimations(scene, avatarId);
                        this.loadedAvatars.add(avatarId);
                        resolve();
                    } else {
                        setTimeout(check, 50);
                    }
                };
                check();
            });
        }
        
    // Intentar cargar desde cache
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
                // Marcar in-flight para evitar cargas duplicadas
                this.inFlightAtlasLoads.add(atlasKey);
                // Cargar assets del avatar y capturar el JSON del multiatlas utilizado
                const loaderAtlasJson = loader.main(scene, avatarId) || null;
                
                // Escuchar cuando termine la carga
                scene.load.once('complete', async () => {
                    // Cachear los assets recién cargados (todas las páginas del multiatlas + JSON exacto del loader)
                    await this.cacheLoadedAssets(scene, avatarId, versionedAtlasKey, versionedSpreadsheetKey, atlasKey, spreadsheetKey, loaderAtlasJson);
                    
                    // Crear animaciones del avatar
                    this.createAvatarAnimations(scene, avatarId);
                    this.loadedAvatars.add(avatarId);
                    this.inFlightAtlasLoads.delete(atlasKey);
                    resolve();
                });

                scene.load.once('loaderror', (file) => {
                    this.inFlightAtlasLoads.delete(atlasKey);
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
            // Si ya está en curso, no duplicar la carga
            if (this.inFlightAtlasLoads.has(atlasKey)) {
                return true;
            }

            // Cargar JSON del multiatlas desde cache
            const jsonAsset = await cacheManager.getAsset(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);
            if (!jsonAsset || !jsonAsset.data) return false;
            const atlasJson = await cacheManager.convertBlobToData(jsonAsset.data, 'json');
            if (!atlasJson || !Array.isArray(atlasJson.textures)) return false;

            // Firma del atlas y utilidad para basename
            const sig = this.computeAtlasSignature(atlasJson);
            const sigAtlasKey = `${versionedAtlasKey}#${sig}`;
            const baseName = (p) => {
                try { return String(p).split('?')[0].split('#')[0].split('/').pop(); } catch { return String(p); }
            };

            // Verificar y obtener URLs para todas las páginas por nombre con fallback
            const pageUrls = [];
            for (let i = 0; i < atlasJson.textures.length; i++) {
                const imgName = baseName(atlasJson.textures[i]?.image || `p${i}`);
                const sigNameKey = `${sigAtlasKey}::${imgName}`;
                const nameKey = `${versionedAtlasKey}::${imgName}`;
                const indexKey = `${versionedAtlasKey}_p${i}`;

                let url = null;
                if (await cacheManager.hasAsset(sigNameKey, cacheManager.stores.ATLAS)) {
                    url = await cacheManager.getFastBlobURL(sigNameKey, cacheManager.stores.ATLAS);
                } else if (await cacheManager.hasAsset(nameKey, cacheManager.stores.ATLAS)) {
                    url = await cacheManager.getFastBlobURL(nameKey, cacheManager.stores.ATLAS);
                } else if (await cacheManager.hasAsset(indexKey, cacheManager.stores.ATLAS)) {
                    url = await cacheManager.getFastBlobURL(indexKey, cacheManager.stores.ATLAS);
                } else {
                    return false;
                }
                if (!url) return false;
                pageUrls.push(url);
            }

            // Construir JSON con URLs locales
            const jsonWithBlobUrls = { ...atlasJson, textures: atlasJson.textures.map((t, i) => ({ ...t, image: pageUrls[i] })) };

            // Cargar de forma síncrona para que esté disponible inmediatamente
            this.inFlightAtlasLoads.add(atlasKey);
            scene.load.multiatlas(atlasKey, jsonWithBlobUrls);

            if (!scene.load.isLoading()) {
                scene.load.start();
            }

            // Cleanup URLs después (pero no los pre-cacheados)
            scene.load.once('complete', () => {
                for (let i = 0; i < pageUrls.length; i++) {
                    if (!cacheManager.blobURLCache) {
                        cacheManager.constructor.revokeBlobURL(pageUrls[i]);
                    }
                }
                this.inFlightAtlasLoads.delete(atlasKey);
            });

            return true;

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
            // PRIMERO: Verificar si ya está cargado en Phaser (más importante que cache)
            if (scene.textures.exists(atlasKey)) {
                //console.log(`✅ Atlas ${atlasKey} ya existe en Phaser, evitando carga duplicada`);
                return true;
            }
            // Evitar cargas duplicadas si ya está en curso
            if (this.inFlightAtlasLoads.has(atlasKey)) {
                return true;
            }

            // Cargar JSON del multiatlas desde cache
            const jsonAsset = await cacheManager.getAsset(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);
            if (!jsonAsset || !jsonAsset.data) {
                return false;
            }
            const atlasJson = await cacheManager.convertBlobToData(jsonAsset.data, 'json');
            if (!atlasJson || !Array.isArray(atlasJson.textures)) {
                return false; // JSON inválido
            }

            // Firma del atlas para ligar páginas correctas a este JSON concreto
            const sig = this.computeAtlasSignature(atlasJson);
            const sigAtlasKey = `${versionedAtlasKey}#${sig}`;

            // Función para obtener el basename de una ruta/URL
            const baseName = (p) => {
                try { return String(p).split('?')[0].split('#')[0].split('/').pop(); } catch { return String(p); }
            };

            // Obtener blob URLs para todas las páginas por nombre de imagen (en paralelo)
            let usedLegacyOnly = true; // si todas las páginas vienen de claves sin firma, forzar recarga
            const pageUrls = await Promise.all(atlasJson.textures.map(async (tex, i) => {
                const imgName = baseName(tex?.image || `p${i}`);
                const nameKey = `${versionedAtlasKey}::${imgName}`;
                const sigNameKey = `${sigAtlasKey}::${imgName}`;
                const indexKey = `${versionedAtlasKey}_p${i}`; // compat antigua

                if (await cacheManager.hasAsset(sigNameKey, cacheManager.stores.ATLAS)) {
                    usedLegacyOnly = false;
                    return await cacheManager.getFastBlobURL(sigNameKey, cacheManager.stores.ATLAS);
                }
                if (await cacheManager.hasAsset(nameKey, cacheManager.stores.ATLAS)) {
                    usedLegacyOnly = false;
                    return await cacheManager.getFastBlobURL(nameKey, cacheManager.stores.ATLAS);
                }
                if (await cacheManager.hasAsset(indexKey, cacheManager.stores.ATLAS)) {
                    return await cacheManager.getFastBlobURL(indexKey, cacheManager.stores.ATLAS);
                }
                return null;
            }));
            if (pageUrls.some(u => !u)) return false;

            // Si todas las páginas vienen de claves legadas por índice, mejor forzar una recarga desde red
            // para regenerar el cache con claves por nombre + firma y evitar desalineaciones
            if (usedLegacyOnly) {
                //console.warn(`[AvatarManager] Solo se encontraron páginas legacy (por índice) para ${atlasKey}. Forzando recarga de red para regenerar cache correcto.`);
                return false;
            }

            // VERIFICAR UNA VEZ MÁS antes de cargar (doble check por si acaso)
            if (scene.textures.exists(atlasKey)) {
                //console.log(`✅ Atlas ${atlasKey} apareció durante carga, evitando duplicado`);
                return true;
            }

            //console.log(`🔄 Cargando ${atlasKey} desde cache (multiatlas)...`);

            // Construir JSON con URLs locales
            const jsonWithBlobUrls = { ...atlasJson, textures: atlasJson.textures.map((t, i) => ({ ...t, image: pageUrls[i] })) };

            // Cargar en Phaser desde JSON + blob URLs
            this.inFlightAtlasLoads.add(atlasKey);
            scene.load.multiatlas(atlasKey, jsonWithBlobUrls);

            // Limpiar URLs temporales cuando termine la carga (sin blocking)
            scene.load.once('complete', () => {
                for (let i = 0; i < pageUrls.length; i++) {
                    // No conocemos el nombre aquí, solo liberamos si no está cacheada
                    if (!cacheManager.blobURLCache) {
                        cacheManager.constructor.revokeBlobURL(pageUrls[i]);
                    }
                }
                this.inFlightAtlasLoads.delete(atlasKey);
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
    async cacheLoadedAssets(scene, avatarId, versionedAtlasKey, versionedSpreadsheetKey, atlasKey, spreadsheetKey, jsonFromLoader = null) {
        try {
            // Obtener la textura del multiatlas
            const atlasTexture = scene.textures.get(atlasKey);
            if (!atlasTexture) return;

            // 1) Cachear JSON del multiatlas si no existe
            const hasSpreadsheet = await cacheManager.hasAsset(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);
            if (!hasSpreadsheet) {
                // Preferir el JSON que devuelve el loader (exacto al original)
                let jsonData = jsonFromLoader || null;
                
                // Si no lo tenemos, intentar otras fuentes
                if (!jsonData) {
                    try { jsonData = scene.cache.json?.get?.(atlasKey) || null; } catch (_) {}
                }
                if (!jsonData && atlasTexture.dataSource) {
                    jsonData = Array.isArray(atlasTexture.dataSource) ? atlasTexture.dataSource[0] : atlasTexture.dataSource;
                }
                if (!jsonData) {
                    jsonData = this.reconstructMultiAtlasJSON(atlasTexture);
                }
                if (jsonData) {
                    await cacheManager.storeAsset(
                        versionedSpreadsheetKey,
                        JSON.stringify(jsonData),
                        cacheManager.stores.SPREADSHEET,
                        { type: 'atlas_json', avatarId }
                    );
                }
            }

            // 2) Cachear todas las páginas del multiatlas basadas en los nombres originales del loader JSON
            const sources = atlasTexture?.source || [];
            const useJson = Array.isArray(jsonFromLoader?.textures) ? jsonFromLoader : null;
            const sig = this.computeAtlasSignature(useJson || (await cacheManager.convertBlobToData((await cacheManager.getAsset(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET))?.data, 'json')) || null);
            const sigAtlasKey = `${versionedAtlasKey}#${sig}`;

            if (useJson) {
                for (let i = 0; i < useJson.textures.length; i++) {
                    const imgPath = useJson.textures[i]?.image;
                    if (!imgPath) continue;
                    const imgName = imgPath.split('?')[0].split('#')[0].split('/').pop();
                    const pageKey = `${versionedAtlasKey}::${imgName}`;
                    const sigPageKey = `${sigAtlasKey}::${imgName}`;
                    const hasPage = await cacheManager.hasAsset(sigPageKey, cacheManager.stores.ATLAS) || await cacheManager.hasAsset(pageKey, cacheManager.stores.ATLAS);
                    if (hasPage) continue;

                    let blob = null;
                    try {
                        const resp = await fetch(imgPath);
                        if (resp.ok) blob = await resp.blob();
                    } catch (_) { /* noop */ }

                    // Fallback a canvas por índice si fetch falla
                    if (!blob && sources[i]?.image) {
                        try {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            canvas.width = sources[i].width;
                            canvas.height = sources[i].height;
                            ctx.drawImage(sources[i].image, 0, 0);
                            blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                        } catch (_) { /* noop */ }
                    }

                    if (blob) {
                        // Clave preferida: ligada a firma (almacenar una sola vez)
                        if (!(await cacheManager.hasAsset(sigPageKey, cacheManager.stores.ATLAS))) {
                            await cacheManager.storeAsset(sigPageKey, blob, cacheManager.stores.ATLAS, { type: 'atlas_page', avatarId, sig });
                        }
                        // Crear alias para nombre y para índice (sin duplicar blobs)
                        await cacheManager.setAlias(pageKey, sigPageKey, cacheManager.stores.ATLAS);
                        await cacheManager.setAlias(`${versionedAtlasKey}_p${i}`, sigPageKey, cacheManager.stores.ATLAS);
                    }
                }
            } else {
                // Último recurso: por índice
                for (let i = 0; i < sources.length; i++) {
                    const pageKey = `${versionedAtlasKey}::p${i}`;
                    const sigPageKey = `${sigAtlasKey}::p${i}`;
                    // Si ya hay canónica, solo asegura alias
                    if (await cacheManager.hasAsset(sigPageKey, cacheManager.stores.ATLAS)) {
                        await cacheManager.setAlias(pageKey, sigPageKey, cacheManager.stores.ATLAS);
                        await cacheManager.setAlias(`${versionedAtlasKey}_p${i}`, sigPageKey, cacheManager.stores.ATLAS);
                        continue;
                    }

                    const srcImg = sources[i]?.image;
                    if (!srcImg) continue;

                    let blob = null;
                    try {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = sources[i].width;
                        canvas.height = sources[i].height;
                        ctx.drawImage(srcImg, 0, 0);
                        blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                    } catch (_) { /* noop */ }
                    if (blob) {
                        await cacheManager.storeAsset(sigPageKey, blob, cacheManager.stores.ATLAS, { type: 'atlas_page', avatarId, sig });
                        await cacheManager.setAlias(pageKey, sigPageKey, cacheManager.stores.ATLAS);
                        await cacheManager.setAlias(`${versionedAtlasKey}_p${i}`, sigPageKey, cacheManager.stores.ATLAS);
                    }
                }
            }

        } catch (error) {
            // Error cacheando assets de avatar
        }
    }

    /**
     * Reconstruye un JSON de multiatlas básico desde el Texture de Phaser
     */
    reconstructMultiAtlasJSON(atlasTexture) {
        try {
            const sources = atlasTexture?.source || [];
            const frames = atlasTexture.getFrameNames ? atlasTexture.getFrameNames() : Object.keys(atlasTexture.frames || {});

            // Mapear frames por índice de página
            const pages = Array.from({ length: sources.length }, () => []);

            for (const fname of frames) {
                if (!fname || fname === '__BASE' || fname === '__EMPTY') continue;
                const f = atlasTexture.get(fname);
                if (!f) continue;

                const pageIndex = f.sourceIndex ?? 0;
                const entry = {
                    filename: fname,
                    frame: { x: f.cutX || f.x || 0, y: f.cutY || f.y || 0, w: f.cutWidth || f.width || 0, h: f.cutHeight || f.height || 0 },
                    rotated: false,
                    trimmed: false,
                    spriteSourceSize: { x: 0, y: 0, w: f.width || 0, h: f.height || 0 },
                    sourceSize: { w: f.width || 0, h: f.height || 0 },
                    pivot: { x: 0.5, y: 0.5 }
                };
                if (pages[pageIndex]) pages[pageIndex].push(entry);
            }

            const textures = pages.map((frames, i) => ({ image: `spritesheet-${i}.webp`, frames }));
            return { textures };
        } catch (_) {
            return null;
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
