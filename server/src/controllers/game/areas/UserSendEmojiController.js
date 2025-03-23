const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const UserBlockActionsTask = require('../../../tasks/UserBlockActionsTask');
const AnimationEnum = require('../../../enums/AnimationEnum');
const AvatarEmojisEnum = require('../../../enums/AvatarEmojisEnum');

class UserSendEmojiController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) return;//throw new Error('User not found or not in any area');

            if (!user.isActionBlocked(this.getActionByEmojiId(data.emoji_id))) {
                user.cancelMovement();

                UserBlockActionsTask.blockByEmojiSend(user, data.emoji_id);

                user.currentArea.emit(ResponseSocketsEnum.SEND_EMOJI, {
                    'user_socket': socket.id,
                    'emoji_id': data.emoji_id,
                    'avatar_id': user.avatarId
                });
            }

        } catch (err) {
            Log.error('Error in SendEmojiController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }

    static getActionByEmojiId(emojiId) {
        switch (emojiId) {
            case AvatarEmojisEnum.LAUGHTER_1:
                return AnimationEnum.AVATAR_LAUGHTER_1;
            case AvatarEmojisEnum.LAUGHTER_2:
                return AnimationEnum.AVATAR_LAUGHTER_2;
            case AvatarEmojisEnum.CRY:
                return AnimationEnum.AVATAR_CRY;
            case AvatarEmojisEnum.LOVE:
                return AnimationEnum.AVATAR_LOVE;
            case AvatarEmojisEnum.SPIT:
                return AnimationEnum.AVATAR_SPIT;
            case AvatarEmojisEnum.FART:
                return AnimationEnum.AVATAR_FART;
            case AvatarEmojisEnum.PROVOKE:
                return AnimationEnum.AVATAR_PROVOKE;
            case AvatarEmojisEnum.FLY:
                return AnimationEnum.AVATAR_FLY;
            default:
                throw new Error('Invalid emoji id');
        }
    }
}

module.exports = UserSendEmojiController;