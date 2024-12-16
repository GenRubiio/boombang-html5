
const UpdatePublicAreasController = require('../lobby/UpdatePublicAreasController');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PublicAreasCollection = require('../../../collections/PublicAreasCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const UserAreaResource = require('../../../resources/UserAreaResource');
const ConsoleLogger = require('../../../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');

class JoinPublicAreaController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error("User not found");
            }
            const publicArea = PublicAreasCollection.getByUid(data.areaId);
            if (!publicArea) {
                throw new Error("Public area not found");
            }
            if (publicArea.containsUser(user)) {
                throw new Error("User already in area");
            }

            user.setArea(publicArea);
            publicArea.addUser(user);
            socket.emit(ResponseSocketsEnum.JOIN_PUBLIC_AREA, {
                success: true,
            });
            publicArea.emitToAllExcept(ResponseSocketsEnum.NEW_USER_JOIN_PUBLIC_AREA, {
                user: await new UserAreaResource(user).toObject(),
            }, user);

            UpdatePublicAreasController.main(io);
        } catch (err) {
            console.log(err);
            logger.log(`Error joining public area: ${err.message}`, 'error');
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = JoinPublicAreaController;