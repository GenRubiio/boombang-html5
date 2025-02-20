
const UpdatePublicAreasController = require('../lobby/UpdatePublicAreasController');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');

class GetPublicAreasController {
    static async main(socket, io) {
        try {
            UpdatePublicAreasController.main(io);
        } catch (err) {
            Log.error('Error in GetPublicAreasController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = GetPublicAreasController;