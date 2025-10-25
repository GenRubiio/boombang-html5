const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const SceneService = require('../../../services/SceneService');

class GetUserDecorationsController {
    static async main(socket, io, data) {
        try {
            let user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                return;
            }

            const responseData = await SceneService.userDecorations(user);
            socket.emit(ResponseSocketsEnum.GET_USER_DECORATIONS, responseData.decorations);
        } catch (err) {

            //Log.error('Error in GetUserDecorationsController:', err);
            console.error('Error in GetUserDecorationsController:', err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = GetUserDecorationsController;
