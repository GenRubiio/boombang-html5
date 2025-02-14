
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PublicAreasCollection = require('../../../collections/PublicAreasCollection');
const UserAreaResource = require('../../../resources/UserAreaResource');
const ConsoleLogger = require('../../../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const AvatarAnimationsCollection = require('../../../collections/AvatarAnimationsCollection');

class GetPublicAreaDataController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            const publicArea = PublicAreasCollection.getByUid(user.currentArea.id);
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
            logger.log(`Error joining public area: ${err.message}`, 'error');
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = GetPublicAreaDataController;