
const uuidv4 = require('uuid');
const RemoveUserFromSceneTask = require('../../../tasks/RemoveUserFromSceneTask');
const UserResource = require('../../../resources/UserResource');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const PublicSceneResource = require('../../../resources/PublicSceneResource');
const PublicSceneApiService = require('../../../services-api/PublicSceneApiService');
const PublicSceneModel = require('../../../models/PublicSceneModel');

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
            console.log('UserForcedJoinSceneController: ' + user.username + ' joining scene: ' + newScene.id);
            user.setArea(newScene);
            newScene.addUser(user);
            let sceneUsers = [];
            for (const user of newScene.users) {
                sceneUsers.push(await new UserResource(user).toObject());
            }
            user.socket.emit(ResponseSocketsEnum.JOIN_PUBLIC_SCENE, {
                success: true,
                data: {
                    players: sceneUsers,
                    scenery: await new PublicSceneResource(newScene).toObject(),
                    authUser: await new UserResource(user).toObject()
                }
            });
            newScene.emitToAllExcept(ResponseSocketsEnum.NEW_USER_JOIN_SCENE, {
                user: await new UserResource(user).toObject(),
            }, user);

        } catch (err) {
            console.log(err);
        }
    }
}
module.exports = UserForcedJoinSceneController;