const Enum = require('./Enum');

const MinigameAlertsEnum = new Enum({
    WIN: 'win',
    TIMEOUT: 'timeout',
    NO_MIN_USERS: 'no_min_users',
});

module.exports = MinigameAlertsEnum;