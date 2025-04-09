const Enum = require('./Enum');

const AnimationEnum = new Enum({
    UPPERCUT: 'UPPERCUT',
    CHAT: 'CHAT',
    WALK: 'WALK',
    LOOK: 'LOOK',
    LEAVE_AREA: 'LEAVE_AREA',
    AVATAR_LAUGHTER_1: 'AVATAR_LAUGHTER_1',
    AVATAR_LAUGHTER_2: 'AVATAR_LAUGHTER_2',
    AVATAR_CRY: 'AVATAR_CRY',
    AVATAR_LOVE: 'AVATAR_LOVE',
    AVATAR_SPIT: 'AVATAR_SPIT',
    AVATAR_FART: 'AVATAR_FART',
    AVATAR_PROVOKE: 'AVATAR_PROVOKE',
    AVATAR_FLY: 'AVATAR_FLY',
    AVATAR_DOWN_TALK: 'down_talk',
    AVATAR_UP_TALK: 'up_talk',
    AVATAR_LEFT_TALK: 'left_talk',
    AVATAR_RIGHT_TALK: 'right_talk',
    AVATAR_LEFTDOWN_TALK: 'leftdown_talk',
    AVATAR_RIGHTDOWN_TALK: 'rightdown_talk',
    AVATAR_LEFTUP_TALK: 'leftup_talk',
    AVATAR_RIGHTUP_TALK: 'rightup_talk',
});

module.exports = AnimationEnum;