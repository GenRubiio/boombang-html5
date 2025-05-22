const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');

class UserChangeUppercutController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                throw new Error('User not found or not in any area');
            }
            user.uppercutSelected = data.uppercut;
        } catch (err) {
            console.log(err);
            Log.error('Error in UserChangeUppercutController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = UserChangeUppercutController;