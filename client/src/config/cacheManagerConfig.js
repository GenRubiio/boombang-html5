/**
 * Configuración del CacheManager
 * Personaliza aquí los parámetros del sistema de caché de assets
 */

const cacheConfig = {
    /**
     * Nombre de la base de datos IndexedDB
     * @type {string}
     */
    dbName: 'BoomBangAssetCache',

    /**
     * Versión actual de los assets
     * Cambia este valor cuando quieras invalidar el caché existente
     * @type {string}
     */
    assetVersion: '1.1.3'
};

export default cacheConfig;
