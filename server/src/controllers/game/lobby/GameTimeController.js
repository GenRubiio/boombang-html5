const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const GameClock = require('../../../utils/GameClock');

class GameTimeController {
    static async main(socket, io, data) {
        try {
            let user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.currentArea) return;

            // Obtener el tiempo actual del juego
            const currentGameTime = GameClock.getCurrentGameTime();
            const gameTimeObject = GameClock.getCurrentGameTimeObject();

            socket.emit(ResponseSocketsEnum.GAME_TIME, {
                success: true,
                data: {
                    game_time: currentGameTime,
                    hours: gameTimeObject.hours,
                    minutes: gameTimeObject.minutes,
                    timestamp: Date.now()
                }
            });
        } catch (err) {
            Log.error('Error in GameTimeController: ' + err);
            socket.emit(ResponseSocketsEnum.GAME_TIME, {
                success: false,
                error: 'Error getting game time'
            });
        }
    }
}

module.exports = GameTimeController;