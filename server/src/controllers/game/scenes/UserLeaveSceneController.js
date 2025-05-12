const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');
const RemoveUserFromAreaTask = require('../../../tasks/RemoveUserFromAreaTask');
const AnimationEnum = require('../../../enums/AnimationEnum');

class UserLeaveSceneController {
    static async main(socket, io) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                throw new Error('User not found or not in any area');
            }

            if (user.isActionBlocked(AnimationEnum.LEAVE_AREA)) {
                return;
            }

            RemoveUserFromAreaTask.main(user.currentArea, user, io);
        } catch (err) {
            Log.error('Error in UserLeaveAreaController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = UserLeaveSceneController;