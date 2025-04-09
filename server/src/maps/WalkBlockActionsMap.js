
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
        ]
    }
}

module.exports = WalkBlockActionsMap;