const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PrivateSceneApiService = require('../../../services-api/PrivateSceneApiService');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const PrivateSceneModel = require('../../../models/PrivateSceneModel');
const PrivateScenesCollection = require('../../../collections/PrivateScenesCollection');

class CreatePrivateSceneController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.currentArea) return;

            let response = await PrivateSceneApiService.create({
                island_id: data.island_id,
                name: data.name,
                type: data.type,
            }, user);
            if (!response.success) {
                socket.emit(ResponseSocketsEnum.PRIVATE_SCENE_CREATE_ERROR, { message: 'Error creating private scene' });
                return;
            }

            let scene = new PrivateSceneModel(response.scene.id, response.scene);
            PrivateScenesCollection.add(scene.id, scene);

            await scene.userJoin(user, response.user_inventory_items || [], response.scene_config || {});
        } catch (error) {
            //console.error('Error in CreateIslandController:', error);
            //Log.error('Error in CreateIslandController: ' + error);
            let message = 'Error creating private scene';
            let dataError = error.response ? error.response.data : error.message;
            if (dataError && dataError.message) {
                message = dataError.message;
            }
            socket.emit(ResponseSocketsEnum.PRIVATE_SCENE_CREATE_ERROR, { message: message });
        }
    }
}

module.exports = CreatePrivateSceneController;