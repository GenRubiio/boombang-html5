
const UpdatePublicScenesController = require('../lobby/UpdatePublicScenesController');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PublicScenesCollection = require('../../../collections/PublicScenesCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const UserResource = require('../../../resources/UserResource');
const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const PublicSceneResource = require('../../../resources/PublicSceneResource');

class UserJoinPublicSceneController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                //throw new Error("User not found");
                return;
            }
            const scene = PublicScenesCollection.getByUid(data.sceneUuid);
            if (!scene) {
                throw new Error("Public area not found");
            }
            if (scene.containsUser(user) || user.currentArea) {
                //throw new Error("User already in area");
                return;
            }

            user.setArea(scene);
            scene.addUser(user);
            let sceneUsers = [];
            for (const user of scene.users) {
                sceneUsers.push(await new UserResource(user).toObject());
            }
            socket.emit(ResponseSocketsEnum.JOIN_PUBLIC_SCENE, {
                success: true,
                data: {
                    players: sceneUsers,
                    scenery: await new PublicSceneResource(scene).toObject()
                }
            });
            scene.emitToAllExcept(ResponseSocketsEnum.NEW_USER_JOIN_PUBLIC_SCENE, {
                user: await new UserResource(user).toObject(),
            }, user);

            UpdatePublicScenesController.main(io);
        } catch (err) {
            Log.error('Error in UserJoinPublicSceneController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}
module.exports = UserJoinPublicSceneController;