# Sistema de Versionado del Cliente - BoomBang HTML5

## 📋 Descripción

Sistema que permite versionar el cliente para forzar la limpieza automática de la caché IndexedDB cuando hay actualizaciones importantes. Cuando el usuario se conecta, si detecta una versión diferente, borra automáticamente toda la base de datos de caché.

## 🔧 Uso Básico

### Cambiar Versión del Cliente

Para forzar que todos los usuarios limpien su caché, simplemente cambia la versión en el archivo:

```javascript
// Archivo: client/src/utils/ClientVersionManager.js
this.clientVersion = '1.0.2'; // 🔧 Cambiar esta línea
```

**Ejemplos de cuándo cambiar la versión:**
- Nuevos avatares añadidos al juego
- Cambios en formato de spreadsheets
- Actualizaciones importantes de assets
- Corrección de bugs relacionados con caché corrupta
- Cambios en estructura de datos guardados

## 🚀 Flujo de Funcionamiento

1. **Usuario inicia la aplicación** → `main.js` ejecuta verificación de versión
2. **Compara versiones**: Actual vs Almacenada en localStorage
3. **Si son diferentes**:
   - Borra completamente la base de datos IndexedDB
   - Limpia localStorage relacionado con caché
   - Guarda la nueva versión
4. **Si son iguales**: Mantiene la caché existente

## 🛠️ API de Desarrollo

### Comandos en Consola del Navegador

```javascript
// Verificar estado actual
debugCache.getCurrentVersion()  // "1.0.1"
debugCache.getStoredVersion()   // "1.0.0" o null
debugCache.needsUpdate()        // true/false

// Forzar limpieza manual
debugCache.forceUpdate()        // Fuerza actualización
debugCache.forceUpdate("1.0.5") // Con versión específica
debugCache.resetCache()         // Reinicia todo el cache

// Verificar versión manualmente
debugCache.checkVersion()       // Ejecuta verificación completa
```

### Métodos Programáticos

```javascript
import clientVersionManager from './utils/ClientVersionManager';

// Verificar si necesita actualización
const needsUpdate = clientVersionManager.needsUpdate();

// Forzar limpieza de caché
await clientVersionManager.checkAndUpdateClientVersion();

// Obtener versiones
const current = clientVersionManager.getCurrentVersion();
const stored = clientVersionManager.getStoredVersion();
```

## 📁 Archivos Modificados

1. **`client/src/utils/ClientVersionManager.js`** (NUEVO)
   - Clase principal del sistema de versionado
   - Gestiona comparación y limpieza de caché

2. **`client/src/main.js`** (MODIFICADO)
   - Integra verificación de versión al inicio de la aplicación
   - Se ejecuta antes que cualquier otra inicialización

## 🔍 Logs de Funcionamiento

El sistema produce logs claros en la consola:

```
🚀 Iniciando BoomBang HTML5 Client...
🔍 Verificando versión del cliente...
   Versión actual: 1.0.2
   Versión almacenada: 1.0.1
🗑️ Versión diferente detectada, limpiando cache...
✅ Base de datos BoomBangAssetCache borrada exitosamente
🗑️ Removido del localStorage: asset_version_data
✅ Cache limpiado y versión actualizada a 1.0.2
✅ BoomBang HTML5 Client iniciado exitosamente
```

## ⚙️ Configuración Avanzada

### Cambiar Nombre de Base de Datos

```javascript
// En ClientVersionManager.js
this.dbName = 'MiNuevaBaseDeDatos'; // Debe coincidir con CacheManager
```

### Limpiar Datos Adicionales

Modifica el método `clearCacheRelatedStorage()` para incluir más claves:

```javascript
clearCacheRelatedStorage() {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
            key.includes('asset_version') ||
            key.includes('cache_') ||
            key.includes('avatar_') ||
            key.includes('boombang_cache') ||
            key.includes('mi_clave_custom') // ← Añadir claves personalizadas
        )) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
}
```

## 🧪 Testing

### Probar el Sistema

1. **Primera ejecución**: Cache vacío, no debería limpiar nada
2. **Cambiar versión**: Modificar `clientVersion` y recargar
3. **Verificar logs**: Debe mostrar limpieza de caché
4. **Comprobar IndexedDB**: Base de datos debe estar vacía

### Simular Diferentes Escenarios

```javascript
// Simular usuario nuevo (sin versión)
localStorage.removeItem('boombang_client_version');

// Simular versión antigua
localStorage.setItem('boombang_client_version', '0.9.0');

// Verificar comportamiento
debugCache.checkVersion();
```

## 🔒 Consideraciones de Seguridad

- ✅ **Solo afecta caché local**: No modifica datos del servidor
- ✅ **Degradación elegante**: Si falla, la aplicación sigue funcionando
- ✅ **Logs informativos**: No expone información sensible
- ✅ **Rollback automático**: El sistema de caché se reconstruye automáticamente

## 🎯 Ejemplos de Uso

### Actualización Mayor (1.0.x → 1.1.0)
```javascript
this.clientVersion = '1.1.0'; // Cambios importantes de estructura
```

### Hotfix (1.0.1 → 1.0.2)
```javascript
this.clientVersion = '1.0.2'; // Corrección de bugs de caché
```

### Actualización de Assets (1.0.1 → 1.0.1-assets-2)
```javascript
this.clientVersion = '1.0.1-assets-2'; // Nuevos avatares/sprites
```

---

**💡 Tip**: Usa un esquema de versionado consistente (semver) y documenta los cambios para facilitar el mantenimiento.