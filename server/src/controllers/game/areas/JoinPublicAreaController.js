
const UpdatePublicAreasController = require('../lobby/UpdatePublicAreasController');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PublicScenesCollection = require('../../../collections/PublicScenesCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const UserAreaResource = require('../../../resources/UserAreaResource');
const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');

class JoinPublicAreaController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                //throw new Error("User not found");
                return;
            }
            const publicArea = PublicScenesCollection.getByUid(data.areaId);
            if (!publicArea) {
                throw new Error("Public area not found");
            }
            if (publicArea.containsUser(user)) {
                //throw new Error("User already in area");
                return;
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
            Log.error('Error in JoinPublicAreaController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = JoinPublicAreaController;