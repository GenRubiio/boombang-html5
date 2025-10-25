const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');

class UserChangeCoconutController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                throw new Error('User not found or not in any area');
            }
            if (data.coconut > user.coconutLevel || data.coconut < 0) {
                throw new Error('Invalid coconut selection');
            }
            user.coconutSelected = data.coconut;
        } catch (err) {
            console.log(err);
            Log.error('Error in UserChangeCoconutController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = UserChangeCoconutController;