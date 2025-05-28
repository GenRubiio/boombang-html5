
const GetPublicScenesController = require('../../../controllers/game/scenes/GetPublicScenesController');
const UserJoinPublicSceneController = require('../../../controllers/game/scenes/UserJoinPublicSceneController');
const GetPublicSceneUsersController = require('../../../controllers/game/scenes/GetPublicSceneUsersController');
const RequestSocketsEnum = require('../../../enums/RequestSocketsEnum');

module.exports = (socket, io) => {
    socket.on(RequestSocketsEnum.GET_PUBLIC_SCENES, () => {
        GetPublicScenesController.main(socket, io);
    });
    socket.on(RequestSocketsEnum.JOIN_PUBLIC_SCENE, async (data) => {
        UserJoinPublicSceneController.main(socket, io, data);
    });
    socket.on(RequestSocketsEnum.GET_PUBLIC_SCENE_USERS, async (data) => {
        GetPublicSceneUsersController.main(socket, io, data);
    });
};