const connectedUsersCollection = require('../../collections/connectedUsersCollection');
const UpdatePublicAreasController = require('../game/lobby/UpdatePublicAreasController');

class DisconnectUserController {
    static async main(socket, io) {
        const user = connectedUsersCollection.getBySocketId(socket.id);
        if (user) {
            if (user.currentArea) {
                user.currentArea.removeUser(user);
                socket.leave(user.currentArea.id);
                user.currentArea.emitToAllExcept('response:user_left_public_area', {
                    socketId: socket.id
                }, user);
                user.setArea(null);

                UpdatePublicAreasController.main(io);
            }
            connectedUsersCollection.removeUser(socket.id);
            console.log(`User ${user.username} disconnected with socket ID ${socket.id}`);
        }
    }
}

module.exports = DisconnectUserController;