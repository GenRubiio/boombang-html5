
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');
const UpdatePublicScenesController = require('../controllers/game/lobby/UpdatePublicScenesController');
const RemoveSelectedUserTask = require('./RemoveSelectedUserTask');
const SceneTypesEnum = require('../enums/SceneTypesEnum');

class RemoveUserFromSceneTask {
    static main(scene, user) {
        try {
            // Validar parámetros de entrada
            if (!scene || !user) {
                logger.log('Invalid scene or user parameters in RemoveUserFromSceneTask', 'error');
                return;
            }

            if (!scene.containsUser || typeof scene.containsUser !== 'function') {
                logger.log('Scene does not have containsUser method', 'error');
                return;
            }

            if (!scene.containsUser(user)) {
                logger.log(`User ${user.username} not in scene ${scene.id}`, 'warning');
                return;
            }

            console.log('RemoveUserFromSceneTask: ' + user.username + ' from scene: ' + scene.id);
            
            // Validar que el usuario tenga socket activo
            if (user.socket && typeof user.emit === 'function') {
                user.emit(ResponseSocketsEnum.REMOVE_USER_SCENE);
            }

            // Ejecutar tareas de limpieza
            if (typeof RemoveSelectedUserTask.main === 'function') {
                RemoveSelectedUserTask.main(user);
            }

            // Remover usuario de la escena
            if (scene.removeUser && typeof scene.removeUser === 'function') {
                scene.removeUser(user);
            }

            // Cancelar movimiento del usuario
            if (user.cancelMovement && typeof user.cancelMovement === 'function') {
                user.cancelMovement();
            }

            // Limpiar área del usuario
            if (user.setArea && typeof user.setArea === 'function') {
                user.setArea(null);
            }

            // Notificar a otros usuarios
            if (scene.emitToAllExcept && typeof scene.emitToAllExcept === 'function' && user.socket) {
                scene.emitToAllExcept(ResponseSocketsEnum.USER_LEFT_PUBLIC_SCENE, {
                    socketId: user.socket.id
                }, user);
            }

            // Actualizar escenas públicas si es necesario
            if (scene.scene_type == SceneTypesEnum.PUBLIC_SCENE) {
                if (typeof UpdatePublicScenesController.main === 'function') {
                    UpdatePublicScenesController.main();
                }
            }
        }
        catch (err) {
            console.error('Error in RemoveUserFromSceneTask:', err);
            logger.log(`Error removing user ${user?.username || 'unknown'} from scene ${scene?.id || 'unknown'}: ${err.message}`, 'error');
        }
    }
}

module.exports = RemoveUserFromSceneTask;