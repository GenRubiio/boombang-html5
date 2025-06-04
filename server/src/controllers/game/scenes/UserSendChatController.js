const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const AnimationEnum = require('../../../enums/AnimationEnum');
const DirectionEnum = require('../../../enums/DirectionEnum');

class UserSendChatController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) return;//throw new Error('User not found or not in any area');

            if (this.#validateIfCommand(user, data)) {
                return;
            }

            if (!user.isActionBlocked(AnimationEnum.CHAT)) {
                const animation = this.getTalkAnimation(user.currentAreaPosition.z);
                user.currentArea.emit(ResponseSocketsEnum.USER_SEND_CHAT, {
                    'user_socket': user.socket.id,
                    'message': data.message,
                    'animation': !user.isActionBlocked(animation) ? animation : null,
                });
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
                case 'coco':
                    user.currentArea.emit('response:user_receive_effect',
                        {
                            'user_socket': user.socket.id,
                            'effect': 'coco_garbage',
                        }
                    );
                    return true;
                case 'say':
                    // Handle say command
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