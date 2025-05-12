
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const AnimationBlockTimerEnum = require('../enums/AnimationBlockTimerEnum');
const AnimationEnum = require('../enums/AnimationEnum');
const EmojisBlockActionsMap = require('../maps/EmojisBlockActionsMap');
const WalkBlockActionsMap = require('../maps/WalkBlockActionsMap');
const UppercutSendBlockActionsMap = require('../maps/UppercutSendBlockActionsMap');
const UppercutReceivedActionsMap = require('../maps/UppercutReceivedActionsMap');

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
        try {
            for (const action of WalkBlockActionsMap.get()) {
                user.blockAction(action, AnimationBlockTimerEnum.WALK);
            }
        }
        catch (err) {
            console.log(err);
            logger.log(`Error blocking by uppercut: ${err.message}`, 'error');
        }
    }

    static blockByUppercutSend(user) {
        try {
            for (const action of UppercutSendBlockActionsMap.get()) {
                user.blockAction(action, AnimationBlockTimerEnum.UPPERCUT_SEND);
            }
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
                    const RemoveUserFromSceneTask = require('./RemoveUserFromSceneTask');
                    RemoveUserFromSceneTask.main(user.currentArea, user, io);
                }
            });
            for (const action of UppercutReceivedActionsMap.get()) {
                user.blockAction(action, AnimationBlockTimerEnum.UPPERCUT_RECEIVE);
            }
        }
        catch (err) {
            console.log(err);
            logger.log(`Error blocking by uppercut: ${err.message}`, 'error');
        }
    }
}

module.exports = UserBlockActionsTask;