/**
 * CacheManager - Gestiona el almacenamiento local de assets de avatares
 * Utiliza IndexedDB para almacenar imágenes y configuraciones de manera persistente
 */
class CacheManager {
    constructor() {
        this.dbName = 'BoomBangAssetCache';
        this.dbVersion = 1;
        this.db = null;
        this.assetVersion = '1.0.0'; // Versión actual de los assets
        this.maxCacheSize = 500 * 1024 * 1024; // 500MB límite (ajustable)
        this.currentCacheSize = 0;
        
        // Stores para diferentes tipos de assets
        this.stores = {
            ATLAS: 'atlas_store',
            CONFIG: 'config_store', 
            SPREADSHEET: 'spreadsheet_store',
            METADATA: 'metadata_store'
        };
    }

    /**
     * Inicializa la base de datos IndexedDB
     */
    async init() {
        return new Promise(async (resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                reject(request.error);
            };
            
            request.onsuccess = async () => {
                this.db = request.result;
                
                // Configurar límite de cache automáticamente basado en storage disponible
                await this.autoConfigureCacheLimit();
                
                this.calculateCurrentCacheSize();
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Crear stores si no existen
                Object.values(this.stores).forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, { keyPath: 'key' });
                        store.createIndex('timestamp', 'timestamp', { unique: false });
                        store.createIndex('size', 'size', { unique: false });
                        store.createIndex('version', 'version', { unique: false });
                    }
                });
            };
        });
    }

    /**
     * Almacena un asset en cache
     */
    async storeAsset(key, data, type = this.stores.ATLAS, metadata = {}) {
        if (!this.db) {
            return false;
        }

        try {
            // Convertir data a Blob si es necesario
            let blobData = data;
            if (!(data instanceof Blob)) {
                if (typeof data === 'string') {
                    blobData = new Blob([data], { type: 'application/json' });
                } else if (data instanceof ArrayBuffer) {
                    blobData = new Blob([data]);
                } else {
                    blobData = new Blob([JSON.stringify(data)], { type: 'application/json' });
                }
            }

            const assetRecord = {
                key: key,
                data: blobData,
                timestamp: Date.now(),
                size: blobData.size,
                version: this.assetVersion,
                type: metadata.type || 'unknown',
                avatarId: metadata.avatarId || null,
                url: metadata.url || null
            };

            // Verificar límites de cache antes de almacenar
            await this.ensureCacheSpace(blobData.size);

            const transaction = this.db.transaction([type], 'readwrite');
            const store = transaction.objectStore(type);
            
            await new Promise((resolve, reject) => {
                const request = store.put(assetRecord);
                request.onsuccess = () => {
                    this.currentCacheSize += blobData.size;
                    resolve();
                };
                request.onerror = () => reject(request.error);
            });

            return true;

        } catch (error) {
            return false;
        }
    }

    /**
     * Recupera un asset desde cache
     */
    async getAsset(key, type = this.stores.ATLAS) {
        if (!this.db) {
            return null;
        }

        try {
            const transaction = this.db.transaction([type], 'readonly');
            const store = transaction.objectStore(type);
            
            const result = await new Promise((resolve, reject) => {
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            if (result) {
                // Verificar versión
                if (result.version !== this.assetVersion) {
                    await this.removeAsset(key, type);
                    return null;
                }

                // Actualizar timestamp para LRU
                await this.updateAccessTime(key, type);
            
                return result;
            }

            return null;

        } catch (error) {
            return null;
        }
    }

    /**
     * Verifica si un asset existe en cache y está actualizado
     */
    async hasAsset(key, type = this.stores.ATLAS) {
        const asset = await this.getAsset(key, type);
        return asset !== null;
    }

    /**
     * Elimina un asset específico del cache
     */
    async removeAsset(key, type = this.stores.ATLAS) {
        if (!this.db) return false;

        try {
            const transaction = this.db.transaction([type], 'readwrite');
            const store = transaction.objectStore(type);
            
            // Obtener el tamaño antes de eliminar
            const existingRecord = await new Promise((resolve) => {
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(null);
            });

            if (existingRecord) {
                await new Promise((resolve, reject) => {
                    const request = store.delete(key);
                    request.onsuccess = () => {
                        this.currentCacheSize -= existingRecord.size;
                        resolve();
                    };
                    request.onerror = () => reject(request.error);
                });

                return true;
            }

            return false;

        } catch (error) {
            return false;
        }
    }

    /**
     * Convierte un Blob de vuelta a datos utilizables
     */
    async convertBlobToData(blob, dataType = 'json') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = () => {
                try {
                    switch (dataType) {
                        case 'json':
                            resolve(JSON.parse(reader.result));
                            break;
                        case 'text':
                            resolve(reader.result);
                            break;
                        case 'arrayBuffer':
                            resolve(reader.result);
                            break;
                        case 'dataURL':
                            resolve(reader.result);
                            break;
                        default:
                            resolve(reader.result);
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(reader.error);
            
            switch (dataType) {
                case 'json':
                case 'text':
                    reader.readAsText(blob);
                    break;
                case 'arrayBuffer':
                    reader.readAsArrayBuffer(blob);
                    break;
                case 'dataURL':
                    reader.readAsDataURL(blob);
                    break;
                default:
                    reader.readAsText(blob);
            }
        });
    }

    /**
     * Calcula el tamaño actual del cache
     */
    async calculateCurrentCacheSize() {
        if (!this.db) return;

        this.currentCacheSize = 0;
        
        for (const storeName of Object.values(this.stores)) {
            try {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                
                const request = store.openCursor();
                await new Promise((resolve) => {
                    request.onsuccess = (event) => {
                        const cursor = event.target.result;
                        if (cursor) {
                            this.currentCacheSize += cursor.value.size || 0;
                            cursor.continue();
                        } else {
                            resolve();
                        }
                    };
                    request.onerror = () => resolve();
                });
            } catch (error) {
            }
        }
    }

    /**
     * Asegura que hay espacio suficiente en cache, eliminando assets antiguos si es necesario
     */
    async ensureCacheSpace(requiredSize) {
        if (this.currentCacheSize + requiredSize <= this.maxCacheSize) {
            return; // Hay espacio suficiente
        }

        // Implementar LRU: eliminar assets más antiguos
        const allAssets = [];
        
        for (const storeName of Object.values(this.stores)) {
            try {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const index = store.index('timestamp');
                
                const request = index.openCursor();
                await new Promise((resolve) => {
                    request.onsuccess = (event) => {
                        const cursor = event.target.result;
                        if (cursor) {
                            allAssets.push({
                                key: cursor.value.key,
                                store: storeName,
                                timestamp: cursor.value.timestamp,
                                size: cursor.value.size
                            });
                            cursor.continue();
                        } else {
                            resolve();
                        }
                    };
                    request.onerror = () => resolve();
                });
            } catch (error) {
            }
        }

        // Ordenar por timestamp (más antiguos primero)
        allAssets.sort((a, b) => a.timestamp - b.timestamp);

        // Eliminar assets hasta tener espacio suficiente
        let freedSpace = 0;
        for (const asset of allAssets) {
            if (this.currentCacheSize - freedSpace + requiredSize <= this.maxCacheSize) {
                break;
            }

            await this.removeAsset(asset.key, asset.store);
            freedSpace += asset.size;
        }
    }

    /**
     * Actualiza el timestamp de acceso para LRU
     */
    async updateAccessTime(key, type) {
        if (!this.db) return;

        try {
            const transaction = this.db.transaction([type], 'readwrite');
            const store = transaction.objectStore(type);
            
            const getRequest = store.get(key);
            getRequest.onsuccess = () => {
                const record = getRequest.result;
                if (record) {
                    record.timestamp = Date.now();
                    store.put(record);
                }
            };
        } catch (error) {
            // Error silencioso, no es crítico para el funcionamiento
        }
    }

    /**
     * Limpia todo el cache
     */
    async clearCache() {
        if (!this.db) return;

        try {
            for (const storeName of Object.values(this.stores)) {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                await new Promise((resolve, reject) => {
                    const request = store.clear();
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            }

            this.currentCacheSize = 0;

        } catch (error) {
        }
    }

    /**
     * Obtiene estadísticas del cache
     */
    async getCacheStats() {
        const stats = {
            totalSize: this.currentCacheSize,
            maxSize: this.maxCacheSize,
            usagePercentage: (this.currentCacheSize / this.maxCacheSize) * 100,
            stores: {}
        };

        for (const [storeName, storeKey] of Object.entries(this.stores)) {
            try {
                const transaction = this.db.transaction([storeKey], 'readonly');
                const store = transaction.objectStore(storeKey);
                
                let count = 0;
                let size = 0;
                
                const request = store.openCursor();
                await new Promise((resolve) => {
                    request.onsuccess = (event) => {
                        const cursor = event.target.result;
                        if (cursor) {
                            count++;
                            size += cursor.value.size || 0;
                            cursor.continue();
                        } else {
                            resolve();
                        }
                    };
                    request.onerror = () => resolve();
                });

                stats.stores[storeName] = { count, size };
            } catch (error) {
                stats.stores[storeName] = { count: 0, size: 0, error: error.message };
            }
        }

        return stats;
    }

    /**
     * Obtiene la URL del asset desde cache como blob URL
     */
    async getAssetBlobURL(key, type = this.stores.ATLAS) {
        const asset = await this.getAsset(key, type);
        if (asset && asset.data) {
            return URL.createObjectURL(asset.data);
        }
        return null;
    }

    /**
     * Configura el límite máximo de cache
     * @param {number} sizeInMB - Tamaño en megabytes (por defecto 500MB)
     */
    setCacheLimit(sizeInMB = 500) {
        const newLimit = sizeInMB * 1024 * 1024;
        this.maxCacheSize = newLimit;
        
        // Verificar si necesitamos limpiar cache existente
        if (this.currentCacheSize > newLimit) {
            this.enforceStorageLimit();
        }
    }

    /**
     * Obtiene información sobre los límites de storage del navegador
     */
    async getStorageQuota() {
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                return {
                    quota: estimate.quota,
                    usage: estimate.usage,
                    available: estimate.quota - estimate.usage,
                    quotaMB: Math.round(estimate.quota / 1024 / 1024),
                    usageMB: Math.round(estimate.usage / 1024 / 1024),
                    availableMB: Math.round((estimate.quota - estimate.usage) / 1024 / 1024)
                };
            }
        } catch (error) {
        }
        return null;
    }

    /**
     * Configura automáticamente el límite basado en el storage disponible
     */
    async autoConfigureCacheLimit() {
        const quota = await this.getStorageQuota();
        if (quota) {
            // Usar hasta el 20% del storage disponible, máximo 1GB
            const recommendedMB = Math.min(Math.floor(quota.availableMB * 0.2), 1024);
            const safeLimitMB = Math.max(recommendedMB, 200); // Mínimo 200MB
            
            this.setCacheLimit(safeLimitMB);
            return safeLimitMB;
        } else {
            // Fallback si no se puede detectar el storage
            this.setCacheLimit(500);
            return 500;
        }
    }

    /**
     * Libera recursos de blob URLs creadas
     */
    static revokeBlobURL(url) {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Pre-carga blob URLs para acceso rápido (mantiene URLs en memoria)
     */
    async precacheBlobURLs(keys, storeName) {
        if (!Array.isArray(keys)) {
            keys = [keys];
        }
        
        const results = {};
        
        for (const key of keys) {
            try {
                const asset = await this.getAsset(key, storeName);
                if (asset && asset.data) {
                    // Crear blob URL y mantenerlo en memoria
                    const blob = new Blob([asset.data], { type: asset.mimeType || 'application/octet-stream' });
                    const url = URL.createObjectURL(blob);
                    
                    // Guardar en cache temporal de URLs
                    if (!this.blobURLCache) {
                        this.blobURLCache = new Map();
                    }
                    
                    this.blobURLCache.set(key, {
                        url: url,
                        timestamp: Date.now(),
                        storeName: storeName
                    });
                    
                    results[key] = url;
                }
            } catch (error) {
            }
        }
        
        return results;
    }

    /**
     * Obtiene blob URL pre-cacheado o crea uno nuevo
     */
    async getFastBlobURL(key, storeName) {
        // Verificar si ya está en cache de URLs
        if (this.blobURLCache && this.blobURLCache.has(key)) {
            const cached = this.blobURLCache.get(key);
            // Verificar que no sea muy viejo (máximo 5 minutos)
            if (Date.now() - cached.timestamp < 300000) {
                return cached.url;
            } else {
                // Limpiar URL viejo
                URL.revokeObjectURL(cached.url);
                this.blobURLCache.delete(key);
            }
        }
        
        // Crear nuevo blob URL
        return await this.getAssetBlobURL(key, storeName);
    }

    /**
     * Limpia cache de blob URLs
     */
    clearBlobURLCache() {
        if (this.blobURLCache) {
            for (const [key, cached] of this.blobURLCache.entries()) {
                URL.revokeObjectURL(cached.url);
            }
            this.blobURLCache.clear();
        }
    }

    /**
     * Pre-carga assets de avatares más usados para acceso ultra-rápido
     */
    async preloadHotAvatars(avatarIds = [12, 5]) { // Rasta, Gata
        for (const avatarId of avatarIds) {
            try {
                const avatarName = this.getAvatarNameById(avatarId);
                const version = '1.0.0_1.0.1'; // Usar versión actual
                
                const atlasKey = `${avatarName}_atlas_v${version}`;
                const spreadsheetKey = `${avatarName}_spreadsheet_v${version}`;
                
                // Pre-cachear blob URLs
                await this.precacheBlobURLs([atlasKey], this.stores.ATLAS);
                await this.precacheBlobURLs([spreadsheetKey], this.stores.SPREADSHEET);
                
            } catch (error) {
                // Error pre-cargando avatar
            }
        }
    }

    /**
     * Mapeo de IDs de avatar a nombres (helper)
     */
    getAvatarNameById(avatarId) {
        const avatarMap = {
            5: 'asiatica',
            6: 'bruja', 
            7: 'chino',
            8: 'colegial',
            12: 'rasta',
            16: 'zombie',
            13: 'gata'
        };
        return avatarMap[avatarId] || 'unknown';
    }
}

// Instancia singleton
const cacheManager = new CacheManager();

export default cacheManager;