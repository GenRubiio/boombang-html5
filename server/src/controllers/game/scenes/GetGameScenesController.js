
const UpdateGameScenesController = require('../lobby/UpdateGameScenesController');
const DisconnectUserController = require('../../connection/DisconnectUserController');
const Log = require('../../../utils/Log');

class GetGameScenesController {
    static async main(socket, io) {
        try {
            UpdateGameScenesController.main(io);
        } catch (err) {
            Log.error('Error in GetGameScenesController: ' + err);
            DisconnectUserController.main(socket, io);
            socket.emit('error_critical');
        }
    }
}

module.exports = GetGameScenesController;