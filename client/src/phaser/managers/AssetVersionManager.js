/**
 * AssetVersionManager - Gestiona el versionado de assets para invalidar cache cuando es necesario
 */
class AssetVersionManager {
    constructor() {
        // Versiones actuales de los assets por avatar
        this.avatarVersions = {
            // Versión base para todos los avatares - incrementar cuando hay cambios globales
            base: '1.0.0',
            
            // Versiones específicas por avatar - incrementar solo cuando ese avatar cambia
            avatars: {
                1: '1.0.0',  // BOOMER
                2: '1.0.0',  // BRUJITA  
                3: '1.0.0',  // CHOLO
                4: '1.0.0',  // EMPOLLON
                5: '1.0.0',  // GATA
                6: '1.0.0',  // GHOST
                7: '1.0.0',  // INDIA
                8: '1.0.0',  // LILIAN
                9: '1.0.0',  // MARSU
                10: '1.0.0', // MODERN
                11: '1.0.0', // NINJA
                12: '1.0.0', // RASTA
                13: '1.0.0', // SKELETON
                14: '1.0.0', // WEREWOLF
                15: '1.0.0', // WRAITH
                16: '1.0.0', // YAYO
                17: '1.0.1'  // ZOMBIE - Actualizada para reflejar cambios recientes
            }
        };

        // Configuración de versioning
        this.versionKey = 'boombang_asset_versions';
        this.forceUpdateKey = 'boombang_force_update';
    }

    /**
     * Inicializa el sistema de versionado
     */
    init() {
        this.checkForUpdates();
    }

    /**
     * Obtiene la versión actual de un avatar
     */
    getAvatarVersion(avatarId) {
        const avatarVersion = this.avatarVersions.avatars[avatarId] || this.avatarVersions.base;
        const baseVersion = this.avatarVersions.base;
        
        // Combinar versión base + versión específica del avatar
        return `${baseVersion}_${avatarVersion}`;
    }

    /**
     * Verifica si hay actualizaciones disponibles
     */
    checkForUpdates() {
        try {
            const storedVersions = localStorage.getItem(this.versionKey);
            const forceUpdate = localStorage.getItem(this.forceUpdateKey);
            
            if (forceUpdate === 'true') {
                console.log('🔄 Actualizacion forzada detectada, limpiando cache...');
                this.handleForceUpdate();
                return;
            }

            if (!storedVersions) {
                // Primera vez - guardar versiones actuales
                this.saveCurrentVersions();
                console.log('📝 Versiones de assets inicializadas');
                return;
            }

            const stored = JSON.parse(storedVersions);
            const updatedAvatars = this.compareVersions(stored);
            
            if (updatedAvatars.length > 0) {
                console.log(`🔄 Avatares actualizados detectados: ${updatedAvatars.join(', ')}`);
                this.handleAvatarUpdates(updatedAvatars);
            }

            // Actualizar versiones guardadas
            this.saveCurrentVersions();

        } catch (error) {
            console.warn('⚠️ Error verificando actualizaciones de assets:', error);
            // En caso de error, limpiar y comenzar de nuevo
            this.clearVersionData();
            this.saveCurrentVersions();
        }
    }

    /**
     * Compara versiones guardadas con las actuales
     */
    compareVersions(storedVersions) {
        const updatedAvatars = [];

        // Verificar si la versión base cambió
        if (storedVersions.base !== this.avatarVersions.base) {
            console.log(`🔄 Versión base actualizada: ${storedVersions.base} → ${this.avatarVersions.base}`);
            // Si la base cambió, todos los avatares necesitan actualización
            return Object.keys(this.avatarVersions.avatars).map(id => parseInt(id));
        }

        // Verificar avatares individuales
        for (const [avatarId, currentVersion] of Object.entries(this.avatarVersions.avatars)) {
            const storedVersion = storedVersions.avatars?.[avatarId];
            
            if (!storedVersion || storedVersion !== currentVersion) {
                console.log(`🔄 Avatar ${avatarId} actualizado: ${storedVersion || 'nuevo'} → ${currentVersion}`);
                updatedAvatars.push(parseInt(avatarId));
            }
        }

        return updatedAvatars;
    }

    /**
     * Maneja actualizaciones forzadas
     */
    async handleForceUpdate() {
        try {
            // Importar dinámicamente para evitar dependencias circulares
            const { default: cacheManager } = await import('./CacheManager');
            await cacheManager.clearCache();
            
            // Limpiar flags de actualización
            localStorage.removeItem(this.forceUpdateKey);
            this.clearVersionData();
            this.saveCurrentVersions();
            
            console.log('✅ Actualización forzada completada');
            
            // Recargar la página para asegurar estado limpio
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('❌ Error en actualización forzada:', error);
        }
    }

    /**
     * Maneja actualizaciones de avatares específicos
     */
    async handleAvatarUpdates(updatedAvatarIds) {
        try {
            // Importar dinámicamente para evitar dependencias circulares
            const { default: cacheManager } = await import('./CacheManager');
            const { default: avatarManager } = await import('./AvatarManager');
            
            for (const avatarId of updatedAvatarIds) {
                await this.clearAvatarCache(cacheManager, avatarManager, avatarId);
            }

            console.log(`✅ Cache actualizado para ${updatedAvatarIds.length} avatares`);

        } catch (error) {
            console.error('❌ Error actualizando cache de avatares:', error);
        }
    }

    /**
     * Limpia el cache de un avatar específico
     */
    async clearAvatarCache(cacheManager, avatarManager, avatarId) {
        try {
            const avatarName = avatarManager.getAvatarName(avatarId);
            const atlasKey = `${avatarName}_atlas`;
            const spreadsheetKey = `${avatarName}_spreadsheet`;
            
            // Eliminar assets del avatar del cache
            await cacheManager.removeAsset(atlasKey, cacheManager.stores.ATLAS);
            await cacheManager.removeAsset(spreadsheetKey, cacheManager.stores.SPREADSHEET);
            
            // Remover de avatares cargados si está presente
            avatarManager.loadedAvatars.delete(avatarId);
            
            console.log(`🗑️ Cache limpiado para avatar ${avatarId} (${avatarName})`);

        } catch (error) {
            console.warn(`⚠️ Error limpiando cache del avatar ${avatarId}:`, error);
        }
    }

    /**
     * Guarda las versiones actuales en localStorage
     */
    saveCurrentVersions() {
        try {
            const versionData = {
                base: this.avatarVersions.base,
                avatars: { ...this.avatarVersions.avatars },
                timestamp: Date.now()
            };
            
            localStorage.setItem(this.versionKey, JSON.stringify(versionData));
        } catch (error) {
            console.warn('⚠️ Error guardando versiones:', error);
        }
    }

    /**
     * Limpia datos de versiones
     */
    clearVersionData() {
        try {
            localStorage.removeItem(this.versionKey);
        } catch (error) {
            console.warn('⚠️ Error limpiando datos de versiones:', error);
        }
    }

    /**
     * Fuerza una actualización completa (para desarrollo)
     */
    forceUpdate() {
        try {
            localStorage.setItem(this.forceUpdateKey, 'true');
            console.log('🔄 Actualización forzada programada para próximo reinicio');
        } catch (error) {
            console.warn('⚠️ Error programando actualización forzada:', error);
        }
    }

    /**
     * Incrementa la versión de un avatar específico (para desarrollo)
     */
    incrementAvatarVersion(avatarId) {
        if (this.avatarVersions.avatars[avatarId]) {
            const currentVersion = this.avatarVersions.avatars[avatarId];
            const versionParts = currentVersion.split('.');
            versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
            this.avatarVersions.avatars[avatarId] = versionParts.join('.');
            
            console.log(`📝 Versión del avatar ${avatarId} incrementada a ${this.avatarVersions.avatars[avatarId]}`);
            this.saveCurrentVersions();
        }
    }

    /**
     * Incrementa la versión base (afecta todos los avatares)
     */
    incrementBaseVersion() {
        const versionParts = this.avatarVersions.base.split('.');
        versionParts[1] = (parseInt(versionParts[1]) + 1).toString();
        versionParts[2] = '0'; // Reset patch version
        this.avatarVersions.base = versionParts.join('.');
        
        console.log(`📝 Versión base incrementada a ${this.avatarVersions.base}`);
        this.saveCurrentVersions();
    }

    /**
     * Obtiene información de versiones para debugging
     */
    getVersionInfo() {
        return {
            current: this.avatarVersions,
            stored: this.getStoredVersions(),
            needsUpdate: this.checkIfUpdateNeeded()
        };
    }

    /**
     * Obtiene versiones guardadas
     */
    getStoredVersions() {
        try {
            const stored = localStorage.getItem(this.versionKey);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Verifica si se necesita actualización
     */
    checkIfUpdateNeeded() {
        const stored = this.getStoredVersions();
        if (!stored) return true;
        
        const updated = this.compareVersions(stored);
        return updated.length > 0;
    }
}

// Instancia singleton
const assetVersionManager = new AssetVersionManager();

// Exponer globalmente para debugging
if (typeof window !== 'undefined') {
    window.assetVersionManager = assetVersionManager;
}

export default assetVersionManager;