const CreatePrivateSceneController = require('../../../controllers/game/private-scenes/CreatePrivateSceneController');
const JoinPrivateSceneController = require('../../../controllers/game/private-scenes/JoinPrivateSceneController');
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');
const PutItemPrivateSceneController = require('../../../controllers/game/private-scenes/PutItemPrivateSceneController');
const RemoveItemPrivateSceneController = require('../../../controllers/game/private-scenes/RemoveItemPrivateSceneController');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.PRIVATE_SCENE_CREATE, async (data) => {
        CreatePrivateSceneController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.JOIN_PRIVATE_SCENE, async (data) => {
        JoinPrivateSceneController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.SCENE_PUT_ITEM, async (data) => {
        PutItemPrivateSceneController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.SCENE_REMOVE_ITEM, async (data) => {
        RemoveItemPrivateSceneController.main(socket, io, data);
    });
};