const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const GameClock = require('../../../utils/GameClock');
const Log = require('../../../utils/Log');

class RefreshCreditsUserController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                // Usuario no encontrado, simplemente logear y no hacer nada más
                Log.warning(`RefreshCreditsUserController: User not found for socket ${socket.id}`);
                return;
            }
            
            socket.emit(ResponseSocketsEnum.REFRESH_USER_CREDITS, {
                gold: user.goldCoins,
                silver: user.silverCoins,
                game_time: GameClock.getCurrentGameTime()
            });
        } catch (err) {
            Log.error('Error in RefreshCreditsUserController: ' + err);
            // No desconectar al usuario por este error, solo logearlo
        }
    }
}

module.exports = RefreshCreditsUserController;