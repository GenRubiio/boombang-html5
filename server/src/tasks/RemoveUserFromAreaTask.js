
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');
const UpdatePublicScenesController = require('../controllers/game/lobby/UpdatePublicScenesController');
const RemoveSelectedUserTask = require('./RemoveSelectedUserTask');

class RemoveUserFromAreaTask {
    static main(publicArea, user, io) {
        try {
            if (!publicArea.containsUser(user)) {
                logger.log('User not in area', 'error');
                return;
            }
            console.log('RemoveUserFromAreaTask');
            user.emit(ResponseSocketsEnum.REMOVE_USER_SCENE);

            RemoveSelectedUserTask.main(user);

            publicArea.removeUser(user);
            user.cancelMovement();
            user.setArea(null);

            publicArea.emitToAllExcept(ResponseSocketsEnum.USER_LEFT_PUBLIC_SCENE, {
                socketId: user.socket.id
            }, user);

            UpdatePublicScenesController.main(io);
        }
        catch (err) {
            console.log(err);
            logger.log(`Error leaving public area: ${err.message}`, 'error');
        }
    }
}

module.exports = RemoveUserFromAreaTask;