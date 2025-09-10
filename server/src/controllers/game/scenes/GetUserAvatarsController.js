const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const SceneService = require('../../../services/SceneService');

class GetUserAvatarsController {
    static async main(socket, io, data) {
        try {
            let user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                return;
            }

            const responseData = await SceneService.userAvatars(user);

            socket.emit(ResponseSocketsEnum.GET_USER_AVATARS, {
                avatars: responseData.avatars || []
            });
        } catch (err) {
            console.error('Error in GetUserAvatarsController:', err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = GetUserAvatarsController;
