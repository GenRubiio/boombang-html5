const RemoveUserFromSceneTask = require('../../../tasks/RemoveUserFromSceneTask');
const UserResource = require('../../../resources/UserResource');
const PublicSceneResource = require('../../../resources/PublicSceneResource');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const PublicScenesCollection = require('../../../collections/PublicScenesCollection');
const GameScenesCollection = require('../../../collections/GameScenesCollection');
const Log = require('../../../utils/Log');

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

            user.setArea(scene);
            scene.addUser(user, {
                x: parseInt(arrow.position_door_x),
                y: parseInt(arrow.position_door_y),
                z: parseInt(arrow.position_door_z)
            });

            let sceneUsers = [];
            for (const user of scene.users) {
                sceneUsers.push(await new UserResource(user).toObject());
            }

            user.emit(ResponseSocketsEnum.JOIN_PUBLIC_SCENE, {
                success: true,
                data: {
                    players: sceneUsers,
                    scenery: await new PublicSceneResource(scene).toObject(),
                    authUser: await new UserResource(user).toObject()
                }
            });

            scene.emitToAllExcept(ResponseSocketsEnum.NEW_USER_JOIN_SCENE, {
                user: await new UserResource(user).toObject(),
            }, user);
        } catch (err) {
            console.error('Error in SendUserToSceneController:', err);
            //Log.error('Error in SendUserToSceneController:', err);
            //user.socket.emit('error_critical');
        }
    }
}

module.exports = SendUserToSceneController;