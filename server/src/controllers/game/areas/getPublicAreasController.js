
const updatePublicAreasController = require('../lobby/updatePublicAreasController');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConsoleLogger = require('../../../utils/consoleLogger');
const logger = new ConsoleLogger();

const main = async (socket, io) => {
    try {
        updatePublicAreasController.main(io);
    } catch (err) {
        logger.log(`Error getting public areas: ${err.message}`, 'error');
        DisconnectUserController.main(socket, io);
        socket.emit('error_critical');
    }
};

module.exports = { main };