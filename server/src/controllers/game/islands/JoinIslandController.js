const Log = require('../../../utils/Log');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const IslandApiService = require('../../../services-api/IslandApiService');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const IslandModel = require('../../../models/IslandModel');
const IslandResource = require('../../../resources/IslandResource');
const DisconnectUserController = require('../../connection/DisconnectUserController');

class JoinIslandController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.currentArea) return;

            let responseIsland = await IslandApiService.joinIsland({
                islandId: data.islandId
            }, user);
            if (!responseIsland.success) {
                throw new Error('Error joining island');
            }
            const island = new IslandModel(responseIsland.island);
            const islandResource = new IslandResource(island);
            socket.emit(ResponseSocketsEnum.JOIN_ISLAND, {
                island: islandResource.toObject()
            });

        } catch (err) {
            console.error('Error in JoinIslandController:', err);
            Log.error('Error in JoinIslandController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = JoinIslandController;