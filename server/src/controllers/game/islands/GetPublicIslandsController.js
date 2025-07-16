const Log = require('../../../utils/Log');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const IslandApiService = require('../../../services-api/IslandApiService');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const IslandModel = require('../../../models/IslandModel');
const IslandResource = require('../../../resources/IslandResource');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const PrivateScenesCollection = require('../../../collections/PrivateScenesCollection');

class GetPublicIslandsController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.currentArea) return;
            let privateScenes = PrivateScenesCollection.getAll();
            let uniqueIslands = new Map();
            privateScenes.forEach(scene => {
                if (scene.island) {
                    if (!uniqueIslands.has(scene.island.id)) {
                        let clonIsland = { ...scene.island };
                        uniqueIslands.set(scene.island.id, clonIsland);
                    }
                    //update visitors count
                    let island = uniqueIslands.get(scene.island.id);
                    island.visitors += scene.users.length;
                }
            });

            const islands = Array.from(uniqueIslands.values()).map(islandData => new IslandModel(islandData));
            const islandsResource = islands.length ? IslandResource.collection(islands) : [];

            socket.emit(ResponseSocketsEnum.UPDATE_PUBLIC_ISLANDS, {
                islands: islandsResource
            });
        } catch (err) {
            Log.error('Error in GetPublicIslandsController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = GetPublicIslandsController;