
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');
const UpdatePublicAreasController = require('../controllers/game/lobby/UpdatePublicAreasController');
const RemoveSelectedUserTask = require('./RemoveSelectedUserTask');

class RemoveUserFromAreaTask {
    static main(publicArea, user, io) {
        try {
            console.log('RemoveUserFromAreaTask');
            user.emit(ResponseSocketsEnum.REMOVE_USER_AREA);

            RemoveSelectedUserTask.main(user);

            publicArea.removeUser(user);
            user.cancelMovement();
            user.setArea(null);

            publicArea.emitToAllExcept(ResponseSocketsEnum.USER_LEFT_PUBLIC_AREA, {
                socketId: user.socket.id
            }, user);

            UpdatePublicAreasController.main(io);
        }
        catch (err) {
            console.log(err);
            logger.log(`Error leaving public area: ${err.message}`, 'error');
        }
    }
}

module.exports = RemoveUserFromAreaTask;