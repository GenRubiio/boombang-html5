const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const LobbyService = require('../../../services/LobbyService');

class SettingsUpdateNameController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }

            if (user.currentArea) return;

            const response = await LobbyService.updateSettingsName(user, data.username);
  
            socket.emit(ResponseSocketsEnum.SETTINGS_UPDATE_NAME, {
                success: response.success,
                message: response.message,
                error: response.error
            });

        } catch (err) {
            socket.emit(ResponseSocketsEnum.SETTINGS_UPDATE_NAME, {
                success: false,
                message: 'Error.'
            });
            Log.error('Error in SettingsUpdateNameController: ' + err);
        }
    }
}

module.exports = SettingsUpdateNameController;