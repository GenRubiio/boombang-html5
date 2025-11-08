/**
 * VisibilityManager - Maneja la sincronización inicial de animaciones al entrar a escenas
 * 
 * Soluciona el problema de posiciones incorrectas al entrar a una sala
 * sincronizando las posiciones después de que termine el loading.
 */
import RequestSocketsEnum from '../../enums/RequestSocketsEnum.js';

class VisibilityManager {
    constructor() {
        this.game = null;
    }

    setGame(game) {
        this.game = game;
    }

    /**
     * Sincronización inicial cuando se entra a una nueva escena
     * Se llama después de que la escena esté completamente cargada
     */
    onSceneLoaded(scene) {
        if (!scene) return;

        const sceneKey = scene.scene?.key;
        if (!sceneKey) return;

        // Verificar que es una escena de juego válida
        if (sceneKey !== 'PublicScene' && sceneKey !== 'PrivateScene' && sceneKey !== 'MinigameScene') {
            return;
        }

        // Pequeño delay para asegurar que todos los usuarios estén procesados
        setTimeout(() => {
            this.performSync(scene);
        }, 300);
    }

    /**
     * Realiza sincronización de una escena específica
     */
    performSync(scene) {
        try {
            // Solicitar sincronización del servidor
            this.requestServerSync();

            // Sincronizar posiciones de todos los usuarios
            if (scene.users && typeof scene.users === 'object') {
                Object.values(scene.users).forEach(user => {
                    this.syncUser(scene, user);
                });
            }

        } catch (error) {
            console.warn('[VisibilityManager] Error en sincronización:', error);
        }
    }

    /**
     * Sincroniza un usuario específico - siempre corrige posición
     */
    syncUser(scene, user) {
        if (!user || !user.spriteAvatar || !user.containerUser || !user.position) return;

        try {
            const gameConfig = window.gameConfig || { DPI: 2 };
            const tileWidth = 65 * gameConfig.DPI;
            const tileHeight = 33 * gameConfig.DPI;

            // Calcular posición esperada
            const expectedX = (user.position.x - user.position.y) * (tileWidth / gameConfig.DPI) + scene.scale.width / gameConfig.DPI;
            const expectedY = (user.position.x + user.position.y) * (tileHeight / gameConfig.DPI);

            // Siempre mover a posición correcta inmediatamente
            user.containerUser.setPosition(expectedX, expectedY);
            user.containerUser.setDepth(expectedY);

            // Detener cualquier tween que pueda estar corriendo
            if (user.currentTween) {
                user.currentTween.stop();
                user.currentTween = null;
            }

            // Limpiar path si existe
            user.path = [];
            user.pathIndex = 0;

            // Aplicar animación idle correcta
            if (user.spriteAvatar && user.avatarId) {
                import('../animations/UserIdleAnimation.js').then(({ default: UserIdleAnimation }) => {
                    UserIdleAnimation.main(
                        user.spriteAvatar,
                        user.position.z || 'down',
                        user.avatarId
                    );
                }).catch(error => {
                    console.warn('Error al aplicar animación idle:', error);
                });
            }

        } catch (error) {
            console.warn(`[VisibilityManager] Error al sincronizar usuario ${user.id}:`, error);
        }
    }

    /**
     * Solicita sincronización del servidor
     */
    requestServerSync() {
        if (window.socket && typeof window.socket.emit === 'function') {
            try {
                window.socket.emit(RequestSocketsEnum.REQUEST_USERS_SYNC);
            } catch (error) {
                console.warn('Error al solicitar sincronización del servidor:', error);
            }
        }
    }

    /**
     * Sincroniza todas las escenas activas
     */
    syncAllScenes() {
        if (!this.game || !this.game.scene) return;

        try {
            const activeScenes = this.game.scene.getScenes(true);
            const gameScenes = activeScenes.filter(scene => 
                scene && 
                scene.scene && 
                scene.scene.key && 
                (scene.scene.key === 'PublicScene' || 
                 scene.scene.key === 'PrivateScene' || 
                 scene.scene.key === 'MinigameScene')
            );
            
            if (gameScenes.length === 0) return;
            
            gameScenes.forEach(scene => {
                this.performSync(scene);
            });
        } catch (error) {
            console.warn('[VisibilityManager] Error al sincronizar escenas:', error);
        }
    }
}

// Crear instancia única
const visibilityManager = new VisibilityManager();

export default visibilityManager;