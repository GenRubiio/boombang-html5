const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');

class MinigameSuscribeController {
    static async main(socket, io, matchMakers, data) {
        try {
            const { type } = data;
            if (!type) {
                console.error('Tipo de minijuego no especificado');
                //socket.emit(ResponseSocketsEnum.ERROR, 'Tipo de minijuego no especificado');
                return;
            }

            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                console.error('Usuario no encontrado');
                //socket.emit(ResponseSocketsEnum.ERROR, 'Usuario no encontrado');
                return;
            }

            // Añadir el socket a la lista de espera del minijuego
            matchMakers[type].register(socket, type, (players, type) => {
                matchMakers[type].createMinigame(type, players, io);
                //socket.emit(ResponseSocketsEnum.MINIGAME_SUBSCRIBE_SUCCESS, { type });
            });
        } catch (err) {
            Log.error('Error in MinigameSuscribeController: ' + err);
        }
    }
}

module.exports = MinigameSuscribeController;