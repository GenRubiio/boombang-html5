const CreatePrivateSceneController = require('../../../controllers/game/private-scenes/CreatePrivateSceneController');
const JoinPrivateSceneController = require('../../../controllers/game/private-scenes/JoinPrivateSceneController');
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.PRIVATE_SCENE_CREATE, async (data) => {
        CreatePrivateSceneController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.JOIN_PRIVATE_SCENE, async (data) => {
        JoinPrivateSceneController.main(socket, io, data);
    });
};