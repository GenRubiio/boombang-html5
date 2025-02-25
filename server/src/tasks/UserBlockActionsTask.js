
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const AnimationBlockTimerEnum = require('../enums/AnimationBlockTimerEnum');
const AnimationEnum = require('../enums/AnimationEnum');
const RemoveUserFromAreaTask = require('./RemoveUserFromAreaTask');
const EmojisBlockActionsMap = require('../maps/EmojisBlockActionsMap');

class UserBlockActionsTask {
    static blockByEmojiSend(user, emojiId) {
        try {
            const actionData = EmojisBlockActionsMap.get(emojiId);
            if (!actionData) {
                throw new Error('Invalid emoji id');
            }
            const blockTime = actionData.time[user.avatarId];
            actionData.actions.forEach(action => {
                user.blockAction(action, blockTime);
            });
        }
        catch (err) {
            console.log(err);
            logger.log(`Error blocking by emoji: ${err.message}`, 'error');
        }
    }

    static blockByWalk(user) {
        user.blockAction(AnimationEnum.AVATAR_LAUGHTER_1, AnimationBlockTimerEnum.WALK);
        user.blockAction(AnimationEnum.AVATAR_LAUGHTER_2, AnimationBlockTimerEnum.WALK);
        user.blockAction(AnimationEnum.AVATAR_CRY, AnimationBlockTimerEnum.WALK);
        user.blockAction(AnimationEnum.AVATAR_LOVE, AnimationBlockTimerEnum.WALK);
        user.blockAction(AnimationEnum.AVATAR_SPIT, AnimationBlockTimerEnum.WALK);
        user.blockAction(AnimationEnum.AVATAR_FART, AnimationBlockTimerEnum.WALK);
        user.blockAction(AnimationEnum.AVATAR_PROVOKE, AnimationBlockTimerEnum.WALK);
        user.blockAction(AnimationEnum.AVATAR_FLY, AnimationBlockTimerEnum.WALK);
    }

    static blockByUppercutSend(user) {
        try {
            user.blockAction(AnimationEnum.UPPERCUT, AnimationBlockTimerEnum.UPPERCUT_SEND);
            user.blockAction(AnimationEnum.WALK, AnimationBlockTimerEnum.UPPERCUT_SEND);
            user.blockAction(AnimationEnum.LOOK, AnimationBlockTimerEnum.UPPERCUT_SEND);
            user.blockAction(AnimationEnum.LEAVE_AREA, AnimationBlockTimerEnum.UPPERCUT_SEND);
            user.blockAction(AnimationEnum.AVATAR_LAUGHTER_1, AnimationBlockTimerEnum.UPPERCUT_SEND);
            user.blockAction(AnimationEnum.AVATAR_LAUGHTER_2, AnimationBlockTimerEnum.UPPERCUT_SEND);
            user.blockAction(AnimationEnum.AVATAR_CRY, AnimationBlockTimerEnum.UPPERCUT_SEND);
            user.blockAction(AnimationEnum.AVATAR_LOVE, AnimationBlockTimerEnum.UPPERCUT_SEND);
            user.blockAction(AnimationEnum.AVATAR_SPIT, AnimationBlockTimerEnum.UPPERCUT_SEND);
            user.blockAction(AnimationEnum.AVATAR_FART, AnimationBlockTimerEnum.UPPERCUT_SEND);
            user.blockAction(AnimationEnum.AVATAR_PROVOKE, AnimationBlockTimerEnum.UPPERCUT_SEND);
            user.blockAction(AnimationEnum.AVATAR_FLY, AnimationBlockTimerEnum.UPPERCUT_SEND);
        }
        catch (err) {
            console.log(err);
            logger.log(`Error blocking by uppercut: ${err.message}`, 'error');
        }
    }

    static blockByUppercutReceive(user, io) {
        try {
            user.blockAction(AnimationEnum.UPPERCUT, AnimationBlockTimerEnum.UPPERCUT_RECEIVE, () => {
                // Callback al terminar el tiempo de recibir el uppercut
                // Aquí expulsas al usuario
                if (user.currentArea) {
                    RemoveUserFromAreaTask.main(user.currentArea, user, io);
                }
            });
            user.blockAction(AnimationEnum.WALK, AnimationBlockTimerEnum.UPPERCUT_RECEIVE);
            user.blockAction(AnimationEnum.LOOK, AnimationBlockTimerEnum.UPPERCUT_RECEIVE);
            user.blockAction(AnimationEnum.LEAVE_AREA, AnimationBlockTimerEnum.UPPERCUT_RECEIVE);
            user.blockAction(AnimationEnum.AVATAR_LAUGHTER_1, AnimationBlockTimerEnum.UPPERCUT_RECEIVE);
            user.blockAction(AnimationEnum.AVATAR_LAUGHTER_2, AnimationBlockTimerEnum.UPPERCUT_RECEIVE);
            user.blockAction(AnimationEnum.AVATAR_CRY, AnimationBlockTimerEnum.UPPERCUT_RECEIVE);
            user.blockAction(AnimationEnum.AVATAR_LOVE, AnimationBlockTimerEnum.UPPERCUT_RECEIVE);
            user.blockAction(AnimationEnum.AVATAR_SPIT, AnimationBlockTimerEnum.UPPERCUT_RECEIVE);
            user.blockAction(AnimationEnum.AVATAR_FART, AnimationBlockTimerEnum.UPPERCUT_RECEIVE);
            user.blockAction(AnimationEnum.AVATAR_PROVOKE, AnimationBlockTimerEnum.UPPERCUT_RECEIVE);
            user.blockAction(AnimationEnum.AVATAR_FLY, AnimationBlockTimerEnum.UPPERCUT_RECEIVE);
        }
        catch (err) {
            console.log(err);
            logger.log(`Error blocking by uppercut: ${err.message}`, 'error');
        }
    }
}

module.exports = UserBlockActionsTask;