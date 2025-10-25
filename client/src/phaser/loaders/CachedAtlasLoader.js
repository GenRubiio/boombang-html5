/**
 * CachedAtlasLoader - Loader personalizado para Phaser que maneja atlas desde cache
 * Extiende la funcionalidad del loader de atlas para integrar el sistema de cache
 */
class CachedAtlasLoader {
    constructor() {
        this.loadedFromCache = new Set();
        this.pendingLoads = new Map();
    }

    /**
     * Registra el loader personalizado en Phaser
     */
    static registerWithPhaser(scene) {
        // Extender el loader existente de Phaser con funcionalidad de cache
        const originalAtlasLoader = scene.load.atlas;

        scene.load.cachedAtlas = function (key, textureURL, atlasURL, textureXhrSettings, atlasXhrSettings) {
            return CachedAtlasLoader.loadCachedAtlas.call(this, key, textureURL, atlasURL, textureXhrSettings, atlasXhrSettings);
        };

        // Mantener referencia al loader original para fallback
        scene.load._originalAtlas = originalAtlasLoader;
    }

    /**
     * Carga un atlas usando el sistema de cache como primera opción
     */
    static async loadCachedAtlas(key, textureURL, atlasURL, textureXhrSettings, atlasXhrSettings) {
        const scene = this.scene;
        const cacheManager = await import('../managers/CacheManager').then(m => m.default);
        const assetVersionManager = await import('../managers/AssetVersionManager').then(m => m.default);

        try {
            // Generar claves versionadas para el cache
            const avatarId = CachedAtlasLoader.extractAvatarIdFromKey(key);
            const version = avatarId ? assetVersionManager.getAvatarVersion(avatarId) : 'unknown';
            const versionedAtlasKey = `${key}_v${version}`;
            const versionedSpreadsheetKey = `${key.replace('_atlas', '_spreadsheet')}_v${version}`;

            // Intentar cargar desde cache primero
            const loadedFromCache = await CachedAtlasLoader.loadFromCache(
                scene,
                key,
                versionedAtlasKey,
                versionedSpreadsheetKey,
                cacheManager
            );

            if (loadedFromCache) {
                return scene.load;
            }

            // Si no está en cache, usar el loader original de Phaser
            const loadResult = scene.load._originalAtlas.call(scene.load, key, textureURL, atlasURL, textureXhrSettings, atlasXhrSettings);

            // Configurar callback para cachear después de la carga
            CachedAtlasLoader.setupCacheCallback(scene, key, versionedAtlasKey, versionedSpreadsheetKey, avatarId, cacheManager, assetVersionManager);

            return loadResult;

        } catch (error) {
            // Fallback al loader original
            return scene.load._originalAtlas.call(scene.load, key, textureURL, atlasURL, textureXhrSettings, atlasXhrSettings);
        }
    }

    /**
     * Intenta cargar un atlas desde cache
     */
    static async loadFromCache(scene, key, versionedAtlasKey, versionedSpreadsheetKey, cacheManager) {
        try {
            // Verificar si los assets están en cache
            const hasAtlas = await cacheManager.hasAsset(versionedAtlasKey, cacheManager.stores.ATLAS);
            const hasSpreadsheet = await cacheManager.hasAsset(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);

            if (!hasAtlas || !hasSpreadsheet) {
                return false;
            }

            // Obtener URLs de blob para los assets
            const atlasURL = await cacheManager.getAssetBlobURL(versionedAtlasKey, cacheManager.stores.ATLAS);
            const spreadsheetURL = await cacheManager.getAssetBlobURL(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);

            if (!atlasURL || !spreadsheetURL) {
                return false;
            }

            // Cargar usando las blob URLs
            scene.load._originalAtlas.call(scene.load, key, atlasURL, spreadsheetURL);

            // Configurar limpieza de URLs después de la carga
            const cleanup = () => {
                cacheManager.constructor.revokeBlobURL(atlasURL);
                cacheManager.constructor.revokeBlobURL(spreadsheetURL);
            };

            scene.load.once('filecomplete-atlas-' + key, cleanup);
            scene.load.once('loaderror', cleanup);

            return true;

        } catch (error) {
            return false;
        }
    }

    /**
     * Configura callback para cachear assets después de cargar desde red
     */
    static setupCacheCallback(scene, key, versionedAtlasKey, versionedSpreadsheetKey, avatarId, cacheManager, assetVersionManager) {
        const cacheAfterLoad = async () => {
            try {
                await CachedAtlasLoader.cacheLoadedAtlas(
                    scene,
                    key,
                    versionedAtlasKey,
                    versionedSpreadsheetKey,
                    avatarId,
                    cacheManager,
                    assetVersionManager
                );
            } catch (error) {
            }
        };

        scene.load.once('filecomplete-atlas-' + key, cacheAfterLoad);
    }

    /**
     * Cachea un atlas después de cargarlo desde la red
     */
    static async cacheLoadedAtlas(scene, key, versionedAtlasKey, versionedSpreadsheetKey, avatarId, cacheManager, assetVersionManager) {
        try {
            const atlasTexture = scene.textures.get(key);
            const atlasSource = atlasTexture?.source?.[0];

            if (atlasSource && atlasSource.image) {
                // Crear canvas para convertir imagen a blob
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = atlasSource.width;
                canvas.height = atlasSource.height;
                ctx.drawImage(atlasSource.image, 0, 0);

                // Convertir a blob y almacenar
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
                                    version: assetVersionManager.getAvatarVersion(avatarId),
                                    cachedAt: Date.now()
                                }
                            );
                        }
                        resolve();
                    }, 'image/png');
                });
            }

            // Cachear JSON del atlas si está disponible
            if (atlasTexture && atlasTexture.dataSource && atlasTexture.dataSource.length > 0) {
                const jsonData = atlasTexture.dataSource[0];
                if (jsonData) {
                    await cacheManager.storeAsset(
                        versionedSpreadsheetKey,
                        JSON.stringify(jsonData),
                        cacheManager.stores.SPREADSHEET,
                        {
                            type: 'atlas_json',
                            avatarId: avatarId,
                            version: assetVersionManager.getAvatarVersion(avatarId),
                            cachedAt: Date.now()
                        }
                    );
                }
            }

        } catch (error) {
        }
    }

    /**
     * Extrae el ID del avatar desde la clave del atlas
     */
    static extractAvatarIdFromKey(key) {
        // Mapeo de nombres de avatar a IDs
        const avatarNames = {
            'boomer_atlas': 1,
            'brujita_atlas': 2,
            'cholo_atlas': 3,
            'empollon_atlas': 4,
            'gata_atlas': 5,
            'ghost_atlas': 6,
            'india_atlas': 7,
            'lilian_atlas': 8,
            'marsu_atlas': 9,
            'modern_atlas': 10,
            'ninja_atlas': 11,
            'rasta_atlas': 12,
            'skeleton_atlas': 13,
            'werewolf_atlas': 14,
            'wraith_atlas': 15,
            'yayo_atlas': 16,
            'zombie_atlas': 17
        };

        return avatarNames[key] || null;
    }

    /**
     * Precarga múltiples atlas desde cache de manera eficiente
     */
    static async preloadMultipleFromCache(scene, atlasKeys) {
        const loadPromises = atlasKeys.map(key => {
            return CachedAtlasLoader.loadCachedAtlas.call(scene.load, key, null, null);
        });

        try {
            await Promise.allSettled(loadPromises);
        } catch (error) {
        }
    }

    /**
     * Obtiene estadísticas de cache específicas para atlas
     */
    static async getAtlaseCacheStats() {
        try {
            const cacheManager = await import('../managers/CacheManager').then(m => m.default);
            const stats = await cacheManager.getCacheStats();

            return {
                atlasCount: stats.stores.ATLAS?.count || 0,
                atlasSize: stats.stores.ATLAS?.size || 0,
                spreadsheetCount: stats.stores.SPREADSHEET?.count || 0,
                spreadsheetSize: stats.stores.SPREADSHEET?.size || 0,
                totalSize: stats.totalSize,
                usagePercentage: stats.usagePercentage
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Limpia atlas específicos del cache
     */
    static async clearAtlasCache(avatarIds = []) {
        try {
            const cacheManager = await import('../managers/CacheManager').then(m => m.default);
            const assetVersionManager = await import('../managers/AssetVersionManager').then(m => m.default);

            for (const avatarId of avatarIds) {
                const avatarName = CachedAtlasLoader.getAvatarNameById(avatarId);
                if (avatarName) {
                    const version = assetVersionManager.getAvatarVersion(avatarId);
                    const versionedAtlasKey = `${avatarName}_atlas_v${version}`;
                    const versionedSpreadsheetKey = `${avatarName}_spreadsheet_v${version}`;

                    await cacheManager.removeAsset(versionedAtlasKey, cacheManager.stores.ATLAS);
                    await cacheManager.removeAsset(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);

                }
            }
        } catch (error) {
        }
    }

    /**
     * Obtiene el nombre del avatar por su ID
     */
    static getAvatarNameById(avatarId) {
        const avatarNames = {
            1: 'boomer',
            2: 'brujita',
            3: 'cholo',
            4: 'empollon',
            5: 'gata',
            6: 'ghost',
            7: 'india',
            8: 'lilian',
            9: 'marsu',
            10: 'modern',
            11: 'ninja',
            12: 'rasta',
            13: 'skeleton',
            14: 'werewolf',
            15: 'wraith',
            16: 'yayo',
            17: 'zombie'
        };

        return avatarNames[avatarId] || null;
    }
}

export default CachedAtlasLoader;