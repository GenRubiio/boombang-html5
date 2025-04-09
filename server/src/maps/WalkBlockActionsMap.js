
const AnimationEnum = require('../enums/AnimationEnum');

class WalkBlockActionsMap {
    static get() {
        return [
            AnimationEnum.AVATAR_LAUGHTER_1,
            AnimationEnum.AVATAR_LAUGHTER_2,
            AnimationEnum.AVATAR_CRY,
            AnimationEnum.AVATAR_LOVE,
            AnimationEnum.AVATAR_SPIT,
            AnimationEnum.AVATAR_FART,
            AnimationEnum.AVATAR_PROVOKE,
            AnimationEnum.AVATAR_FLY,
            AnimationEnum.AVATAR_DOWN_TALK,
            AnimationEnum.AVATAR_UP_TALK,
            AnimationEnum.AVATAR_LEFT_TALK,
            AnimationEnum.AVATAR_RIGHT_TALK,
            AnimationEnum.AVATAR_LEFTDOWN_TALK,
            AnimationEnum.AVATAR_RIGHTDOWN_TALK,
            AnimationEnum.AVATAR_LEFTUP_TALK,
            AnimationEnum.AVATAR_RIGHTUP_TALK
        ]
    }
}

module.exports = WalkBlockActionsMap;