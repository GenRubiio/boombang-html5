const Log = require('../../../utils/Log');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const IslandsConfigApiService = require('../../../services-api/IslandsConfigApiService');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');

class GetIslandsConfigController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                Log.error('User not authenticated in GetIslandsConfigController');
                socket.emit(ResponseSocketsEnum.GET_ISLANDS_CONFIG_ERROR, {
                    message: 'Usuario no autenticado'
                });
                return;
            }

            const islandsConfigData = await IslandsConfigApiService.getAll(user);
            socket.emit(ResponseSocketsEnum.GET_ISLANDS_CONFIG_SUCCESS, islandsConfigData);

        } catch (err) {
            Log.error('Error in GetIslandsConfigController: ' + err);
            socket.emit(ResponseSocketsEnum.GET_ISLANDS_CONFIG_ERROR, {
                message: 'Error al obtener las configuraciones de islas'
            });
        }
    }
}

module.exports = GetIslandsConfigController;
