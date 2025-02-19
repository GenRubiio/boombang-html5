
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PublicAreasCollection = require('../../../collections/PublicAreasCollection');
const UserAreaResource = require('../../../resources/UserAreaResource');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');

class GetPublicAreaUsersController {
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
            socket.emit(ResponseSocketsEnum.GET_PUBLIC_AREA_USERS, {
                players: players
            });
        } catch (err) {
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = GetPublicAreaUsersController;