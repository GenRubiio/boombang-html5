
const AnimationEnum = require('../enums/AnimationEnum');
const CoconutsEnum = require('../enums/CoconutsEnum');
const AnimationBlockTimerEnum = require('../enums/AnimationBlockTimerEnum');

class CoconutsBlockActionsMap {
    static get(coconutId) {
        let time = AnimationBlockTimerEnum.COCO_COCO;
        switch (coconutId) {
            case CoconutsEnum.SNOWBALL:
                time = AnimationBlockTimerEnum.COCO_SHOWBALL;
                break;
            case CoconutsEnum.SHOE:
                time = AnimationBlockTimerEnum.COCO_SHOE;
                break;
            case CoconutsEnum.PIE:
                time = AnimationBlockTimerEnum.COCO_PIE;
                break;
            case CoconutsEnum.MACETA:
                time = AnimationBlockTimerEnum.COCO_MACETA;
                break;
            case CoconutsEnum.AVISPAS:
                time = AnimationBlockTimerEnum.COCO_AVISPAS;
                break;
            case CoconutsEnum.GARBAGE:
                time = AnimationBlockTimerEnum.COCO_GARBAGE;
                break;
            case CoconutsEnum.SANDIA:
                time = AnimationBlockTimerEnum.COCO_SANDIA;
                break;
            case CoconutsEnum.YUNQUE:
                time = AnimationBlockTimerEnum.COCO_YUNQUE;
                break;
            case CoconutsEnum.PIANO:
                time = AnimationBlockTimerEnum.COCO_PIANO;
                break;
            default:
                time = AnimationBlockTimerEnum.COCO_COCO;
                break;
        }
        return {
            actions: [
                AnimationEnum.COCONUT,
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
                AnimationEnum.AVATAR_DOWN_TALK,
                AnimationEnum.AVATAR_UP_TALK,
                AnimationEnum.AVATAR_LEFT_TALK,
                AnimationEnum.AVATAR_RIGHT_TALK,
                AnimationEnum.AVATAR_LEFTDOWN_TALK,
                AnimationEnum.AVATAR_RIGHTDOWN_TALK,
                AnimationEnum.AVATAR_LEFTUP_TALK,
                AnimationEnum.AVATAR_RIGHTUP_TALK
            ],
            time: time
        };
    }
}

module.exports = CoconutsBlockActionsMap;