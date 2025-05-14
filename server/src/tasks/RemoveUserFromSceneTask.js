
const ConsoleLogger = require('../utils/ConsoleLogger');
const logger = new ConsoleLogger();
const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');
const UpdatePublicScenesController = require('../controllers/game/lobby/UpdatePublicScenesController');
const RemoveSelectedUserTask = require('./RemoveSelectedUserTask');
const SceneTypesEnum = require('../enums/SceneTypesEnum');

class RemoveUserFromSceneTask {
    static main(scene, user, io) {
        try {
            if (!scene.containsUser(user)) {
                logger.log('User not in area', 'error');
                return;
            }
            console.log('RemoveUserFromSceneTask');
            user.emit(ResponseSocketsEnum.REMOVE_USER_SCENE);

            RemoveSelectedUserTask.main(user);

            scene.removeUser(user);
            user.cancelMovement();
            user.setArea(null);

            scene.emitToAllExcept(ResponseSocketsEnum.USER_LEFT_PUBLIC_SCENE, {
                socketId: user.socket.id
            }, user);

            if (scene.scene_type == SceneTypesEnum.PUBLIC_SCENE) {
                UpdatePublicScenesController.main(io);
            }
        }
        catch (err) {
            console.log(err);
            logger.log(`Error leaving public area: ${err.message}`, 'error');
        }
    }
}

module.exports = RemoveUserFromSceneTask;