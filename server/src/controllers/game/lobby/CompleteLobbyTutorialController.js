const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const Log = require('../../../utils/Log');
const UserApiService = require('../../../services-api/UserApiService');

class CompleteLobbyTutorialController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }

            // Actualizar el tutorial como completado en la base de datos
            const updateResult = await UserApiService.updateLobbyTutorial(user, true);
            
            if (!updateResult.success) {
                throw new Error('Failed to update lobby tutorial status in database');
            }

            // Actualizar el estado local del usuario
            user.lobbyTutorial = true;

            //Log.info(`Usuario ${user.username} completó el tutorial del lobby`);

        } catch (err) {
            console.log(err);
            Log.error('Error in CompleteLobbyTutorialController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = CompleteLobbyTutorialController;