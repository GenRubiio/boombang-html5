const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const IslandApiService = require('../../../services-api/IslandApiService');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');

class CreateIslandController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.currentArea) return;

            let response = await IslandApiService.createIsland({
                name: data.name,
                type: data.type,
            }, user);
            if (!response.success) {
                socket.emit(ResponseSocketsEnum.ISLAND_CREATE_ERROR, { message: 'Error creating island' });
                return;
            }

        } catch (err) {
            Log.error('Error in CreateIslandController: ' + err);
            socket.emit(ResponseSocketsEnum.ISLAND_CREATE_ERROR, { message: 'Error creating island' });
        }
    }
}

module.exports = CreateIslandController;