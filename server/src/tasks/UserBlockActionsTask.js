
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const AnimationBlockTimerEnum = require('../enums/AnimationBlockTimerEnum');
const AnimationEnum = require('../enums/AnimationEnum');

class UserBlockActionsTask {
    static blockByUppercutSend(user) {
        try {
            user.blockAction(AnimationEnum.UPPERCUT, AnimationBlockTimerEnum.UPPERCUT_SEND);
            user.blockAction(AnimationEnum.WALK, AnimationBlockTimerEnum.UPPERCUT_SEND);
            user.blockAction(AnimationEnum.LOOK, AnimationBlockTimerEnum.UPPERCUT_SEND);
        }
        catch (err) {
            console.log(err);
            logger.log(`Error blocking by uppercut: ${err.message}`, 'error'); 
        }
    }

    static blockByUppercutReceive(user) {
        try {
            user.blockAction(AnimationEnum.UPPERCUT, AnimationBlockTimerEnum.UPPERCUT_RECEIVE);
            user.blockAction(AnimationEnum.WALK, AnimationBlockTimerEnum.UPPERCUT_RECEIVE);
            user.blockAction(AnimationEnum.LOOK, AnimationBlockTimerEnum.UPPERCUT_RECEIVE);
        }
        catch (err) {
            console.log(err);
            logger.log(`Error blocking by uppercut: ${err.message}`, 'error'); 
        }
    }
}

module.exports = UserBlockActionsTask;