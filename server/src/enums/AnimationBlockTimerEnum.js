const Enum = require('./Enum');

// This is the enum for the animation block timer in milliseconds
const AnimationBlockTimerEnum = new Enum({
    UPPERCUT_SEND: 12000,
    UPPERCUT_RECEIVE: 22000,
    CHAT: 200,
});

module.exports = AnimationBlockTimerEnum;