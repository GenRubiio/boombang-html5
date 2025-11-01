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

            // Salir de cualquier room de isla anterior primero
            const rooms = Array.from(socket.rooms);
            rooms.forEach(room => {
                if (room.startsWith('island_')) {
                    socket.leave(room);
                }
            });

            // Unirse a la room de la isla siempre (incluso si ya tiene currentArea)
            const roomName = `island_${data.islandId}`;
            socket.join(roomName);

            // Si el usuario ya está en un área, solo hacer join a la room sin llamar a la API
            if (user.currentArea) {
                return;
            }

            let responseIsland = await IslandApiService.joinIsland({
                islandId: data.islandId
            }, user);
            if (!responseIsland.success) {
                throw new Error('Error joining island');
            }
            const island = new IslandModel(responseIsland.island);

            // Enriquecer las escenas con el conteo de usuarios conectados en tiempo real
            if (island.scenes && island.scenes.length > 0) {
                const PrivateScenesCollection = require('../../../collections/PrivateScenesCollection');
                island.scenes = island.scenes.map(scene => {
                    const liveScene = PrivateScenesCollection.getById(scene.id);
                    return {
                        ...scene,
                        user_count: liveScene && liveScene.users ? liveScene.users.length : 0
                    };
                });
            }

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