/**
 * EJEMPLO DE INTEGRACIÓN DEL NUEVO SISTEMA DE AVATARES
 * 
 * Este archivo muestra cómo integrar el nuevo sistema en tu escena principal
 * Copia estas modificaciones a tu escena de juego existente
 */

import AvatarSystemController from "../controllers/AvatarSystemController.js";

class GameSceneExample extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Estado del sistema de avatares
        this.avatarsEssentialReady = false;
        this.allAvatarsReady = false;
        this.avatarLoadingProgress = 0;
    }

    async create() {
        console.log("🎮 Inicializando escena de juego...");
        
        // PASO 1: Inicializar el sistema de avatares ANTES que cualquier otra cosa
        const avatarSystemReady = await AvatarSystemController.init(this);
        
        if (!avatarSystemReady) {
            console.error("❌ Error crítico: Sistema de avatares no pudo inicializarse");
            // Manejar error crítico
            return;
        }

        // PASO 2: Configurar listeners para eventos del sistema
        this.setupAvatarSystemListeners();

        // PASO 3: Inicializar el resto de la escena
        this.initializeGameElements();
        
        // PASO 4: El sistema comenzará automáticamente a cargar avatares en background
        console.log("🚀 Escena inicializada - avatares cargándose en paralelo");
    }

    /**
     * Configura listeners para eventos del sistema de avatares
     */
    setupAvatarSystemListeners() {
        // Cuando los avatares esenciales estén listos
        this.events.on('avatarsEssentialReady', () => {
            console.log("⚡ Avatares esenciales listos - permitir entrada a sala");
            
            // Aquí puedes habilitar la funcionalidad principal del juego
            this.enableMainGameplay();
        });

        // Cuando todos los avatares estén cargados
        this.events.on('allAvatarsReady', (stats) => {
            console.log("🎉 Todos los avatares disponibles:", stats);
            
            // Opcional: mostrar notificación al usuario
            this.showAllAvatarsReadyNotification(stats);
        });

        // Progreso de carga individual
        this.events.on('avatarLoaded', (data) => {
            this.avatarLoadingProgress = data.loadedCount / data.totalCount;
            
            // Actualizar UI de progreso si existe
            this.updateLoadingUI(data);
        });
    }

    /**
     * Inicializa elementos básicos del juego
     */
    initializeGameElements() {
        // Crear mapa, UI, etc.
        // Tu lógica existente aquí...
        
        console.log("🗺️ Elementos de juego inicializados");
    }

    /**
     * Habilita la funcionalidad principal cuando los avatares esenciales están listos
     */
    enableMainGameplay() {
        // Permitir conexiones de usuarios
        // Habilitar movimiento, chat, etc.
        // Tu lógica existente aquí...
        
        console.log("🎮 Funcionalidad principal habilitada");
    }

    /**
     * Método llamado cuando un usuario entra a la sala
     * USAR ESTE PATRÓN EN TU CÓDIGO EXISTENTE
     */
    onUserJoinRoom(userData) {
        // El sistema automáticamente manejará fallback/original
        // No necesitas verificar manualmente si el avatar está cargado
        
        // Tu AddUserController ya está actualizado para usar el nuevo sistema
        AddUserController.main(this, userData);
        
        // Opcional: priorizar avatares de usuarios recién entrados
        AvatarSystemController.prioritizeActiveUsers(this);
    }

    /**
     * Método llamado cuando un usuario cambia de avatar
     * USAR ESTE PATRÓN EN TU CÓDIGO EXISTENTE
     */
    onUserChangeAvatar(data) {
        // El sistema automáticamente manejará disponibilidad
        // Tu UserChangeAvatarController ya está actualizado
        
        UserChangeAvatarController.main(this, data);
    }

    /**
     * Método llamado cuando un usuario se desconecta
     * IMPORTANTE: Limpiar referencias del sistema
     */
    onUserDisconnect(userId) {
        // Limpiar del sistema de avatares
        AvatarSystemController.removeUser(userId);
        
        // Tu lógica existente de limpieza aquí...
        if (this.users[userId]) {
            // Ejecutar callbacks de limpieza si existen
            if (this.users[userId].cleanupCallbacks) {
                this.users[userId].cleanupCallbacks.forEach(callback => callback());
            }
            
            delete this.users[userId];
        }
    }

    /**
     * Actualiza UI de progreso de carga (opcional)
     */
    updateLoadingUI(data) {
        // Mostrar progreso en UI si tienes una barra de carga
        const percentage = Math.round((data.loadedCount / data.totalCount) * 100);
        
        if (this.loadingText) {
            this.loadingText.setText(`Cargando avatares... ${percentage}%`);
        }
        
        console.log(`📊 Avatares: ${data.loadedCount}/${data.totalCount} (${percentage}%)`);
    }

    /**
     * Muestra notificación cuando todos los avatares están listos (opcional)
     */
    showAllAvatarsReadyNotification(stats) {
        // Mostrar notificación temporal al usuario
        console.log(`🎉 ¡Todos los ${stats.total} avatares están disponibles!`);
        
        // Aquí puedes mostrar una notificación UI temporal
    }

    /**
     * Métodos de utilidad para debugging y monitoreo
     */
    
    /**
     * Comando de consola para ver estadísticas
     */
    getAvatarStats() {
        return AvatarSystemController.diagnose();
    }

    /**
     * Comando de consola para forzar priorización
     */
    prioritizeAvatars() {
        AvatarSystemController.prioritizeActiveUsers(this);
    }

    /**
     * Comando de consola para pausar/reanudar sistema
     */
    pauseAvatarSystem() {
        AvatarSystemController.pause();
    }

    resumeAvatarSystem() {
        AvatarSystemController.resume();
    }

    /**
     * Limpieza automática al destruir la escena
     */
    destroy() {
        // El sistema se limpia automáticamente con los listeners de 'shutdown'
        // No necesitas llamar nada manualmente
        
        super.destroy();
    }
}

// COMANDOS DE CONSOLA PARA DEBUGGING (opcional)
// Añade estas líneas al final de tu archivo principal para debugging en desarrollo

if (import.meta.env.DEV) {
    // Hacer disponibles comandos en la consola del navegador
    window.avatarSystem = {
        stats: () => AvatarSystemController.diagnose(),
        pause: () => AvatarSystemController.pause(),
        resume: () => AvatarSystemController.resume(),
        reset: () => AvatarSystemController.reset(),
        prioritize: () => {
            const scene = /* tu referencia a la escena actual */;
            if (scene) AvatarSystemController.prioritizeActiveUsers(scene);
        }
    };
    
    console.log("🛠️ Comandos de avatar disponibles en window.avatarSystem");
}

export default GameSceneExample;

/* 
RESUMEN DE CAMBIOS NECESARIOS EN TU CÓDIGO EXISTENTE:

1. Importar AvatarSystemController en tu escena principal
2. Llamar await AvatarSystemController.init(this) en create()
3. Configurar listeners para eventos (opcional pero recomendado)
4. Llamar AvatarSystemController.removeUser(userId) cuando usuarios se desconecten
5. AddUserController y UserChangeAvatarController ya están actualizados

BENEFICIOS:
- No más freezes: Carga en paralelo sin bloquear hilo principal
- Fallback inteligente: GATA/RASTA siempre disponibles inmediatamente
- Actualización automática: Usuarios ven avatar correcto cuando se carga
- Cache optimizado: Integra con tu sistema de cache existente
- Monitoreo: Estadísticas y debugging en tiempo real
- Limpieza automática: Gestión de memoria mejorada

COMPATIBILIDAD:
- Funciona con tu sistema de cache existente
- Mantiene compatibilidad con código existente
- Fallback gradual: si falla, vuelve al sistema anterior
*/