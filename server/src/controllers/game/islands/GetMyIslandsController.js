const Log = require('../../../utils/Log');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const IslandApiService = require('../../../services-api/IslandApiService');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const IslandModel = require('../../../models/IslandModel');
const IslandResource = require('../../../resources/IslandResource');
const DisconnectUserController = require('../../connection/DisconnectUserController');

class GetMyIslandsController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.currentArea) return;

            let responseIslands = await IslandApiService.getAll(user);
            if (!responseIslands.success) {
                throw new Error('Error fetching islands');
            }
            const islands = responseIslands.islands.map(islandData => new IslandModel(islandData));
            const islandsResource = IslandResource.collection(islands);
            socket.emit(ResponseSocketsEnum.GET_MY_ISLANDS, {
                islands: islandsResource
            });

        } catch (err) {
            Log.error('Error in GetMyIslandsController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = GetMyIslandsController;