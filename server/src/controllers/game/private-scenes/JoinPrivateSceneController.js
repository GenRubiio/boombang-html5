const Log = require('../../../utils/Log');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PrivateSceneApiService = require('../../../services-api/PrivateSceneApiService');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const PrivateScenesCollection = require('../../../collections/PrivateScenesCollection');
const PrivateSceneModel = require('../../../models/PrivateSceneModel');
const UserResource = require('../../../resources/UserResource');
const PrivateSceneResource = require('../../../resources/PrivateSceneResource');

class JoinPrivateSceneController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.currentArea) return;

            const response = await PrivateSceneApiService.join({
                scene_id: data.sceneId,
                password: data.password
            }, user);

            if (!response.success) {
                throw new Error('Failed to join private scene');
            };

            let scene = PrivateScenesCollection.getById(data.sceneId);
            if (!scene) {
                scene = new PrivateSceneModel(response.scene.id, response.scene);
                PrivateScenesCollection.add(scene.id, scene);
            }
            if (scene.containsUser(user) || user.currentArea) {
                //throw new Error("User already in area");
                return;
            }

            user.setArea(scene);
            user.setInventory(response.user_inventory_items || []);
            scene.addUser(user);
            let sceneUsers = [];
            for (const user of scene.users) {
                sceneUsers.push(await new UserResource(user).toObject());
            }
            socket.emit(ResponseSocketsEnum.JOIN_PRIVATE_SCENE, {
                success: true,
                data: {
                    players: sceneUsers,
                    scenery: await new PrivateSceneResource(scene).toObject(),
                    userInventory: user.inventory,
                    myScene: scene.user_id == user.id,
                }
            });
            scene.emitToAllExcept(ResponseSocketsEnum.NEW_USER_JOIN_SCENE, {
                user: await new UserResource(user).toObject(),
            }, user);

        } catch (err) {
            console.error('Error in JoinPrivateSceneController:', err);
            Log.error('Error in JoinPrivateSceneController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = JoinPrivateSceneController;