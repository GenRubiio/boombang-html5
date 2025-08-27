const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const LobbyService = require('../../../services/LobbyService');

class GachaSpinController {
    static async main(socket, io, data) {
        try {
            let user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.currentArea) return;

            if (user.silverCoins < 100) {
                socket.emit(ResponseSocketsEnum.LOBBY_GACHA_SPIN, {
                    success: false,
                    message: 'Not enough silver coins'
                });
                return;
            }

            await LobbyService.gachaponSpin(socket, user);
        } catch (err) {
            socket.emit(ResponseSocketsEnum.LOBBY_GACHA_SPIN, {
                success: false,
                message: 'An error occurred'
            });
            Log.error('Error in GachaSpinController: ' + err);
        }
    }
}

module.exports = GachaSpinController;