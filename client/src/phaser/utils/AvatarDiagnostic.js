/**
 * Utilidad de diagnóstico para el sistema de avatares
 * Ayuda a identificar problemas y estado del sistema
 */

import avatarManager from "../managers/AvatarManager.js";
import backgroundAvatarLoader from "../managers/BackgroundAvatarLoader.js";
import smartAvatarSystem from "../managers/SmartAvatarSystem.js";

class AvatarDiagnostic {
    
    /**
     * Diagnóstico completo del sistema
     */
    static fullDiagnosis(scene = null) {
        //console.group("🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA DE AVATARES");
        
        // Estado general
        //console.log("📊 Estado General:");
        //console.log("- AvatarManager cargados:", avatarManager.loadedAvatars?.size || 0);
        //console.log("- BackgroundLoader cargados:", backgroundAvatarLoader.loadedAvatars?.size || 0);
        //console.log("- SmartSystem disponibles:", smartAvatarSystem.availableAvatars?.size || 0);
        
        // Texturas en Phaser
        if (scene) {
            const textureKeys = Object.keys(scene.textures.list);
            const avatarTextures = textureKeys.filter(key => key.includes('_atlas'));
            //console.log("- Texturas en Phaser:", avatarTextures.length);
            //console.log("- Lista de texturas:", avatarTextures);
        }
        
        // Estado de carga
        const loaderStats = backgroundAvatarLoader.getLoadingStats();
        //console.log("📈 Estado de Carga:", loaderStats);
        
        // Diferencias entre sistemas
        this.checkConsistency();
        
        //console.groupEnd();
        
        return {
            avatarManager: avatarManager.loadedAvatars?.size || 0,
            backgroundLoader: backgroundAvatarLoader.loadedAvatars?.size || 0,
            smartSystem: smartAvatarSystem.availableAvatars?.size || 0,
            loaderStats,
            textureCount: scene ? Object.keys(scene.textures.list).filter(key => key.includes('_atlas')).length : 0
        };
    }
    
    /**
     * Verifica consistencia entre sistemas
     */
    static checkConsistency() {
        //console.log("🔍 Verificando consistencia entre sistemas:");
        
        const managerLoaded = Array.from(avatarManager.loadedAvatars || []);
        const loaderLoaded = Array.from(backgroundAvatarLoader.loadedAvatars || []);
        const systemAvailable = Array.from(smartAvatarSystem.availableAvatars || []);
        
        // Avatares en manager pero no en loader
        const managerNotInLoader = managerLoaded.filter(id => !loaderLoaded.includes(id));
        if (managerNotInLoader.length > 0) {
            //console.warn("⚠️ Avatares en AvatarManager pero no en BackgroundLoader:", managerNotInLoader);
        }
        
        // Avatares en loader pero no en manager
        const loaderNotInManager = loaderLoaded.filter(id => !managerLoaded.includes(id));
        if (loaderNotInManager.length > 0) {
            //console.warn("⚠️ Avatares en BackgroundLoader pero no en AvatarManager:", loaderNotInManager);
        }
        
        // Avatares en sistema pero no disponibles
        const systemNotAvailable = systemAvailable.filter(id => !managerLoaded.includes(id));
        if (systemNotAvailable.length > 0) {
            //console.warn("⚠️ Avatares en SmartSystem pero no cargados en AvatarManager:", systemNotAvailable);
        }
        
        if (managerNotInLoader.length === 0 && loaderNotInManager.length === 0 && systemNotAvailable.length === 0) {
            //console.log("✅ Todos los sistemas están sincronizados");
        }
    }
    
    /**
     * Sincroniza manualmente todos los sistemas
     */
    static forceSync(scene) {
        //console.log("🔄 Forzando sincronización de sistemas...");
        
        if (!scene) {
            //console.error("❌ No se puede sincronizar sin escena");
            return;
        }
        
        // Obtener todas las texturas de avatares existentes en Phaser
        const textureKeys = Object.keys(scene.textures.list);
        const avatarTextures = textureKeys.filter(key => key.includes('_atlas'));
        
        //console.log(`📋 Encontradas ${avatarTextures.length} texturas de avatares en Phaser:`, avatarTextures);
        
        // Determinar qué avatares están realmente cargados
        const loadedAvatarIds = [];
        
        avatarTextures.forEach(textureKey => {
            // Extraer ID del avatar desde el nombre de la textura
            const avatarName = textureKey.replace('_atlas', '');
            const avatarId = this.getAvatarIdFromName(avatarName);
            
            if (avatarId !== null) {
                loadedAvatarIds.push(avatarId);
            }
        });
        
        //console.log(`🎯 Avatares identificados: ${loadedAvatarIds.length}`, loadedAvatarIds);
        
        // Sincronizar todos los sistemas con la realidad de Phaser
        loadedAvatarIds.forEach(avatarId => {
            avatarManager.loadedAvatars.add(avatarId);
            backgroundAvatarLoader.loadedAvatars.add(avatarId);
            smartAvatarSystem.availableAvatars.add(avatarId);
        });
        
        //console.log("✅ Sincronización forzada completada");
        
        // Verificar resultado
        this.checkConsistency();
    }
    
    /**
     * Obtiene el ID del avatar desde su nombre
     */
    static getAvatarIdFromName(avatarName) {
        const avatarMapping = {
            "boomer": 1,
            "brujita": 2,
            "cholo": 3,
            "empollon": 4,
            "gata": 5,
            "ghost": 6,
            "india": 7,
            "lilian": 8,
            "marsu": 9,
            "modern": 10,
            "ninja": 11,
            "rasta": 12,
            "skeleton": 13,
            "werewolf": 14,
            "wraith": 15,
            "yayo": 16,
            "zombie": 17
        };
        
        return avatarMapping[avatarName] || null;
    }
    
    /**
     * Limpia y reinicia todos los sistemas
     */
    static hardReset(scene) {
        //console.log("🔄 Realizando reset completo del sistema...");
        
        // Limpiar todos los sistemas
        avatarManager.loadedAvatars.clear();
        backgroundAvatarLoader.loadedAvatars.clear();
        smartAvatarSystem.availableAvatars.clear();
        
        //console.log("✅ Reset completo realizado");
        
        // Re-sincronizar con lo que realmente está en Phaser
        if (scene) {
            this.forceSync(scene);
        }
    }
    
    /**
     * Monitorea los sistemas en tiempo real
     */
    static startMonitoring(intervalMs = 5000) {
        const monitoringInterval = setInterval(() => {
            const stats = this.fullDiagnosis();
            
            // Solo mostrar si hay inconsistencias
            if (stats.avatarManager !== stats.backgroundLoader || 
                stats.backgroundLoader !== stats.smartSystem) {
                //console.warn("⚠️ Sistemas desincronizados detectados");
            }
        }, intervalMs);
        
        //console.log(`🔍 Monitoreo iniciado (intervalo: ${intervalMs}ms)`);
        
        // Retornar función para detener el monitoreo
        return () => {
            clearInterval(monitoringInterval);
            //console.log("🛑 Monitoreo detenido");
        };
    }
}

// Exportar para uso en consola de desarrollo
if (typeof window !== 'undefined' && import.meta.env.DEV) {
    window.AvatarDiagnostic = AvatarDiagnostic;
    //console.log("🛠️ AvatarDiagnostic disponible en window.AvatarDiagnostic");
}

export default AvatarDiagnostic;