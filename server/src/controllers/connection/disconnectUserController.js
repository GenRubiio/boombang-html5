const ConnectedUsersCollection = require('../../collections/ConnectedUsersCollection');
const RemoveUserFromAreaTask = require('../../tasks/RemoveUserFromAreaTask');

class DisconnectUserController {
    static async main(socket, io) {
        const user = ConnectedUsersCollection.getBySocketId(socket.id);
        if (user) {
            if (user.currentArea) {
                RemoveUserFromAreaTask.main(user.currentArea, user, io);
            }
            ConnectedUsersCollection.removeUser(socket.id);
            //console.log(`User ${user.username} disconnected with socket ID ${socket.id}`);
        }
    }
}

module.exports = DisconnectUserController;