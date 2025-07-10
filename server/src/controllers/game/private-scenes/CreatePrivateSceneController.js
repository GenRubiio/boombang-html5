const Log = require('../../../utils/Log');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PrivateSceneApiService = require('../../../services-api/PrivateSceneApiService');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');

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
            //const island = new IslandModel(responseIsland.island);
            //const islandResource = new IslandResource(island);
            //socket.emit(ResponseSocketsEnum.JOIN_ISLAND, {
            //    island: islandResource.toObject()
            //});

        } catch (err) {
            console.error('Error in CreateIslandController:', err);
            Log.error('Error in CreateIslandController: ' + err);
            socket.emit(ResponseSocketsEnum.ISLAND_CREATE_ERROR, { message: 'Error creating island' });
        }
    }
}

module.exports = CreatePrivateSceneController;