const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PrivateSceneApiService = require('../../../services-api/PrivateSceneApiService');

class UpdatePrivateSceneNameController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                socket.emit(ResponseSocketsEnum.ERROR_PRIVATE_SCENE_NAME_UPDATE, {
                    message: 'User not found'
                });
                return;
            }

            const { sceneId, name } = data;

            if (!sceneId || !name) {
                socket.emit(ResponseSocketsEnum.ERROR_PRIVATE_SCENE_NAME_UPDATE, {
                    message: 'Scene ID and name are required',
                    sceneId: sceneId
                });
                return;
            }

            if (!name.trim()) {
                socket.emit(ResponseSocketsEnum.ERROR_PRIVATE_SCENE_NAME_UPDATE, {
                    message: 'Scene name cannot be empty',
                    sceneId: sceneId
                });
                return;
            }

            if (name.length > 50) {
                socket.emit(ResponseSocketsEnum.ERROR_PRIVATE_SCENE_NAME_UPDATE, {
                    message: 'Scene name is too long (max 50 characters)',
                    sceneId: sceneId
                });
                return;
            }

            const trimmedName = name.trim();

            // Llamar a la API para actualizar el nombre de la escena
            const response = await PrivateSceneApiService.updateName({
                sceneId: sceneId,
                name: trimmedName
            }, user);

            if (response.success) {
                socket.emit(ResponseSocketsEnum.PRIVATE_SCENE_NAME_UPDATED, {
                    success: true,
                    sceneId: sceneId,
                    name: trimmedName
                });

                // Notificar a otros usuarios en la escena si están conectados
                const roomName = `private_scene_${sceneId}`;
                socket.to(roomName).emit(ResponseSocketsEnum.PRIVATE_SCENE_NAME_UPDATED, {
                    success: true,
                    sceneId: sceneId,
                    name: trimmedName
                });
            } else {
                socket.emit(ResponseSocketsEnum.ERROR_PRIVATE_SCENE_NAME_UPDATE, {
                    message: response.message || 'Failed to update scene name',
                    sceneId: sceneId
                });
            }

        } catch (error) {
            console.error('UpdatePrivateSceneNameController error:', error);

            let errorMessage = 'An error occurred while updating scene name';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            socket.emit(ResponseSocketsEnum.ERROR_PRIVATE_SCENE_NAME_UPDATE, {
                message: errorMessage,
                sceneId: data.sceneId
            });
        }
    }
}

module.exports = UpdatePrivateSceneNameController;
