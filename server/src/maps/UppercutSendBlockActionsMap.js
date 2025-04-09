
const AnimationEnum = require('../enums/AnimationEnum');

class UppercutSendBlockActionsMap {
    static get() {
        return [
            AnimationEnum.UPPERCUT,
            AnimationEnum.WALK,
            AnimationEnum.LOOK,
            AnimationEnum.LEAVE_AREA,
            AnimationEnum.AVATAR_LAUGHTER_1,
            AnimationEnum.AVATAR_LAUGHTER_2,
            AnimationEnum.AVATAR_CRY,
            AnimationEnum.AVATAR_LOVE,
            AnimationEnum.AVATAR_SPIT,
            AnimationEnum.AVATAR_FART,
            AnimationEnum.AVATAR_PROVOKE,
            AnimationEnum.AVATAR_FLY,
        ]
    }
}

module.exports = UppercutSendBlockActionsMap;