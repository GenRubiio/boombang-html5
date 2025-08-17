const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const UserResource = require('../../../resources/UserResource');
const UserService = require('../../../services/UserService');
const Log = require('../../../utils/Log');

class UserChangeColornameController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                throw new Error('User not found or not in any area');
            }
            if (!user.colornames.includes(data.colorname)) {
                throw new Error('Invalid name color selection');
            }

            UserService.changeNameColor(user, data.colorname);

            if (!user.selectedUser) {
                user.emit(ResponseSocketsEnum.USER_SELECT_USER, {
                    selected_user: new UserResource(user).toObject(),
                    auth_user: new UserResource(user).toObject()
                });
            }
        } catch (err) {
            console.log(err);
            Log.error('Error in UserChangeColornameController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = UserChangeColornameController;