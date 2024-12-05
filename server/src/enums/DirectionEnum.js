const Enum = require('./Enum');

const DirectionEnum = new Enum({
    DOWN: 2,
    DOWN_RIGHT: 3,
    RIGHT: 4,
    UP_RIGHT: 5,
    UP: 6,
    UP_LEFT: 7,
    LEFT: 8,
    DOWN_LEFT: 1,
    NONE: 0
});

module.exports = DirectionEnum;