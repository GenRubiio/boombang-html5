const RemoveUserFromSceneTask = require('../../../tasks/RemoveUserFromSceneTask');
const UserResource = require('../../../resources/UserResource');
const PublicSceneResource = require('../../../resources/PublicSceneResource');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const PublicScenesCollection = require('../../../collections/PublicScenesCollection');
const GameScenesCollection = require('../../../collections/GameScenesCollection');
const Log = require('../../../utils/Log');
const sceneMutex = require('../../../utils/SceneMutex');
const ConsoleLogger = require('../../../utils/ConsoleLogger');
const logger = new ConsoleLogger();

class SendUserToSceneController {
    static async main(user, arrow) {
        try {
            RemoveUserFromSceneTask.main(user.currentArea, user);

            let scene = PublicScenesCollection.getById(arrow.public_scene_id);
            if (!scene) {
                scene = GameScenesCollection.getById(arrow.public_scene_id);
            }

            if (!scene) {
                return;
            }

            // Usar el mutex global para sincronizar el acceso a la escena
            const release = await sceneMutex.acquire(scene.id);

            try {
                // Agregar usuario a la escena de manera atómica
                user.setArea(scene);
                const added = scene.addUser(user, {
                    x: parseInt(arrow.position_door_x),
                    y: parseInt(arrow.position_door_y),
                    z: parseInt(arrow.position_door_z)
                });

                if (!added) {
                    logger.log(`Failed to add user ${user.username} to scene, user already present`, 'warn');
                    return;
                }

                // Obtener la lista actualizada de usuarios
                let sceneUsers = [];
                for (const sceneUser of scene.users) {
                    sceneUsers.push(await new UserResource(sceneUser).toObject());
                }

                // Enviar respuesta al usuario que se está uniendo
                user.emit(ResponseSocketsEnum.JOIN_PUBLIC_SCENE, {
                    success: true,
                    data: {
                        players: sceneUsers,
                        scenery: await new PublicSceneResource(scene).toObject(),
                        authUser: await new UserResource(user).toObject()
                    }
                });

                // Pequeño delay antes de notificar a otros usuarios
                await new Promise(resolve => setTimeout(resolve, 50));

                // Notificar a todos los demás usuarios
                scene.emitToAllExcept(ResponseSocketsEnum.NEW_USER_JOIN_SCENE, {
                    user: await new UserResource(user).toObject(),
                }, user);
                
            } finally {
                // Liberar el mutex
                release();
            }
        } catch (err) {
            console.error('Error in SendUserToSceneController:', err);
            //Log.error('Error in SendUserToSceneController:', err);
            //user.socket.emit('error_critical');
        }
    }
}

module.exports = SendUserToSceneController;