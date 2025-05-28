const ConnectedUsersCollection = require('../../collections/ConnectedUsersCollection');
const RemoveUserFromSceneTask = require('../../tasks/RemoveUserFromSceneTask');

class DisconnectUserController {
    static async main(socket, io) {
        const user = ConnectedUsersCollection.getBySocketId(socket.id);
        if (user) {
            if (user.currentArea) {
                RemoveUserFromSceneTask.main(user.currentArea, user);
            }
            ConnectedUsersCollection.removeUser(socket.id);
            //console.log(`User ${user.username} disconnected with socket ID ${socket.id}`);
        }
    }
}

module.exports = DisconnectUserController;