const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PrivateSceneApiService = require('../../../services-api/PrivateSceneApiService');

class UpdatePrivateSceneColorsController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                socket.emit(ResponseSocketsEnum.ERROR_PRIVATE_SCENE_COLORS_UPDATE, {
                    message: 'User not found'
                });
                return;
            }

            const { sceneId, colors } = data;

            if (!sceneId) {
                socket.emit(ResponseSocketsEnum.ERROR_PRIVATE_SCENE_COLORS_UPDATE, {
                    message: 'Scene ID is required',
                    sceneId: sceneId
                });
                return;
            }

            if (!colors || typeof colors !== 'object') {
                socket.emit(ResponseSocketsEnum.ERROR_PRIVATE_SCENE_COLORS_UPDATE, {
                    message: 'Colors object is required',
                    sceneId: sceneId
                });
                return;
            }

            // Validar que los colores sean hexadecimales válidos
            const hexPattern = /^[0-9a-fA-F]{6}$/;
            for (const [key, value] of Object.entries(colors)) {
                if (!hexPattern.test(value)) {
                    socket.emit(ResponseSocketsEnum.ERROR_PRIVATE_SCENE_COLORS_UPDATE, {
                        message: `Invalid color format for ${key}: ${value}`,
                        sceneId: sceneId
                    });
                    return;
                }
            }

            // Llamar a la API para actualizar los colores de la escena
            const response = await PrivateSceneApiService.updateColors({
                sceneId: sceneId,
                colors: colors
            }, user);

            if (response.success) {
                socket.emit(ResponseSocketsEnum.PRIVATE_SCENE_COLORS_UPDATED, {
                    success: true,
                    sceneId: sceneId,
                    colors: colors
                });

                // Notificar a otros usuarios en la escena si están conectados
                const roomName = `private_scene_${sceneId}`;
                socket.to(roomName).emit(ResponseSocketsEnum.PRIVATE_SCENE_COLORS_UPDATED, {
                    success: true,
                    sceneId: sceneId,
                    colors: colors
                });
            } else {
                socket.emit(ResponseSocketsEnum.ERROR_PRIVATE_SCENE_COLORS_UPDATE, {
                    message: response.message || 'Failed to update scene colors',
                    sceneId: sceneId
                });
            }

        } catch (error) {
            console.error('UpdatePrivateSceneColorsController error:', error);

            let errorMessage = 'An error occurred while updating scene colors';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            socket.emit(ResponseSocketsEnum.ERROR_PRIVATE_SCENE_COLORS_UPDATE, {
                message: errorMessage,
                sceneId: data.sceneId
            });
        }
    }
}

module.exports = UpdatePrivateSceneColorsController;
