const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const LobbyService = require('../../../services/LobbyService');

class SettingsUpdateSoundsController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }

            if (user.currentArea) return;

            const response = await LobbyService.updateSettingsSounds(user, data.soundSettings);
            socket.emit(ResponseSocketsEnum.SETTINGS_UPDATE_SOUNDS, {
                success: response.success,
                message: response.message,
                error: response.error
            });

        } catch (err) {
            socket.emit(ResponseSocketsEnum.SETTINGS_UPDATE_SOUNDS, {
                success: false,
                message: 'Error.'
            });
            Log.error('Error in SettingsUpdateSoundsController: ' + err);
        }
    }
}

module.exports = SettingsUpdateSoundsController;
