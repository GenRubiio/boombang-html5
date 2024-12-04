const Enum = require('./Enum');

const DirectionEnum = new Enum({
    DOWN: 1,
    DOWN_RIGHT: 2,
    RIGHT: 3,
    UP_RIGHT: 4,
    UP: 5,
    UP_LEFT: 6,
    LEFT: 7,
    DOWN_LEFT: 8,
    NONE: 0
});

module.exports = DirectionEnum;