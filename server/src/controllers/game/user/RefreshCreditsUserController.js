
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const GameClock = require('../../../utils/GameClock');
const Log = require('../../../utils/Log');

class RefreshCreditsUserController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            
            socket.emit(ResponseSocketsEnum.REFRESH_USER_CREDITS, {
                gold: user.goldCoins,
                silver: user.silverCoins,
                game_time: GameClock.getCurrentGameTime()
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