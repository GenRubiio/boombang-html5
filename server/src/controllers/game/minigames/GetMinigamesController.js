const MinigameService = require('../../../services/MinigameService');
const Log = require('../../../utils/Log');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');

class GetMinigamesController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                Log.error('User not authenticated in GetMinigamesController');
                socket.emit('error_critical');
                return;
            }

            const minigamesData = await MinigameService.getMinigames(user.authJwt);

            socket.emit(ResponseSocketsEnum.MINIGAMES_LIST, minigamesData);

        } catch (err) {
            console.log(err);
            //Log.error('Error in GetMinigamesController: ' + err);
            socket.emit(ResponseSocketsEnum.MINIGAMES_LIST, {
                success: false,
                error: 'Error obteniendo minijuegos'
            });
        }
    }
}

module.exports = GetMinigamesController;