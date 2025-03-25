
const Log = require('../../../utils/Log');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PublicScenesCollection = require('../../../collections/PublicScenesCollection');
const UserAreaResource = require('../../../resources/UserAreaResource');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const AvatarAnimationsCollection = require('../../../collections/AvatarAnimationsCollection');

class GetPublicSceneDataController {
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
            const avatarAnimations = Object.fromEntries(AvatarAnimationsCollection.getAllData());
            socket.emit(ResponseSocketsEnum.GET_PUBLIC_AREA_DATA, {
                players: players,
                scenery: {
                    id: publicArea.id,
                    type: "public_scenery",
                    map_rows: publicArea.map_width,
                    map_cols: publicArea.map_height,
                    game_map: publicArea.game_map,
                },
                avatar_animations: avatarAnimations
            });
        } catch (err) {
            Log.error('Error in GetPublicAreaDataController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = GetPublicSceneDataController;