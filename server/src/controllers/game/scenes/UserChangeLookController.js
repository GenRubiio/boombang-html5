const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const AnimationEnum = require('../../../enums/AnimationEnum');
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');
const UserMovimentUtil = require('../../../utils/UserMovimentUtil');
const Log = require('../../../utils/Log');

class UserChangeLookController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                throw new Error('User not found or not in any area');
            }

            if (user.isActionBlocked(AnimationEnum.LOOK) || user.inMoviment()) {
                return;
            }

            const { x: x1, y: y1 } = user.currentAreaPosition;
            // Calcula la dirección usando el ángulo
            const direction = UserMovimentUtil.getLongDirection(x1, y1, data.x, data.y);

            user.currentAreaPosition.z = direction;
            user.currentArea.emit(ResponseSocketsEnum.USER_UPDATE_POSITION, {
                socket_id: user.socket.id,
                position: user.currentAreaPosition
            });
        } catch (err) {
            console.log(err);
            Log.error('Error in UserChangeLookController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = UserChangeLookController;