
const Log = require('../../../utils/Log');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PublicScenesCollection = require('../../../collections/PublicScenesCollection');
const UserSceneResource = require('../../../resources/UserSceneResource');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');

class GetPublicSceneDataController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (!user.currentArea) return;
            const scene = PublicScenesCollection.getByUid(user.currentArea.id);
            if (!scene) {
                throw new Error('Public scene not found');
            }

            let users = [];
            for (const user of scene.users) {
                users.push(await new UserSceneResource(user).toObject());
            }
            socket.emit(ResponseSocketsEnum.GET_PUBLIC_SCENE_DATA, {
                players: users,
                scenery: {
                    id: scene.id,
                    type: "public_scenery",
                    map_rows: scene.map_width,
                    map_cols: scene.map_height,
                    game_map: scene.game_map,
                }
            });
        } catch (err) {
            Log.error('Error in GetPublicSceneDataController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = GetPublicSceneDataController;