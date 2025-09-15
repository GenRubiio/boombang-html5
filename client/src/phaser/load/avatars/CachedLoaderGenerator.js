/**
 * Generador de clases AvatarLoadCached para todos los personajes
 * Este script crea las versiones cached de todos los loaders de avatares
 */

const avatarData = [
    { id: 1, name: 'boomer', className: 'AvatarBoomerLoadCached', hasThreeSpritesheets: false },
    { id: 2, name: 'brujita', className: 'AvatarBrujitaLoadCached', hasThreeSpritesheets: false },
    { id: 3, name: 'cholo', className: 'AvatarCholoLoadCached', hasThreeSpritesheets: false },
    { id: 4, name: 'empollon', className: 'AvatarEmpollonLoadCached', hasThreeSpritesheets: false },
    { id: 5, name: 'gata', className: 'AvatarGataLoadCached', hasThreeSpritesheets: true },
    { id: 6, name: 'ghost', className: 'AvatarGhostLoadCached', hasThreeSpritesheets: false },
    { id: 7, name: 'india', className: 'AvatarIndiaLoadCached', hasThreeSpritesheets: false },
    { id: 8, name: 'lilian', className: 'AvatarLilianLoadCached', hasThreeSpritesheets: false },
    { id: 9, name: 'marsu', className: 'AvatarMarsuLoadCached', hasThreeSpritesheets: false },
    { id: 10, name: 'modern', className: 'AvatarModernLoadCached', hasThreeSpritesheets: false },
    { id: 11, name: 'ninja', className: 'AvatarNinjaLoadCached', hasThreeSpritesheets: false },
    { id: 12, name: 'rasta', className: 'AvatarRastaLoadCached', hasThreeSpritesheets: false },
    { id: 13, name: 'skeleton', className: 'AvatarSkeletonLoadCached', hasThreeSpritesheets: false },
    { id: 14, name: 'werewolf', className: 'AvatarWerewolfLoadCached', hasThreeSpritesheets: false },
    { id: 15, name: 'wraith', className: 'AvatarWraithLoadCached', hasThreeSpritesheets: false },
    { id: 16, name: 'yayo', className: 'AvatarYayoLoadCached', hasThreeSpritesheets: false },
    { id: 17, name: 'zombie', className: 'AvatarZombieLoadCached', hasThreeSpritesheets: false }
];

/**
 * Genera el código de una clase AvatarLoadCached
 */
function generateCachedLoaderClass(avatar) {
    const { id, name, className, hasThreeSpritesheets } = avatar;
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    
    // Determinar imports de spritesheets
    const spritesheetImports = hasThreeSpritesheets 
        ? `import asset_spritesheet0_image from '@/assets/game/avatars/${name}/animations/spritesheet-0.webp';
import asset_spritesheet1_image from '@/assets/game/avatars/${name}/animations/spritesheet-1.webp';
import asset_spritesheet2_image from '@/assets/game/avatars/${name}/animations/spritesheet-2.webp';`
        : `import asset_spritesheet0_image from '@/assets/game/avatars/${name}/animations/spritesheet-0.webp';
import asset_spritesheet1_image from '@/assets/game/avatars/${name}/animations/spritesheet-1.webp';`;
    
    // Determinar array de webpFiles
    const webpFilesArray = hasThreeSpritesheets
        ? `[asset_spritesheet0_image, asset_spritesheet1_image, asset_spritesheet2_image]`
        : `[asset_spritesheet0_image, asset_spritesheet1_image]`;

    return `${spritesheetImports}
import asset_atlas_json from '@/assets/game/avatars/${name}/animations/atlas.json';
import asset_cara_peque_image from '@/assets/game/avatars/${name}/cara_peque.svg';
import asset_cara_media_image from '@/assets/game/avatars/${name}/cara_media.svg';
import CachedAtlasLoader from '../CachedAtlasLoader';

class ${className} {
    /**
     * Carga el avatar ${capitalizedName} usando el sistema de cache
     */
    static async main(gameScene, avatarId) {
        try {
            // Usar el loader con cache para el atlas principal
            await this.loadCachedAtlas(gameScene, avatarId);
            
            // Cargar assets adicionales (iconos de cara)
            this.loadAdditionalAssets(gameScene, avatarId);
            
            console.log(\`🚀 Avatar ${capitalizedName} \${avatarId} configurado con sistema de cache\`);
        } catch (error) {
            console.warn(\`⚠️ Error cargando avatar ${capitalizedName} con cache, usando método tradicional:\`, error);
            this.loadTraditional(gameScene, avatarId);
        }
    }

    /**
     * Carga el atlas principal usando el sistema de cache
     */
    static async loadCachedAtlas(gameScene, avatarId) {
        const atlasKey = '${name}_atlas';
        
        // Verificar si ya existe en Phaser (podría estar cargado de sesión anterior)
        if (gameScene.textures.exists(atlasKey)) {
            console.log(\`📦 Atlas \${atlasKey} ya disponible en Phaser\`);
            return;
        }

        // Intentar cargar usando el loader con cache
        if (gameScene.load.cachedAtlas) {
            // Preparar datos del atlas para el cache
            const webpFiles = ${webpFilesArray};
            
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
            console.log(\`⚠️ CachedAtlasLoader no disponible, usando método tradicional\`);
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
        const webpFiles = ${webpFilesArray};

        asset_atlas_json.textures.forEach((texture, i) => {
            texture.image = webpFiles[i];
        });
        
        gameScene.load.multiatlas('${name}_atlas', asset_atlas_json);
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
            
            const avatarId = ${id}; // ${name.toUpperCase()}
            const version = assetVersionManager.getAvatarVersion(avatarId);
            const versionedAtlasKey = \`${name}_atlas_v\${version}\`;
            const versionedSpreadsheetKey = \`${name}_spreadsheet_v\${version}\`;
            
            const hasAtlas = await cacheManager.hasAsset(versionedAtlasKey, cacheManager.stores.ATLAS);
            const hasSpreadsheet = await cacheManager.hasAsset(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);
            
            return hasAtlas && hasSpreadsheet;
        } catch (error) {
            return false;
        }
    }

    /**
     * Obtiene estadísticas específicas del avatar ${capitalizedName} en cache
     */
    static async getCacheStats() {
        try {
            const cacheManager = await import('../../managers/CacheManager').then(m => m.default);
            const assetVersionManager = await import('../../managers/AssetVersionManager').then(m => m.default);
            
            const avatarId = ${id}; // ${name.toUpperCase()}
            const version = assetVersionManager.getAvatarVersion(avatarId);
            const versionedAtlasKey = \`${name}_atlas_v\${version}\`;
            const versionedSpreadsheetKey = \`${name}_spreadsheet_v\${version}\`;
            
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
     * Limpia el cache específico del avatar ${capitalizedName}
     */
    static async clearCache() {
        try {
            const cacheManager = await import('../../managers/CacheManager').then(m => m.default);
            const assetVersionManager = await import('../../managers/AssetVersionManager').then(m => m.default);
            
            const avatarId = ${id}; // ${name.toUpperCase()}
            const version = assetVersionManager.getAvatarVersion(avatarId);
            const versionedAtlasKey = \`${name}_atlas_v\${version}\`;
            const versionedSpreadsheetKey = \`${name}_spreadsheet_v\${version}\`;
            
            await cacheManager.removeAsset(versionedAtlasKey, cacheManager.stores.ATLAS);
            await cacheManager.removeAsset(versionedSpreadsheetKey, cacheManager.stores.SPREADSHEET);
            
            console.log('🗑️ Cache del avatar ${capitalizedName} limpiado');
            return true;
        } catch (error) {
            console.warn('⚠️ Error limpiando cache del avatar ${capitalizedName}:', error);
            return false;
        }
    }
}

export default ${className};`;
}

// Generar todas las clases
console.log('Generando clases AvatarLoadCached para todos los personajes...');

avatarData.forEach(avatar => {
    const classCode = generateCachedLoaderClass(avatar);
    const fileName = `Avatar${avatar.name.charAt(0).toUpperCase() + avatar.name.slice(1)}LoadCached.js`;
    
    console.log(`\n// ========================================`);
    console.log(`// ${fileName}`);
    console.log(`// ========================================`);
    console.log(classCode);
});

export { avatarData, generateCachedLoaderClass };