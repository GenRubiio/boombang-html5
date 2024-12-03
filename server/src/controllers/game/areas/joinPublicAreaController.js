
const updatePublicAreasController = require('../lobby/updatePublicAreasController');
const connectedUsersCollection = require('../../../collections/connectedUsersCollection');
const publicAreasCollection = require('../../../collections/publicAreasCollection');
const disconnectUserController = require('../../../controllers/connection/disconnectUserController');
const ConsoleLogger = require('../../../utils/consoleLogger');
const logger = new ConsoleLogger();

const main = async (socket, io, data) => {
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

        updatePublicAreasController.main(io);
    } catch (err) {
        console.log(err);
        logger.log(`Error joining public area: ${err.message}`, 'error');
        disconnectUserController.main(socket, io);
        socket.emit('error_critical');
    }
};



module.exports = { main };