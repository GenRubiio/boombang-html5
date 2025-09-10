const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const UserResource = require('../../../resources/UserResource');
const UserService = require('../../../services/UserService');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const Log = require('../../../utils/Log');
const AnimationEnum = require('../../../enums/AnimationEnum');
const UserBlockActionsTask = require('../../../tasks/UserBlockActionsTask');

class UserChangeAvatarController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                throw new Error('User not found or not in any area');
            }

            if (!user.avatars.includes(data.avatar)) {
                throw new Error('Invalid avatar selection');
            }

            if (user.isActionBlocked(AnimationEnum.UPDATE_AVATAR)) {
                return;
            }

            UserService.changeAvatar(user, parseInt(data.avatar));

            UserBlockActionsTask.blockByUpdateAvatar(user);

            if (!user.selectedUser) {
                user.emit(ResponseSocketsEnum.USER_SELECT_USER, {
                    selected_user: new UserResource(user).toObject(),
                    auth_user: new UserResource(user).toObject()
                });
            }

            user.currentArea.emit(ResponseSocketsEnum.USER_CHANGE_AVATAR, {
                user: socket.id,
                avatar: data.avatar,
                position: user.currentAreaPosition
            });
        } catch (err) {
            console.log(err);
            Log.error('Error in UserChangeAvatarController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = UserChangeAvatarController;