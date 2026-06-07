const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PrivateSceneApiService = require('../../../services-api/PrivateSceneApiService');
const PrivateScenesCollection = require('../../../collections/PrivateScenesCollection');
const RemoveUserFromSceneTask = require('../../../tasks/RemoveUserFromSceneTask');

class DeletePrivateSceneController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                socket.emit(ResponseSocketsEnum.ERROR_PRIVATE_SCENE_DELETE, {
                    message: 'User not found'
                });
                return;
            }

            const { sceneId } = data;

            if (!sceneId) {
                socket.emit(ResponseSocketsEnum.ERROR_PRIVATE_SCENE_DELETE, {
                    message: 'Scene ID is required',
                    sceneId: sceneId
                });
                return;
            }

            // Buscar la escena en la colección de escenas privadas
            const privateScene = PrivateScenesCollection.getById(sceneId);

            // Guardar el island_id antes de eliminar la escena (necesario para notificar a usuarios)
            let islandId = null;
            if (privateScene && privateScene.island_id) {
                islandId = privateScene.island_id;
            }

            // Si la escena existe y tiene usuarios, expulsarlos
            if (privateScene && privateScene.users && privateScene.users.length > 0) {
                // Hacer una copia del array de usuarios para evitar problemas al modificar durante la iteración
                const usersToRemove = [...privateScene.users];

                // Expulsar a cada usuario de la escena
                usersToRemove.forEach(sceneUser => {
                    RemoveUserFromSceneTask.main(privateScene, sceneUser);
                });
            }

            // Llamar a la API para eliminar la escena
            // La API se encargará de limpiar los objetos (poner private_scene_id a null)
            const response = await PrivateSceneApiService.delete({
                sceneId: sceneId
            }, user);

            if (response.success) {
                // Notificar a TODOS los usuarios viendo la isla (incluyendo el que eliminó)
                if (islandId) {
                    const roomName = `island_${islandId}`;
                    // io.in(roomName).emit incluye a TODOS los usuarios en la room (incluso el que emitió)
                    io.in(roomName).emit(ResponseSocketsEnum.PRIVATE_SCENE_DELETED, {
                        success: true,
                        sceneId: sceneId
                    });
                } else {
                    // Si no hay islandId, al menos notificar al usuario que eliminó
                    socket.emit(ResponseSocketsEnum.PRIVATE_SCENE_DELETED, {
                        success: true,
                        sceneId: sceneId
                    });
                }

                // Eliminar la escena de la colección si aún existe
                if (PrivateScenesCollection.getById(sceneId)) {
                    PrivateScenesCollection.remove(sceneId);
                }
            } else {
                socket.emit(ResponseSocketsEnum.ERROR_PRIVATE_SCENE_DELETE, {
                    message: response.message || 'Failed to delete scene',
                    sceneId: sceneId
                });
            }

        } catch (error) {
            console.error('DeletePrivateSceneController error:', error);

            let errorMessage = 'An error occurred while deleting scene';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            socket.emit(ResponseSocketsEnum.ERROR_PRIVATE_SCENE_DELETE, {
                message: errorMessage,
                sceneId: data.sceneId
            });
        }
    }
}

module.exports = DeletePrivateSceneController;
