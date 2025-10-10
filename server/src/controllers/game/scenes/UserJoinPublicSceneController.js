
const UpdatePublicScenesController = require('../lobby/UpdatePublicScenesController');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PublicScenesCollection = require('../../../collections/PublicScenesCollection');
const GameScenesCollection = require('../../../collections/GameScenesCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const UserResource = require('../../../resources/UserResource');
const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const PublicSceneResource = require('../../../resources/PublicSceneResource');
const MenuTypeEnum = require('../../../enums/MenuTypeEnum');
const sceneMutex = require('../../../utils/SceneMutex');

class UserJoinPublicSceneController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                //throw new Error("User not found");
                return;
            }
            const scene = data.menuType == MenuTypeEnum.PUBLIC_SCENE ?
                PublicScenesCollection.getByUid(data.sceneUuid) :
                GameScenesCollection.getByUid(data.sceneUuid);
            if (!scene) {
                throw new Error("Scene not found");
            }
            if (scene.containsUser(user) || user.currentArea) {
                //throw new Error("User already in area");
                return;
            }

            // Usar el mutex global para sincronizar el acceso a la escena
            const release = await sceneMutex.acquire(scene.id);

            try {
                // Agregar usuario a la escena de manera atómica
                user.setArea(scene);
                scene.addUser(user);
                
                // Obtener la lista actualizada de usuarios
                let sceneUsers = [];
                for (const sceneUser of scene.users) {
                    sceneUsers.push(await new UserResource(sceneUser).toObject());
                }
                
                // Enviar respuesta al usuario que se está uniendo
                socket.emit(ResponseSocketsEnum.JOIN_PUBLIC_SCENE, {
                    success: true,
                    data: {
                        players: sceneUsers,
                        scenery: await new PublicSceneResource(scene).toObject(),
                        authUser: await new UserResource(user).toObject()
                    }
                });
                
                // Pequeño delay antes de notificar a otros usuarios
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // Notificar a todos los demás usuarios sobre el nuevo usuario
                scene.emitToAllExcept(ResponseSocketsEnum.NEW_USER_JOIN_SCENE, {
                    user: await new UserResource(user).toObject(),
                }, user);

                UpdatePublicScenesController.main(io);
                
            } finally {
                // Liberar el mutex
                release();
            }
        } catch (err) {
            Log.error('Error in UserJoinPublicSceneController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}
module.exports = UserJoinPublicSceneController;