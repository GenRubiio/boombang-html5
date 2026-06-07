const Log = require('../../../utils/Log');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const IslandApiService = require('../../../services-api/IslandApiService');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const IslandModel = require('../../../models/IslandModel');
const IslandResource = require('../../../resources/IslandResource');
const DisconnectUserController = require('../../connection/DisconnectUserController');

class SearchIslandsController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }

            const { query } = data;

            if (!query || typeof query !== 'string' || query.trim() === '') {
                socket.emit(ResponseSocketsEnum.SEARCH_ISLANDS, {
                    islands: []
                });
                return;
            }

            // Llamar a la API para buscar islas
            const response = await IslandApiService.searchIslands({
                query: query.trim()
            }, user);

            if (!response.success) {
                throw new Error('Error searching islands');
            }

            const islands = response.islands.map(islandData => new IslandModel(islandData));
            const islandsResource = islands.length ? IslandResource.collection(islands) : [];

            socket.emit(ResponseSocketsEnum.SEARCH_ISLANDS, {
                islands: islandsResource
            });
        } catch (err) {
            console.error('Error in SearchIslandsController:', err);
            Log.error('Error in SearchIslandsController: ' + err);
            socket.emit(ResponseSocketsEnum.SEARCH_ISLANDS, {
                islands: []
            });
        }
    }
}

module.exports = SearchIslandsController;
