const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const SceneTypesEnum = require('../../../enums/SceneTypesEnum');

class MinigameSuscribeController {
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

            if (user.currentArea && (user.currentArea.scene_type != SceneTypesEnum.MINIGAME_RING)) {
                // Alterna la suscripción del usuario
                matchMakers[sceneType].register(socket, sceneType);

                // Emite una respuesta para que el cliente actualice la UI
                socket.emit(ResponseSocketsEnum.MINIGAME_SUBSCRIBE, {
                    success: true,
                    npcId: sceneType
                });
            }

        } catch (err) {
            Log.error('Error in MinigameSuscribeController: ' + err);
        }
    }
}

module.exports = MinigameSuscribeController;