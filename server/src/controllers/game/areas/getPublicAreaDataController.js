
const DisconnectUserController = require('../../connection/DisconnectUserController');
const ConnectedUsersCollection = require('../../../collections/ConnectedUsersCollection');
const PublicAreasCollection = require('../../../collections/PublicAreasCollection');
const AnimationsController = require('../AnimationsController');
const ConsoleLogger = require('../../../utils/ConsoleLogger');
const logger = new ConsoleLogger();

class GetPublicAreaDataController {
    static async main(socket, io, data) {
        try {
            const user = ConnectedUsersCollection.getBySocketId(socket.id);
            if (!user) {
                throw new Error('User not found');
            }
            const publicArea = PublicAreasCollection.getByUid(user.currentArea.id);
            if (!publicArea) {
                throw new Error('Public area not found');
            }

            let players = [];
            for (const user of publicArea.users) {
                players.push({
                    id: user.socket.id,
                    x: user.currentAreaPosition.x,
                    y: user.currentAreaPosition.y,
                    z: user.currentAreaPosition.z,
                    animations: await AnimationsController.main(user)
                });
            }
            socket.emit('response:get_public_area_data', {
                players: players
            });
        } catch (err) {
            logger.log(`Error joining public area: ${err.message}`, 'error');
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = GetPublicAreaDataController;