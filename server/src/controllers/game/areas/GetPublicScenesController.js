
const UpdatePublicScenesController = require('../lobby/UpdatePublicScenesController');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');

class GetPublicScenesController {
    static async main(socket, io) {
        try {
            UpdatePublicScenesController.main(io);
        } catch (err) {
            Log.error('Error in GetPublicScenesController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = GetPublicScenesController;