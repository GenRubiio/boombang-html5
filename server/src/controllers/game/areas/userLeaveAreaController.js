const connectedUsersCollection = require('../../../collections/connectedUsersCollection');
const publicAreasCollection = require('../../../collections/publicAreasCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const UpdatePublicAreasController = require('../lobby/UpdatePublicAreasController');
const ConsoleLogger = require('../../../utils/consoleLogger');
const logger = new ConsoleLogger();

class UserLeaveAreaController {
    static async main(socket, io) {
        try {
            const user = connectedUsersCollection.getBySocketId(socket.id);
            if (!user || !user.currentArea) {
                throw new Error('User not found or not in any area');
            }
            const publicArea = publicAreasCollection.getByUid(user.currentArea.id);
            if (!publicArea) {
                throw new Error('Area not found');
            }
            publicArea.removeUser(user);
            user.cancelMovement();
            user.setArea(null);
    
            publicArea.emitToAllExcept('response:user_left_public_area', {
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