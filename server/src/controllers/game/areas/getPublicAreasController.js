
const updatePublicAreasController = require('../lobby/updatePublicAreasController');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConsoleLogger = require('../../../utils/consoleLogger');
const logger = new ConsoleLogger();

class GetPublicAreasController {
    static async main(socket, io) {
        try {
            updatePublicAreasController.main(io);
        } catch (err) {
            logger.log(`Error getting public areas: ${err.message}`, 'error');
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = GetPublicAreasController;