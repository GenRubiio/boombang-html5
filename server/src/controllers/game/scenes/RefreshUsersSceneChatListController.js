
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const Log = require('../../../utils/Log');

class RefreshUsersSceneChatListController {
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
                players.push({
                    uuid: user.socket.id,
                    username: user.username
                });
            }
            socket.emit(ResponseSocketsEnum.REFRESH_USERS_SCENE_CHAT_LIST, {
                players: players
            });
        } catch (err) {
            console.log(err);
            Log.error('Error in RefreshUsersSceneChatListController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = RefreshUsersSceneChatListController;