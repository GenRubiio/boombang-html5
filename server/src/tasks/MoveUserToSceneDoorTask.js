const ResponseSocketsEnum = require('../enums/ResponseSocketsEnum');

class MoveUserToSceneDoorTask {
    static main(scene, user) {
        try {
            let sceneDoorPosition = scene.startPosition;
            scene.emit(ResponseSocketsEnum.USER_UPDATE_POSITION, {
                socket_id: user.socket.id,
                position: sceneDoorPosition
            });
            user.cancelMovement();
            user.currentAreaPosition = sceneDoorPosition;
            user.finalTarget = null;
        }
        catch (err) {
            console.log(err);
        }
    }
}

module.exports = MoveUserToSceneDoorTask;