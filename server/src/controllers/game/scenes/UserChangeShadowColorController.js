const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const UserResource = require('../../../resources/UserResource');
const UserService = require('../../../services/UserService');
const Log = require('../../../utils/Log');

class UserChangeShadowColorController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                throw new Error('User not found or not in any area');
            }
            if (!user.shadows.includes(data.shadow)) {
                throw new Error('Invalid shadow color selection');
            }

            UserService.changeShadowColor(user, data.shadow);

            if (!user.selectedUser) {
                user.emit(ResponseSocketsEnum.USER_SELECT_USER, {
                    selected_user: new UserResource(user).toObject(),
                    auth_user: new UserResource(user).toObject()
                });
            }
        } catch (err) {
            console.log(err);
            Log.error('Error in UserChangeShadowColorController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = UserChangeShadowColorController;