const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const LobbyService = require('../../../services/LobbyService');

class SettingsUpdateLangController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }

            if (user.currentArea) return;

            const response = await LobbyService.updateSettingsLang(user, data.lang);
            
            socket.emit(ResponseSocketsEnum.SETTINGS_UPDATE_LANG, {
                success: response.success,
                message: response.message,
                error: response.error
            });

        } catch (err) {
            socket.emit(ResponseSocketsEnum.SETTINGS_UPDATE_LANG, {
                success: false,
                message: 'Error.'
            });
            Log.error('Error in SettingsUpdateLangController: ' + err);
        }
    }
}

module.exports = SettingsUpdateLangController;