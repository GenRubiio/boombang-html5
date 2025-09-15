# Sistema de Cache para Avatares - BoomBang HTML5

## 📋 Descripción

Este sistema implementa un cache persistente avanzado para los spreadsheets y atlas de avatares en BoomBang HTML5, eliminando la necesidad de descargar los mismos assets cada vez que se reinicia la aplicación.

## 🏗️ Arquitectura

### Componentes Principales

1. **CacheManager** - Gestiona el almacenamiento en IndexedDB
2. **AssetVersionManager** - Controla versiones y invalidación de cache
3. **AvatarManager** - Integra cache con carga progresiva de avatares
4. **CachedAtlasLoader** - Loader personalizado para Phaser con soporte de cache

### Flujo de Funcionamiento

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│ Solicitud Avatar│───▶│ Verificar    │───▶│ ¿Está en cache? │
│                 │    │ Cache        │    │                 │
└─────────────────┘    └──────────────┘    └─────────────────┘
                                                     │
                                    ┌────────────────┼────────────────┐
                                    │ SÍ             │ NO             │
                                    ▼                ▼                │
                           ┌─────────────────┐ ┌─────────────────┐   │
                           │ Cargar desde    │ │ Descargar desde │   │
                           │ Cache          │ │ Red             │   │
                           └─────────────────┘ └─────────────────┘   │
                                    │                │               │
                                    │                ▼               │
                                    │       ┌─────────────────┐      │
                                    │       │ Guardar en      │      │
                                    │       │ Cache           │      │
                                    │       └─────────────────┘      │
                                    │                │               │
                                    └────────────────┼───────────────┘
                                                     ▼
                                             ┌─────────────────┐
                                             │ Crear           │
                                             │ Animaciones     │
                                             └─────────────────┘
```

## 🚀 Características

### ✅ Implementadas

- **Almacenamiento Persistente**: IndexedDB para atlas y configuraciones
- **Versionado Automático**: Invalidación inteligente cuando hay cambios
- **Carga Progresiva**: Solo avatares prioritarios al inicio
- **Fallback Automático**: Si cache falla, descarga desde red
- **LRU Cache**: Limpieza automática cuando se alcanza límite
- **Cache Inteligente**: Límites auto-configurables (200MB - 1GB+)
- **Compresión**: Almacenamiento optimizado en formato Blob
- **Gestión de Memoria**: Liberación automática de blob URLs
- **Pre-cache Agresivo**: Blob URLs en memoria para cambios ultra-rápidos
- **Storage Adaptativo**: Se adapta al espacio disponible del navegador

### 🎯 Beneficios

1. **Reducción de Tiempo de Carga**: 90%+ menos tiempo después de primera carga
2. **Ahorro de Ancho de Banda**: No re-descarga assets existentes
3. **Mejor UX**: Carga instantánea de avatares ya vistos
4. **Offline Capability**: Funciona sin conexión para avatares cacheados
5. **Fallback Automático**: Si no hay espacio o falla cache, descarga desde internet
6. **Gestión LRU**: Elimina automáticamente assets antiguos para hacer espacio
7. **Degradación Elegante**: Nunca bloquea la aplicación por problemas de cache

## 📁 Estructura de Archivos

```
client/src/phaser/
├── managers/
│   ├── CacheManager.js           # Gestión de IndexedDB
│   ├── AssetVersionManager.js    # Control de versiones
│   └── AvatarManager.js          # Integración con cache
├── loaders/
│   └── CachedAtlasLoader.js      # Loader personalizado para Phaser
└── load/
    ├── AvatarAnimationsLoad.js   # Sistema optimizado de carga
    └── avatars/
        ├── AvatarGataLoad.js     # Loader original
        └── AvatarGataLoadCached.js # Ejemplo con cache
```

## 🔧 Configuración y Uso

### 1. Inicialización Automática

El sistema se inicializa automáticamente en `AvatarAnimationsLoad.preload()`:

```javascript
// Se registra automáticamente al cargar la aplicación
await avatarManager.init(gameScene);
```

### 2. Configuración de Versiones

En `AssetVersionManager.js`:

```javascript
// Incrementar cuando hay cambios en assets específicos
this.avatarVersions = {
    base: '1.0.0',        // Versión global
    avatars: {
        17: '1.0.1'       // ZOMBIE actualizado
    }
};
```

### 3. Límites de Cache (Configuración Avanzada)

El sistema configura automáticamente el límite basado en el storage disponible:

```javascript
// Configuración automática al inicializar
await cacheManager.autoConfigureCacheLimit();

// Configuración manual específica
cacheManager.setCacheLimit(1000); // 1GB

// Verificar storage disponible
const quota = await cacheManager.getStorageQuota();
console.log(`Total: ${quota.quotaMB}MB, Disponible: ${quota.availableMB}MB`);
```

**Límites Soportados:**
- **Automático**: 20% del storage disponible (máximo 1GB, mínimo 200MB)
- **Manual**: Hasta varios GB dependiendo del navegador
- **Predeterminado**: 500MB si no se puede detectar el storage
- **IndexedDB**: Soporta almacenamiento masivo en navegadores modernos

### 4. Gestión de Memoria y Fallback

El sistema implementa múltiples capas de protección cuando se agota el espacio:

```javascript
// 1. Limpieza LRU automática
await cacheManager.ensureCacheSpace(requiredSize);

// 2. Fallback a descarga directa si falla cache
if (!hasCachedAssets) {
    loader.main(scene, avatarId); // Descarga desde internet
}
```

**Comportamiento de Fallback:**
1. **Cache lleno**: Elimina assets más antiguos (LRU) automáticamente
2. **Cache falla**: Descarga directamente desde internet sin interrupciones
3. **Sin espacio**: Funciona sin cache, descargando cada vez
4. **Error de storage**: Degradación elegante a modo sin persistencia
5. **Navegador privado**: Funciona normalmente con límites reducidos

**El juego NUNCA se bloquea por problemas de cache** - siempre tiene fallback a descarga directa.

## 🛠️ API de Desarrollo

### Comandos de Debug

```javascript
// Estadísticas de cache
await avatarManager.getCacheStats();

// Verificar storage disponible y límites
const quota = await cacheManager.getStorageQuota();
console.log(`Storage: ${quota.usageMB}MB/${quota.quotaMB}MB`);

// Limpiar cache completo
await avatarManager.clearCache();

// Forzar limpieza LRU
await cacheManager.ensureCacheSpace(50 * 1024 * 1024); // Liberar 50MB

// Forzar actualización
assetVersionManager.forceUpdate();

// Incrementar versión de avatar específico
assetVersionManager.incrementAvatarVersion(17); // ZOMBIE

// Verificar si avatar está en cache
avatarManager.isAvatarLoaded(5); // GATA

// Simular cache lleno (para testing)
cacheManager.setCacheLimit(1); // 1MB para forzar fallback
```

### Eventos de Cache

```javascript
// Escuchar carga desde cache
scene.load.on('cache-hit', (key) => {
    console.log(`Cache hit: ${key}`);
});

// Escuchar guardado en cache
scene.load.on('cache-store', (key, size) => {
    console.log(`Stored in cache: ${key} (${size} bytes)`);
});
```

## 📊 Estadísticas y Monitoreo

### Información de Cache

```javascript
const stats = await cacheManager.getCacheStats();
console.log(`Cache usado: ${stats.usagePercentage}%`);
console.log(`Atlas: ${stats.stores.ATLAS.count} archivos`);
console.log(`Tamaño total: ${stats.totalSize / 1024 / 1024}MB`);
```

### Información de Versiones

```javascript
const versionInfo = assetVersionManager.getVersionInfo();
console.log('Versiones actuales:', versionInfo.current);
console.log('Versiones guardadas:', versionInfo.stored);
console.log('Necesita actualización:', versionInfo.needsUpdate);
```

## 🔄 Flujo de Actualización

### Actualizaciones Automáticas

1. **Al iniciar la app**: Se verifica si hay nuevas versiones
2. **Cache obsoleto**: Se elimina automáticamente
3. **Descarga nueva**: Se cachea la nueva versión
4. **Notificación**: Console logs informan del proceso

### Actualizaciones Forzadas

```javascript
// Para desarrollo - limpia todo y recarga
assetVersionManager.forceUpdate();
// La página se recargará automáticamente
```

## 📈 Optimizaciones

### Carga Progresiva

- **Inicial**: Solo Gata y Rasta (avatares prioritarios)
- **Segundo plano**: Otros avatares cuando se necesiten
- **Inteligente**: Evita cargar avatares no utilizados

### Gestión de Memoria

- **Blob URLs**: Se liberan automáticamente después del uso
- **LRU**: Assets antiguos se eliminan cuando se alcanza el límite
- **Compresión**: PNG para atlas, JSON para configuraciones

## 🐛 Debugging

### Logs de Sistema

```javascript
// Activar logs detallados
localStorage.setItem('debug_cache', 'true');

// Ver estado de cada avatar
Object.keys(AvatarEnum).forEach(key => {
    const id = AvatarEnum[key];
    console.log(`${key}: ${avatarManager.isAvatarLoaded(id) ? '✅' : '❌'}`);
});
```

### Problemas Comunes

| Problema | Síntoma | Solución |
|----------|---------|----------|
| Cache corrupto | Errores de carga | `assetVersionManager.forceUpdate()` |
| Límite alcanzado | Assets no se guardan | Automático (LRU) |
| Versión obsoleta | Texturas incorrectas | Automático al reiniciar |
| IndexedDB bloqueado | Cache no funciona | Verificar permisos del navegador |

## 🔒 Consideraciones de Seguridad

- **Solo cache local**: No se envían datos a servidores externos
- **Versionado**: Previene uso de assets maliciosos/obsoletos  
- **Límites**: Evita llenar el almacenamiento del usuario
- **Limpieza**: Automática en caso de errores

## 📱 Compatibilidad

- **Navegadores**: Chrome 58+, Firefox 55+, Safari 11+
- **Almacenamiento**: IndexedDB (100MB por defecto)
- **Fallback**: Funciona sin cache si IndexedDB no está disponible

## 🔮 Futuras Mejoras

- [ ] Compresión adicional (WebP, AVIF)
- [ ] Cache compartido entre pestañas
- [ ] Predicción de avatares probables
- [ ] Estadísticas de uso para optimización
- [ ] Sincronización con servidor para invalidación remota