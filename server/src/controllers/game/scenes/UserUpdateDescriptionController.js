const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');
const UserService = require('../../../services/UserService');

class UserUpdateDescriptionController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) return;

            if (data.description && data.description.length <= 30) {
                UserService.updateDescription(user, data.description);
            }
        } catch (err) {
            Log.error('Error in UserUpdateDescriptionController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = UserUpdateDescriptionController;