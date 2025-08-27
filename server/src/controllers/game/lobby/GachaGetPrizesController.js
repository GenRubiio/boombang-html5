const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const LobbyService = require('../../../services/LobbyService');

class GachaGetPrizesController {
    static async main(socket, io, data) {
        try {
            let user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.currentArea) return;

            const prizes = await LobbyService.getGachaponPrizes(user);
            socket.emit(ResponseSocketsEnum.GET_GACHA_PRIZES, {
                success: true,
                data: prizes
            });
        } catch (err) {
            socket.emit(ResponseSocketsEnum.GET_GACHA_PRIZES, {
                success: false,
                message: 'An error occurred'
            });
            Log.error('Error in GachaGetPrizesController: ' + err);
        }
    }
}

module.exports = GachaGetPrizesController;