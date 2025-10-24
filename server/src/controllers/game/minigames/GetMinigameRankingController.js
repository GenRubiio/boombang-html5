const MinigameService = require('../../../services/MinigameService');
const Log = require('../../../utils/Log');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');

class GetMinigameRankingController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                Log.error('User not authenticated in GetMinigameRankingController');
                socket.emit('error_critical');
                return;
            }

            const { minigameId, weekId, page = 1, perPage = 20 } = data;

            if (!minigameId || !weekId) {
                socket.emit(ResponseSocketsEnum.MINIGAME_RANKING, {
                    success: false,
                    error: 'minigameId y weekId son requeridos'
                });
                return;
            }

            const rankingData = await MinigameService.getRanking(
                minigameId,
                weekId,
                page,
                perPage,
                user.authJwt
            );

            socket.emit(ResponseSocketsEnum.MINIGAME_RANKING, rankingData);

        } catch (err) {
            console.log(err);
            //Log.error('Error in GetMinigameRankingController: ' + err);
            socket.emit(ResponseSocketsEnum.MINIGAME_RANKING, {
                success: false,
                error: 'Error obteniendo ranking del minijuego'
            });
        }
    }
}

module.exports = GetMinigameRankingController;