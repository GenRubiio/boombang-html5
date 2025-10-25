/**
 * ClientVersionManager - Gestiona el versionado del cliente para invalidar cache completo
 * Permite definir versiones del cliente (ej: 1.0.1) y limpiar cache cuando cambia
 */
class ClientVersionManager {
    constructor() {
        this.clientVersion = '1.0.4'; // 🔧 Cambiar esta versión para forzar limpieza de cache
        this.versionKey = 'boombang_client_version';
        this.dbName = 'BoomBangAssetCache'; // Debe coincidir con CacheManager
    }

    /**
     * Verifica la versión del cliente y limpia cache si es necesario
     * Se debe llamar al inicio de la aplicación
     */
    async checkAndUpdateClientVersion() {
        try {
            const storedVersion = localStorage.getItem(this.versionKey);
            
            //console.log(`🔍 Verificando versión del cliente:`);
            //console.log(`   Versión actual: ${this.clientVersion}`);
            //console.log(`   Versión almacenada: ${storedVersion || 'ninguna'}`);
            
            // Si no hay versión almacenada o es diferente, limpiar cache
            if (!storedVersion || storedVersion !== this.clientVersion) {
                //console.log(`🗑️ Versión diferente detectada, limpiando cache...`);
                
                await this.clearEntireCache();
                
                // Guardar la nueva versión
                localStorage.setItem(this.versionKey, this.clientVersion);
                
                //console.log(`✅ Cache limpiado y versión actualizada a ${this.clientVersion}`);
                
                return true; // Indica que se limpió el cache
            } else {
                //console.log(`✅ Versión del cliente coincide, manteniendo cache`);
                return false; // No se limpió el cache
            }
        } catch (error) {
            console.error('❌ Error verificando versión del cliente:', error);
            return false;
        }
    }

    /**
     * Borra completamente la base de datos IndexedDB
     */
    async clearEntireCache() {
        return new Promise((resolve, reject) => {
            try {
                // Cerrar cualquier conexión existente
                if (window.cacheManager && window.cacheManager.db) {
                    window.cacheManager.db.close();
                }

                // Borrar la base de datos completamente
                const deleteRequest = indexedDB.deleteDatabase(this.dbName);
                
                deleteRequest.onsuccess = () => {
                    //console.log(`✅ Base de datos ${this.dbName} borrada exitosamente`);
                    
                    // También limpiar localStorage relacionado con cache
                    this.clearCacheRelatedStorage();
                    
                    resolve();
                };
                
                deleteRequest.onerror = (event) => {
                    console.error(`❌ Error borrando base de datos:`, event);
                    reject(event);
                };
                
                deleteRequest.onblocked = () => {
                    console.warn(`⚠️ Borrado de base de datos bloqueado, reintentando...`);
                    // En caso de bloqueo, intentar forzar cierre y reintentar
                    setTimeout(() => {
                        const retryRequest = indexedDB.deleteDatabase(this.dbName);
                        retryRequest.onsuccess = () => resolve();
                        retryRequest.onerror = (event) => reject(event);
                    }, 1000);
                };
                
            } catch (error) {
                console.error('❌ Error en clearEntireCache:', error);
                reject(error);
            }
        });
    }

    /**
     * Limpia datos relacionados con cache del localStorage
     */
    clearCacheRelatedStorage() {
        const keysToRemove = [];
        
        // Buscar claves relacionadas con cache y versiones
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.includes('asset_version') ||
                key.includes('cache_') ||
                key.includes('avatar_') ||
                key.includes('boombang_cache')
            )) {
                keysToRemove.push(key);
            }
        }
        
        // Remover las claves encontradas
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            //console.log(`🗑️ Removido del localStorage: ${key}`);
        });
    }

    /**
     * Obtiene la versión actual del cliente
     */
    getCurrentVersion() {
        return this.clientVersion;
    }

    /**
     * Obtiene la versión almacenada
     */
    getStoredVersion() {
        return localStorage.getItem(this.versionKey);
    }

    /**
     * Fuerza una actualización de versión (útil para desarrollo)
     */
    async forceVersionUpdate(newVersion = null) {
        if (newVersion) {
            this.clientVersion = newVersion;
        }
        
        //console.log(`🔄 Forzando actualización a versión ${this.clientVersion}`);
        
        // Remover versión almacenada para forzar limpieza
        localStorage.removeItem(this.versionKey);
        
        // Ejecutar verificación que limpiará el cache
        return await this.checkAndUpdateClientVersion();
    }

    /**
     * Verifica si necesita actualizarse sin hacer la limpieza
     */
    needsUpdate() {
        const storedVersion = localStorage.getItem(this.versionKey);
        return !storedVersion || storedVersion !== this.clientVersion;
    }

    /**
     * Reinicia completamente el cache (para desarrollo/debug)
     */
    async resetCache() {
        //console.log('🔄 Reiniciando cache completo...');
        
        try {
            await this.clearEntireCache();
            localStorage.removeItem(this.versionKey);
            //console.log('✅ Cache reiniciado exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error reiniciando cache:', error);
            return false;
        }
    }
}

// Instancia singleton
const clientVersionManager = new ClientVersionManager();

// Comandos de debug disponibles en consola
window.clientVersionManager = clientVersionManager;
window.debugCache = {
    checkVersion: () => clientVersionManager.checkAndUpdateClientVersion(),
    forceUpdate: (version) => clientVersionManager.forceVersionUpdate(version),
    resetCache: () => clientVersionManager.resetCache(),
    getCurrentVersion: () => clientVersionManager.getCurrentVersion(),
    getStoredVersion: () => clientVersionManager.getStoredVersion(),
    needsUpdate: () => clientVersionManager.needsUpdate()
};

export default clientVersionManager;