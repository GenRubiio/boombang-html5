const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const IslandApiService = require('../../../services-api/IslandApiService');
const PrivateScenesCollection = require('../../../collections/PrivateScenesCollection');

class DeleteIslandController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                socket.emit(ResponseSocketsEnum.ERROR_ISLAND_DELETE, {
                    message: 'User not found'
                });
                return;
            }

            const { islandId } = data;

            if (!islandId) {
                socket.emit(ResponseSocketsEnum.ERROR_ISLAND_DELETE, {
                    message: 'Island ID is required',
                    islandId: islandId
                });
                return;
            }

            // Obtener todas las escenas de la isla antes de eliminarla
            const scenesOfIsland = PrivateScenesCollection.getByIslandId(islandId);

            // Expulsar a todos los usuarios de todas las escenas de la isla
            if (scenesOfIsland && scenesOfIsland.length > 0) {
                // Primero enviar eventos a todos los usuarios
                scenesOfIsland.forEach(privateScene => {
                    if (privateScene.users && privateScene.users.length > 0) {
                        // Hacer una copia del array de usuarios
                        const usersToRemove = [...privateScene.users];

                        // Enviar evento a cada usuario
                        usersToRemove.forEach(sceneUser => {
                            // Emitir evento para forzar al cliente a ir al lobby
                            if (sceneUser.socket) {
                                sceneUser.socket.emit(ResponseSocketsEnum.FORCE_LOBBY_REDIRECT, {
                                    reason: 'island_deleted'
                                });
                            }
                        });
                    }
                });

                // Esperar 200ms para que los clientes procesen el evento
                await new Promise(resolve => setTimeout(resolve, 200));

                // Ahora limpiar usuarios y eliminar escenas
                scenesOfIsland.forEach(privateScene => {
                    if (privateScene.users && privateScene.users.length > 0) {
                        const usersToRemove = [...privateScene.users];

                        usersToRemove.forEach(sceneUser => {
                            // Limpiar manualmente el usuario de la escena
                            if (privateScene.removeUser && typeof privateScene.removeUser === 'function') {
                                privateScene.removeUser(sceneUser);
                            }
                            if (sceneUser.setArea && typeof sceneUser.setArea === 'function') {
                                sceneUser.setArea(null);
                            }
                        });
                    }

                    // Eliminar la escena de la colección
                    PrivateScenesCollection.remove(privateScene.id);
                });
            }

            // Llamar a la API para eliminar la isla (incluye cascade delete de escenas e items)
            const response = await IslandApiService.delete({
                islandId: islandId
            }, user);

            if (response.success) {
                // Notificar a todos los usuarios viendo la isla
                const roomName = `island_${islandId}`;
                io.in(roomName).emit(ResponseSocketsEnum.ISLAND_DELETED, {
                    success: true,
                    islandId: islandId
                });

                // Forzar al propietario también a ir al lobby
                socket.emit(ResponseSocketsEnum.FORCE_LOBBY_REDIRECT, {
                    reason: 'island_deleted_owner'
                });
            } else {
                socket.emit(ResponseSocketsEnum.ERROR_ISLAND_DELETE, {
                    message: response.message || 'Failed to delete island',
                    islandId: islandId
                });
            }

        } catch (error) {
            console.error('DeleteIslandController error:', error);

            let errorMessage = 'An error occurred while deleting island';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            socket.emit(ResponseSocketsEnum.ERROR_ISLAND_DELETE, {
                message: errorMessage,
                islandId: data.islandId
            });
        }
    }
}

module.exports = DeleteIslandController;
