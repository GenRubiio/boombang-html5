const ConnectedUsersCollection = require('../../collections/ConnectedUsersCollection');
const UpdatePublicAreasController = require('../game/lobby/UpdatePublicAreasController');
const ResponseSocketsEnum = require('../../enums/ResponseSocketsEnum');

class DisconnectUserController {
    static async main(socket, io) {
        const user = ConnectedUsersCollection.getBySocketId(socket.id);
        if (user) {
            if (user.currentArea) {
                user.currentArea.removeUser(user);
                socket.leave(user.currentArea.id);
                user.currentArea.emitToAllExcept(ResponseSocketsEnum.USER_LEFT_PUBLIC_AREA, {
                    socketId: socket.id
                }, user);
                user.setArea(null);

                UpdatePublicAreasController.main(io);
            }
            ConnectedUsersCollection.removeUser(socket.id);
            console.log(`User ${user.username} disconnected with socket ID ${socket.id}`);
        }
    }
}

module.exports = DisconnectUserController;