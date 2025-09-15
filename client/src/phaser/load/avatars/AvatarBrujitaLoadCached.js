import asset_spritesheet0_image from '@/assets/game/avatars/brujita/animations/spritesheet-0.webp';
import asset_spritesheet1_image from '@/assets/game/avatars/brujita/animations/spritesheet-1.webp';
import asset_atlas_json from '@/assets/game/avatars/brujita/animations/atlas.json';
import asset_cara_peque_image from '@/assets/game/avatars/brujita/cara_peque.svg';
import asset_cara_media_image from '@/assets/game/avatars/brujita/cara_media.svg';
import CachedAtlasLoader from '../CachedAtlasLoader';

class AvatarBrujitaLoadCached {
    /**
     * Carga el avatar Brujita usando el sistema de cache
     */
    static async main(gameScene, avatarId) {
        try {
            await this.loadCachedAtlas(gameScene, avatarId);
            this.loadAdditionalAssets(gameScene, avatarId);
            console.log(`🚀 Avatar Brujita ${avatarId} configurado con sistema de cache`);
        } catch (error) {
            console.warn(`⚠️ Error cargando avatar Brujita con cache, usando método tradicional:`, error);
            this.loadTraditional(gameScene, avatarId);
        }
    }

    static async loadCachedAtlas(gameScene, avatarId) {
        const atlasKey = 'brujita_atlas';
        
        if (gameScene.textures.exists(atlasKey)) {
            console.log(`📦 Atlas ${atlasKey} ya disponible en Phaser`);
            return;
        }

        if (gameScene.load.cachedAtlas) {
            const webpFiles = [asset_spritesheet0_image, asset_spritesheet1_image];
            asset_atlas_json.textures.forEach((texture, i) => {
                texture.image = webpFiles[i];
            });

            gameScene.load.multiatlas(atlasKey, asset_atlas_json);
        } else {
            this.loadTraditional(gameScene, avatarId);
        }
    }

    static loadAdditionalAssets(gameScene, avatarId) {
        gameScene.load.svg((avatarId + "_cara_peque"), asset_cara_peque_image);
        gameScene.load.svg((avatarId + "_cara_media"), asset_cara_media_image);
    }

    static loadTraditional(gameScene, avatarId) {
        const webpFiles = [asset_spritesheet0_image, asset_spritesheet1_image];
        asset_atlas_json.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        
        gameScene.load.multiatlas('brujita_atlas', asset_atlas_json);
        gameScene.load.svg((avatarId + "_cara_peque"), asset_cara_peque_image);
        gameScene.load.svg((avatarId + "_cara_media"), asset_cara_media_image);
    }

    static async isAvailableInCache() {
        try {
            const cacheManager = await import('../../managers/CacheManager').then(m => m.default);
            const assetVersionManager = await import('../../managers/AssetVersionManager').then(m => m.default);
            
            const avatarId = 2; // BRUJITA
            const version = assetVersionManager.getAvatarVersion(avatarId);
            const hasAtlas = await cacheManager.hasAsset(`brujita_atlas_v${version}`, cacheManager.stores.ATLAS);
            const hasSpreadsheet = await cacheManager.hasAsset(`brujita_spreadsheet_v${version}`, cacheManager.stores.SPREADSHEET);
            
            return hasAtlas && hasSpreadsheet;
        } catch (error) {
            return false;
        }
    }
}

export default AvatarBrujitaLoadCached;