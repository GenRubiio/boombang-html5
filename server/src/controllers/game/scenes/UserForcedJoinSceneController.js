
const uuidv4 = require('uuid');
const RemoveUserFromSceneTask = require('../../../tasks/RemoveUserFromSceneTask');
const UserResource = require('../../../resources/UserResource');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const PublicSceneResource = require('../../../resources/PublicSceneResource');
const PublicSceneApiService = require('../../../services-api/PublicSceneApiService');
const PublicSceneModel = require('../../../models/PublicSceneModel');
const sceneMutex = require('../../../utils/SceneMutex');

class UserForcedJoinSceneController {
    static async main(user, sceneType) {
        try {
            const response = await PublicSceneApiService.get();
            if (!response || !response.scenes || !response.scenes.length) {
                logger.log('Error loading public scenes', 'error');
                return;
            }
            let newScene = null;
            const scenes = response.scenes;
            scenes.forEach(scene => {
                if (scene.type == sceneType) {
                    const uuid = uuidv4.v4();
                    newScene = new PublicSceneModel(uuid, scene);
                }
            });
            if (!newScene) {
                return;
            }
            RemoveUserFromSceneTask.main(user.currentArea, user);

            if (newScene.containsUser(user) || user.currentArea) {
                //throw new Error("User already in area");
                return;
            }

            // Usar el mutex global para sincronizar el acceso a la escena
            const release = await sceneMutex.acquire(newScene.id);

            try {
                console.log('UserForcedJoinSceneController: ' + user.username + ' joining scene: ' + newScene.id);
                
                // Agregar usuario a la escena de manera atómica
                user.setArea(newScene);
                newScene.addUser(user);
                
                // Obtener la lista actualizada de usuarios
                let sceneUsers = [];
                for (const sceneUser of newScene.users) {
                    sceneUsers.push(await new UserResource(sceneUser).toObject());
                }
                
                // Enviar respuesta al usuario que se está uniendo
                user.socket.emit(ResponseSocketsEnum.JOIN_PUBLIC_SCENE, {
                    success: true,
                    data: {
                        players: sceneUsers,
                        scenery: await new PublicSceneResource(newScene).toObject(),
                        authUser: await new UserResource(user).toObject()
                    }
                });
                
                // Pequeño delay antes de notificar a otros usuarios
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // Notificar a todos los demás usuarios
                newScene.emitToAllExcept(ResponseSocketsEnum.NEW_USER_JOIN_SCENE, {
                    user: await new UserResource(user).toObject(),
                }, user);
                
            } finally {
                // Liberar el mutex
                release();
            }

        } catch (err) {
            console.log(err);
        }
    }
}
module.exports = UserForcedJoinSceneController;