
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PublicScenesCollection = require('../../../collections/PublicScenesCollection');
const UserAreaResource = require('../../../resources/UserAreaResource');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const Log = require('../../../utils/Log');

class GetPublicSceneUsersController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (!user.currentArea) return;
            const publicArea = PublicScenesCollection.getByUid(user.currentArea.id);
            if (!publicArea) {
                throw new Error('Public area not found');
            }

            let players = [];
            for (const user of publicArea.users) {
                players.push(await new UserAreaResource(user).toObject());
            }
            socket.emit(ResponseSocketsEnum.GET_PUBLIC_SCENE_USERS, {
                players: players
            });
        } catch (err) {
            Log.error('Error in GetPublicAreaUsersController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = GetPublicSceneUsersController;