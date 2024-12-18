const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PublicAreasCollection = require('../../../collections/PublicAreasCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConsoleLogger = require('../../../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const RemoveUserFromAreaTask = require('../../../tasks/RemoveUserFromAreaTask');
const AnimationEnum = require('../../../enums/AnimationEnum');

class UserLeaveAreaController {
    static async main(socket, io) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                throw new Error('User not found or not in any area');
            }
            const publicArea = PublicAreasCollection.getByUid(user.currentArea.id);
            if (!publicArea) {
                throw new Error('Area not found');
            }

            if (user.isActionBlocked(AnimationEnum.LEAVE_AREA)) {
                return;
            }

            RemoveUserFromAreaTask.main(publicArea, user, io);
        } catch (err) {
            console.log(err);
            logger.log(`Error leaving public area: ${err.message}`, 'error');
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = UserLeaveAreaController;