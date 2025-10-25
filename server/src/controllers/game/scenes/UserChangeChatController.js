const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const UserResource = require('../../../resources/UserResource');
const UserService = require('../../../services/UserService');
const Log = require('../../../utils/Log');

class UserChangeChatController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                throw new Error('User not found or not in any area');
            }
            if (!user.chats.includes(data.chat)) {
                throw new Error('Invalid chat selection');
            }

            UserService.changeChat(user, data.chat);

            if (!user.selectedUser) {
                user.emit(ResponseSocketsEnum.USER_SELECT_USER, {
                    selected_user: new UserResource(user).toObject(),
                    auth_user: new UserResource(user).toObject()
                });
            }
        } catch (err) {
            console.log(err);
            Log.error('Error in UserChangeChatController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = UserChangeChatController;