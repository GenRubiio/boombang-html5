const Log = require('../../../utils/Log');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PrivateSceneConfigApiService = require('../../../services-api/PrivateSceneConfigApiService');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');

class GetPrivateSceneConfigByIslandController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                Log.error('User not authenticated in GetPrivateSceneConfigByIslandController');
                socket.emit(ResponseSocketsEnum.GET_PRIVATE_SCENE_CONFIG_BY_ISLAND_ERROR, {
                    message: 'Usuario no autenticado'
                });
                return;
            }

            if (!data || !data.island_config_id) {
                socket.emit(ResponseSocketsEnum.GET_PRIVATE_SCENE_CONFIG_BY_ISLAND_ERROR, {
                    message: 'island_config_id es requerido'
                });
                return;
            }

            const privateSceneConfigData = await PrivateSceneConfigApiService.getByIsland(data.island_config_id, user);
            socket.emit(ResponseSocketsEnum.GET_PRIVATE_SCENE_CONFIG_BY_ISLAND_SUCCESS, privateSceneConfigData);

        } catch (err) {
            Log.error('Error in GetPrivateSceneConfigByIslandController: ' + err);
            socket.emit(ResponseSocketsEnum.GET_PRIVATE_SCENE_CONFIG_BY_ISLAND_ERROR, {
                message: 'Error al obtener las configuraciones de escenas'
            });
        }
    }
}

module.exports = GetPrivateSceneConfigByIslandController;
