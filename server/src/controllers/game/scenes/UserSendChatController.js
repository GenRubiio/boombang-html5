const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const AnimationEnum = require('../../../enums/AnimationEnum');
const DirectionEnum = require('../../../enums/DirectionEnum');
const UserBlockActionsTask = require('../../../tasks/UserBlockActionsTask');
const UserForcedJoinSceneController = require('./UserForcedJoinSceneController');

class UserSendChatController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) return;//throw new Error('User not found or not in any area');

            if (this.#validateIfCommand(user, data)) {
                return;
            }

            if (!user.isActionBlocked(AnimationEnum.CHAT)) {
                UserBlockActionsTask.blockByChat(user);
                const animation = this.getTalkAnimation(user.currentAreaPosition.z);
                if (data.message.length > 60) {
                    data.message = data.message.slice(0, 60);
                }
                if (data.recipient) {
                    const recipient = ConnectedUsersCollection.getBySocketId(data.recipient);
                    if (
                        !recipient
                        || !recipient.currentArea
                        || recipient.currentArea.id !== user.currentArea.id
                    ) {
                        return;
                    }
                    socket.emit(ResponseSocketsEnum.USER_SEND_CHAT, {
                        'user_socket': user.socket.id,
                        'message': data.message,
                        'username': user.username,
                        'avatarId': user.avatarId,
                        'chat_color': 'private',
                        'animation': !user.isActionBlocked(animation) ? animation : null,
                    });
                    recipient.socket.emit(ResponseSocketsEnum.USER_SEND_CHAT, {
                        'user_socket': user.socket.id,
                        'message': data.message,
                        'username': user.username,
                        'avatarId': user.avatarId,
                        'chat_color': 'private',
                        'animation': !user.isActionBlocked(animation) ? animation : null,
                    });
                } else {
                    user.currentArea.emit(ResponseSocketsEnum.USER_SEND_CHAT, {
                        'user_socket': user.socket.id,
                        'message': data.message,
                        'username': user.username,
                        'avatarId': user.avatarId,
                        'chat_color': user.chat_color,
                        'animation': !user.isActionBlocked(animation) ? animation : null,
                    });
                }
            }

        } catch (err) {
            Log.error('Error in SendEmojiController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }

    static #validateIfCommand(user, data) {
        if (data.message.startsWith('/')) {
            const command = data.message.split(' ')[0].substring(1);
            switch (command) {
                case 'show_isomap':
                    user.adminTools.show_isomap = !user.adminTools.show_isomap;
                    return true;
                case 'show_object_reserved_tiles':
                    user.adminTools.show_object_reserved_tiles = !user.adminTools.show_object_reserved_tiles;
                    return true;
                case 'coco':
                    const effect = data.message.split(' ')[1];
                    user.currentArea.emit('response:user_receive_effect',
                        {
                            'user_socket': user.socket.id,
                            'effect': effect,
                        }
                    );
                    return true;
                case 'join':
                    const sceneType = data.message.split(' ')[1];
                    UserForcedJoinSceneController.main(user, sceneType);
                    return true;
            }
            return true;
        }
        return false;
    }

    static getTalkAnimation(direction) {
        switch (direction) {
            case DirectionEnum.DOWN:
                return AnimationEnum.AVATAR_DOWN_TALK;
            case DirectionEnum.DOWN_RIGHT:
                return AnimationEnum.AVATAR_RIGHTDOWN_TALK;
            case DirectionEnum.RIGHT:
                return AnimationEnum.AVATAR_RIGHT_TALK;
            case DirectionEnum.UP_RIGHT:
                return AnimationEnum.AVATAR_RIGHTUP_TALK;
            case DirectionEnum.UP:
                return AnimationEnum.AVATAR_UP_TALK;
            case DirectionEnum.UP_LEFT:
                return AnimationEnum.AVATAR_LEFTUP_TALK;
            case DirectionEnum.LEFT:
                return AnimationEnum.AVATAR_LEFT_TALK;
            case DirectionEnum.DOWN_LEFT:
                return AnimationEnum.AVATAR_LEFTDOWN_TALK;
            default:
                throw new Error('Invalid direction');
        }
    }
}

module.exports = UserSendChatController;