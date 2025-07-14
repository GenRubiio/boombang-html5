const Log = require('../../../utils/Log');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PrivateSceneApiService = require('../../../services-api/PrivateSceneApiService');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const PrivateSceneModel = require('../../../models/PrivateSceneModel');
const PrivateScenesCollection = require('../../../collections/PrivateScenesCollection');
const UserResource = require('../../../resources/UserResource');
const PrivateSceneResource = require('../../../resources/PrivateSceneResource');

class CreatePrivateSceneController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.currentArea) return;

            let responseScene = await PrivateSceneApiService.create({
                island_id: data.island_id,
                name: data.name,
                type: data.type,
            }, user);
            if (!responseScene.success) {
                socket.emit(ResponseSocketsEnum.PRIVATE_SCENE_CREATE_ERROR, { message: 'Error creating private scene' });
                return;
            }

            let scene = new PrivateSceneModel(responseScene.scene.id, responseScene.scene);
            PrivateScenesCollection.add(scene.id, scene);

            user.setArea(scene);
            scene.addUser(user);
            let sceneUsers = [];
            for (const user of scene.users) {
                sceneUsers.push(await new UserResource(user).toObject());
            }
            socket.emit(ResponseSocketsEnum.JOIN_PRIVATE_SCENE, {
                success: true,
                data: {
                    players: sceneUsers,
                    scenery: await new PrivateSceneResource(scene).toObject()
                }
            });
            scene.emitToAllExcept(ResponseSocketsEnum.NEW_USER_JOIN_SCENE, {
                user: await new UserResource(user).toObject(),
            }, user);

        } catch (err) {
            console.error('Error in CreateIslandController:', err);
            Log.error('Error in CreateIslandController: ' + err);
            socket.emit(ResponseSocketsEnum.ISLAND_CREATE_ERROR, { message: 'Error creating island' });
        }
    }
}

module.exports = CreatePrivateSceneController;