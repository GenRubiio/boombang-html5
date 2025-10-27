const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const IslandApiService = require('../../../services-api/IslandApiService');

class UpdateIslandDescriptionController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                socket.emit(ResponseSocketsEnum.ERROR_ISLAND_DESCRIPTION_UPDATED, {
                    message: 'User not found'
                });
                return;
            }

            const { islandId, description } = data;
            
            if (!islandId) {
                socket.emit(ResponseSocketsEnum.ERROR_ISLAND_DESCRIPTION_UPDATED, {
                    message: 'Island ID is required'
                });
                return;
            }

            const trimmedDescription = description ? description.trim() : '';

            if (trimmedDescription.length > 500) {
                socket.emit(ResponseSocketsEnum.ERROR_ISLAND_DESCRIPTION_UPDATED, {
                    message: 'Island description is too long (max 500 characters)'
                });
                return;
            }

            // Llamar a la API para actualizar la descripción de la isla
            const response = await IslandApiService.updateDescription({
                islandId: islandId,
                description: trimmedDescription
            }, user);

            if (response.success) {
                socket.emit(ResponseSocketsEnum.ISLAND_DESCRIPTION_UPDATED, {
                    success: true,
                    islandId: islandId,
                    description: trimmedDescription || null
                });

                // Notificar a otros usuarios en la isla si están conectados
                const roomName = `island_${islandId}`;
                socket.to(roomName).emit(ResponseSocketsEnum.ISLAND_DESCRIPTION_UPDATED, {
                    success: true,
                    islandId: islandId,
                    description: trimmedDescription || null
                });
            } else {
                socket.emit(ResponseSocketsEnum.ERROR_ISLAND_DESCRIPTION_UPDATED, {
                    message: response.message || 'Failed to update island description'
                });
            }

        } catch (error) {
            console.error('UpdateIslandDescriptionController error:', error);
            
            let errorMessage = 'An error occurred while updating island description';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            socket.emit(ResponseSocketsEnum.ERROR_ISLAND_DESCRIPTION_UPDATED, {
                message: errorMessage
            });
        }
    }
}

module.exports = UpdateIslandDescriptionController;