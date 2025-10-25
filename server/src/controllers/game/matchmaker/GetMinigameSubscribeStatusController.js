const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');

class GetMinigameSubscribeStatusController {
    static async main(socket, io, matchMakers, data) {
        try {
            const sceneType = data.type;
            if (!sceneType) {
                console.error('Tipo de minijuego no especificado');
                return;
            }

            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                console.error('Usuario no encontrado');
                return;
            }

            const matchmaker = matchMakers[sceneType];
            if (!matchmaker) {
                console.error(`Matchmaker para el tipo ${sceneType} no encontrado`);
                return;
            }

            const isSubscribed = matchmaker.isUserInQueue(socket.id, sceneType);

            socket.emit(ResponseSocketsEnum.MINIGAME_SUBSCRIBE_STATUS, {
                success: true,
                isSubscribed,
                npcId: sceneType
            });

        } catch (err) {
            Log.error('Error in GetMinigameSubscribeStatusController: ' + err);
        }
    }
}

module.exports = GetMinigameSubscribeStatusController;
