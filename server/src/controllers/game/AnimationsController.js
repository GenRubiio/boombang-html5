const AvatarEnum = require('../../enums/AvatarEnum');
const WolfAnimation = require('../../animations/WolfAnimation');
const ConsoleLogger = require('../../utils/ConsoleLogger');
const logger = new ConsoleLogger();

class AnimationsController {
    static async main(user) {
        switch (user.avatarId) {
            case AvatarEnum.WOLF:
                return await WolfAnimation.main(user);
            default:
                logger.log(`No animations found for avatar ${user.avatarId}`, 'error');
                return null;
        }
    }
}

module.exports = AnimationsController;