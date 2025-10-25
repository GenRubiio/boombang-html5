const Log = require('../../../utils/Log');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const IslandApiService = require('../../../services-api/IslandApiService');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const IslandModel = require('../../../models/IslandModel');
const IslandResource = require('../../../resources/IslandResource');

class CreateIslandController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.currentArea) return;

            let responseIsland = await IslandApiService.createIsland({
                name: data.name,
                type: data.type,
            }, user);
            if (!responseIsland.success) {
                socket.emit(ResponseSocketsEnum.ISLAND_CREATE_ERROR, { message: 'Error creating island' });
                return;
            }
            const island = new IslandModel(responseIsland.island);
            const islandResource = new IslandResource(island);
            socket.emit(ResponseSocketsEnum.JOIN_ISLAND, {
                island: islandResource.toObject()
            });

        } catch (error) {
            let message = 'Error creating island';
            let dataError = error.response ? error.response.data : error.message;
            if (dataError && dataError.message) {
                message = dataError.message;
            }
            //console.error('Error in CreateIslandController:', error);
            //Log.error('Error in CreateIslandController: ' + error);
            socket.emit(ResponseSocketsEnum.ISLAND_CREATE_ERROR, { message: message });
        }
    }
}

module.exports = CreateIslandController;