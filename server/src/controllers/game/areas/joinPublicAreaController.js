
const updatePublicAreasController = require('../lobby/updatePublicAreasController');
const connectedUsersCollection = require('../../../collections/connectedUsersCollection');
const publicAreasCollection = require('../../../collections/publicAreasCollection');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConsoleLogger = require('../../../utils/consoleLogger');
const logger = new ConsoleLogger();

class JoinPublicAreaController {
    static async main(socket, io, data) {
        try {
            const user = connectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error("User not found");
            }
            const publicArea = publicAreasCollection.getByUid(data.areaId);
            if (!publicArea) {
                throw new Error("Public area not found");
            }
            if (publicArea.containsUser(user)) {
                throw new Error("User already in area");
            }

            publicArea.addUser(user);
            user.setArea(publicArea);
            socket.join(publicArea.id);
            socket.emit('response:join_public_area', {
                success: true,
            });
            publicArea.emitToAllExcept('response:new_user_join_public_area', {
                user: {
                    id: user.socket.id,
                    x: user.currentAreaPosition.x,
                    y: user.currentAreaPosition.y,
                },
            }, user);

            updatePublicAreasController.main(io);
        } catch (err) {
            console.log(err);
            logger.log(`Error joining public area: ${err.message}`, 'error');
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = JoinPublicAreaController;