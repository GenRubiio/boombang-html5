
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const AnimationBlockTimerEnum = require('../enums/AnimationBlockTimerEnum');
const AnimationEnum = require('../enums/AnimationEnum');

class UserBlockActionsTask {
    static blockByUppercut(user) {
        try {
            user.blockAction(AnimationEnum.UPPERCUT, AnimationBlockTimerEnum.UPPERCUT);
            user.blockAction(AnimationEnum.WALK, AnimationBlockTimerEnum.UPPERCUT);
            user.blockAction(AnimationEnum.LOOK, AnimationBlockTimerEnum.UPPERCUT);
        }
        catch (err) {
            console.log(err);
            logger.log(`Error blocking by uppercut: ${err.message}`, 'error'); 
        }
    }
}

module.exports = UserBlockActionsTask;