import avatarManager from "../managers/AvatarManager";
import CachedAtlasLoader from "../loaders/CachedAtlasLoader";

class AvatarAnimationsLoad {
    /**
     * Método optimizado que solo carga avatares prioritarios (Gata y Rasta)
     * Los demás avatares se cargarán dinámicamente según se necesiten
     */
    static async preload(gameScene) {
        // Registrar el loader personalizado con cache
        CachedAtlasLoader.registerWithPhaser(gameScene);
        
        // Inicializar el manager con la escena actual
        await avatarManager.init(gameScene);
        
        // Cargar solo avatares prioritarios para reducir tiempo de carga inicial
        avatarManager.loadPriorityAvatars(gameScene);
    }

    /**
     * Método optimizado que solo crea animaciones para avatares cargados
     * Las animaciones se crean dinámicamente cuando se cargan los avatares
     */
    static create(gameScene) {
        // Las animaciones ahora se crean automáticamente en AvatarManager
        // cuando se cargan los avatares individuales
        // Mostrar estadísticas de cache
        //this.showCacheStats();
    }

    /**
     * Muestra estadísticas del cache de avatares
     */
    static async showCacheStats() {
        try {
            const stats = await CachedAtlasLoader.getAtlaseCacheStats();
            if (stats) {
                console.log("📊 Estadísticas de cache de avatares:");
                console.log(`   Atlas en cache: ${stats.atlasCount} (${(stats.atlasSize / 1024 / 1024).toFixed(2)}MB)`);
                console.log(`   Spreadsheets en cache: ${stats.spreadsheetCount} (${(stats.spreadsheetSize / 1024 / 1024).toFixed(2)}MB)`);
                console.log(`   Uso total: ${stats.usagePercentage.toFixed(1)}%`);
            }
        } catch (error) {
            console.warn('⚠️ Error obteniendo estadísticas de cache:', error);
        }
    }

    /**
     * Crea las animaciones en Phaser usando la info de frames, framerate y repeat del config.
     *
     * @param {Phaser.Scene} gameScene - La escena de Phaser donde se crean las animaciones.
     * @param {Object} config          - werewolf_config.
     * @param {String} avatarId        - p.e. AvatarEnum.WEREWOLF.
     */
    static createAvatarAnimations(gameScene, config, avatarId) {
        Object.entries(config).forEach(([animationName, animData]) => {
            const animKey = `${avatarId}_${animationName}`;
            const atlasKey = animData.atlasKey;

            // Verificar si la animación ya existe
            if (gameScene.anims.exists(animKey)) {
                return;
            }

            try {
                gameScene.anims.create({
                    key: animKey,
                    frames: gameScene.anims.generateFrameNames(atlasKey, {
                        start: animData.start,
                        end: animData.end,
                        prefix: animData.prefix
                    }),
                    frameRate: animData.frameRate,
                    repeat: animData.repeat
                });
            } catch (error) {
                // Error creando animación
            }
        });
    }
}

export default AvatarAnimationsLoad;
