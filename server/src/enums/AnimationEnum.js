const Enum = require('./Enum');

const AnimationEnum = new Enum({
    UPPERCUT: 'UPPERCUT',
    CHAT: 'CHAT',
    WALK: 'WALK',
    LOOK: 'LOOK',
    LEAVE_AREA: 'LEAVE_AREA',
});

module.exports = AnimationEnum;