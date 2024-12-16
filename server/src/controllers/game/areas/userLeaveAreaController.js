const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PublicAreasCollection = require('../../../collections/PublicAreasCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const UpdatePublicAreasController = require('../lobby/UpdatePublicAreasController');
const ConsoleLogger = require('../../../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const ResponseSocketsEnum = require('../../../enums/ResponseSocketsEnum');

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
            publicArea.removeUser(user);
            user.cancelMovement();
            user.setArea(null);
    
            publicArea.emitToAllExcept(ResponseSocketsEnum.USER_LEFT_PUBLIC_AREA, {
                socketId: socket.id
            }, user);
    
            UpdatePublicAreasController.main(io);
        } catch (err) {
            console.log(err);
            logger.log(`Error leaving public area: ${err.message}`, 'error');
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = UserLeaveAreaController;