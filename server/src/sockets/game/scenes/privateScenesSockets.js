const CreatePrivateSceneController = require('../../../controllers/game/private-scenes/CreatePrivateSceneController');
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.PRIVATE_SCENE_CREATE, async (data) => {
        CreatePrivateSceneController.main(socket, io, data);
    });
};