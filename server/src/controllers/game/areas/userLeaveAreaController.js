const connectedUsersCollection = require('../../../collections/connectedUsersCollection');
const publicAreasCollection = require('../../../collections/publicAreasCollection');
const disconnectUserController = require('../../../controllers/connection/disconnectUserController');
const updatePublicAreasController = require('../lobby/updatePublicAreasController');
const ConsoleLogger = require('../../../utils/consoleLogger');
const logger = new ConsoleLogger();

const main = async (socket, io) => {
    try {
        const user = connectedUsersCollection.getBySocketId(socket.id);
        if (!user || !user.currentArea) {
            throw new Error('User not found or not in any area');
        }
        const area = publicAreasCollection.getByUid(user.currentArea.id);
        if (!area) {
            throw new Error('Area not found');
        }
        area.removeUser(user);
        user.cancelMovement();
        user.setArea(null);

        updatePublicAreasController.main(io);
    } catch (err) {
        console.log(err);
        logger.log(`Error leaving public area: ${err.message}`, 'error');
        disconnectUserController.main(socket, io);
        socket.emit('error_critical');
    }
};



module.exports = { main };