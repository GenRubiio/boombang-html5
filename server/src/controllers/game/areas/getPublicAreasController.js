
const updatePublicAreasController = require('../lobby/updatePublicAreasController');
const disconnectUserController = require('../../../controllers/connection/disconnectUserController');
const ConsoleLogger = require('../../../utils/consoleLogger');
const logger = new ConsoleLogger();

const main = async (socket, io) => {
    try {
        updatePublicAreasController.main(io);
    } catch (err) {
        logger.log(`Error getting public areas: ${err.message}`, 'error');
        disconnectUserController.main(socket, io);
        socket.emit('error_critical');
    }
};

module.exports = { main };