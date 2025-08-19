
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const Log = require('../../../utils/Log');

class RefreshCreditsUserController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (!user.currentArea) return;

            socket.emit(ResponseSocketsEnum.REFRESH_USER_CREDITS, {
                gold: user.goldCoins,
                silver: user.silverCoins
            });
        } catch (err) {
            console.log(err);
            Log.error('Error in RefreshCreditsUserController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = RefreshCreditsUserController;