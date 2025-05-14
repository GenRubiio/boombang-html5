
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PublicScenesCollection = require('../../../collections/PublicScenesCollection');
const UserSceneResource = require('../../../resources/UserSceneResource');
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

            const scene = user.currentArea;
            let players = [];
            for (const user of scene.users) {
                players.push(await new UserSceneResource(user).toObject());
            }
            socket.emit(ResponseSocketsEnum.GET_PUBLIC_SCENE_USERS, {
                players: players
            });
        } catch (err) {
            console.log(err);
            Log.error('Error in GetPublicAreaUsersController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = GetPublicSceneUsersController;