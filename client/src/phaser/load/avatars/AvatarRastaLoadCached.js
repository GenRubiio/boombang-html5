import asset_spritesheet0_image from '@/assets/game/avatars/rasta/animations/spritesheet-0.webp';
import asset_spritesheet1_image from '@/assets/game/avatars/rasta/animations/spritesheet-1.webp';
import asset_atlas_json from '@/assets/game/avatars/rasta/animations/atlas.json';
import asset_cara_peque_image from '@/assets/game/avatars/rasta/cara_peque.svg';
import asset_cara_media_image from '@/assets/game/avatars/rasta/cara_media.svg';
import CachedAtlasLoader from '../CachedAtlasLoader';

class AvatarRastaLoadCached {
    /**
     * Carga el avatar Rasta usando el sistema de cache
     */
    static async main(gameScene, avatarId) {
        try {
            // Usar el loader con cache para el atlas principal
            await this.loadCachedAtlas(gameScene, avatarId);
            
            // Cargar assets adicionales (iconos de cara)
            this.loadAdditionalAssets(gameScene, avatarId);
            
            console.log(`🚀 Avatar Rasta ${avatarId} configurado con sistema de cache`);
        } catch (error) {
            console.warn(`⚠️ Error cargando avatar Rasta con cache, usando método tradicional:`, error);
            this.loadTraditional(gameScene, avatarId);
        }
    }

    /**
     * Carga el atlas principal usando el sistema de cache
     */
    static async loadCachedAtlas(gameScene, avatarId) {
        const atlasKey = 'rasta_atlas';
        
        // Verificar si ya existe en Phaser (podría estar cargado de sesión anterior)
        if (gameScene.textures.exists(atlasKey)) {
            console.log(`📦 Atlas ${atlasKey} ya disponible en Phaser`);
            return;
        }

        // Intentar cargar usando el loader con cache
        if (gameScene.load.cachedAtlas) {
            // Preparar datos del atlas para el cache
            const webpFiles = [asset_spritesheet0_image, asset_spritesheet1_image];
            
            // Actualizar referencias de imágenes en el JSON
            asset_atlas_json.textures.forEach((texture, i) => {
                texture.image = webpFiles[i];
            });

            // Convertir atlas JSON a URL temporal para el loader
            const atlasBlob = new Blob([JSON.stringify(asset_atlas_json)], { type: 'application/json' });
            const atlasURL = URL.createObjectURL(atlasBlob);

            // Usar multiatlas con cache (simulando comportamiento de atlas único)
            gameScene.load.multiatlas(atlasKey, asset_atlas_json);

            // Limpiar URL temporal
            gameScene.load.once('filecomplete-multiatlas-' + atlasKey, () => {
                URL.revokeObjectURL(atlasURL);
            });

        } else {
            // Fallback al método tradicional
            console.log(`⚠️ CachedAtlasLoader no disponible, usando método tradicional`);
            this.loadTraditional(gameScene, avatarId);
        }
    }

    /**
     * Carga assets adicionales (caras, iconos, etc.)
     */
    static loadAdditionalAssets(gameScene, avatarId) {
        // Cargar SVGs de caras (estos son pequeños y no necesitan cache complejo)
        gameScene.load.svg((avatarId + "_cara_peque"), asset_cara_peque_image);
        gameScene.load.svg((avatarId + "_cara_media"), asset_cara_media_image);
    }

    /**
     * Método de carga tradicional como fallback
     */
    static loadTraditional(gameScene, avatarId) {
        const webpFiles = [asset_spritesheet0_image, asset_spritesheet1_image];

        asset_atlas_json.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        
        gameScene.load.multiatlas('rasta_atlas', asset_atlas_json);
        gameScene.load.svg((avatarId + "_cara_peque"), asset_cara_peque_image);
        gameScene.load.svg((avatarId + "_cara_media"), asset_cara_media_image);
    }

    /**
     * Verifica si el avatar está disponible en cache
     */
    static async isAvailableInCache() {
        try {
            const cacheManager = await import('../../managers/CacheManager').then(m => m.default);
            const assetVersionManager = await import('../../managers/AssetVersionManager').then(m => m.default);
            
            const avatarId = 12; // RASTA
            const version = assetVersionManager.getAvatarVersion(avatarId);
            const versionedAtlasKey = `rasta_atlas_v${version}`;
            const versionedSpreadsheetKey = `rasta_spreadsheet_v${version}`;
            
            const hasAtlas = await cacheManager.hasAsset(versionedAtlasKey, cacheManager.stores.ATLAS);
            const hasSpreadsheet = await cacheManager.hasAsset(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);
            
            return hasAtlas && hasSpreadsheet;
        } catch (error) {
            return false;
        }
    }

    /**
     * Obtiene estadísticas específicas del avatar Rasta en cache
     */
    static async getCacheStats() {
        try {
            const cacheManager = await import('../../managers/CacheManager').then(m => m.default);
            const assetVersionManager = await import('../../managers/AssetVersionManager').then(m => m.default);
            
            const avatarId = 12; // RASTA
            const version = assetVersionManager.getAvatarVersion(avatarId);
            const versionedAtlasKey = `rasta_atlas_v${version}`;
            const versionedSpreadsheetKey = `rasta_spreadsheet_v${version}`;
            
            const atlasAsset = await cacheManager.getAsset(versionedAtlasKey, cacheManager.stores.ATLAS);
            const spreadsheetAsset = await cacheManager.getAsset(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);
            
            return {
                cached: !!(atlasAsset && spreadsheetAsset),
                atlasSize: atlasAsset?.size || 0,
                spreadsheetSize: spreadsheetAsset?.size || 0,
                totalSize: (atlasAsset?.size || 0) + (spreadsheetAsset?.size || 0),
                version: version,
                lastAccess: Math.max(atlasAsset?.timestamp || 0, spreadsheetAsset?.timestamp || 0)
            };
        } catch (error) {
            return { cached: false, error: error.message };
        }
    }

    /**
     * Limpia el cache específico del avatar Rasta
     */
    static async clearCache() {
        try {
            const cacheManager = await import('../../managers/CacheManager').then(m => m.default);
            const assetVersionManager = await import('../../managers/AssetVersionManager').then(m => m.default);
            
            const avatarId = 12; // RASTA
            const version = assetVersionManager.getAvatarVersion(avatarId);
            const versionedAtlasKey = `rasta_atlas_v${version}`;
            const versionedSpreadsheetKey = `rasta_spreadsheet_v${version}`;
            
            await cacheManager.removeAsset(versionedAtlasKey, cacheManager.stores.ATLAS);
            await cacheManager.removeAsset(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);
            
            console.log('🗑️ Cache del avatar Rasta limpiado');
            return true;
        } catch (error) {
            console.warn('⚠️ Error limpiando cache del avatar Rasta:', error);
            return false;
        }
    }
}

export default AvatarRastaLoadCached;